import * as fs from 'fs';
import * as path from 'path';
import { ActiveSession, ParsedGame, PlayerGameRecord, TourneyState } from './types';

/**
 * Tracks player sessions, streak multipliers, and contest standings.
 * Streams econometric datasets directly to disk with constant memory bounds.
 */
export class SessionTracker {
  private outputDir: string;
  private sessionTimeoutMs: number;

  private q1Stream: fs.WriteStream;
  private q2Stream: fs.WriteStream;
  private q3Stream: fs.WriteStream;

  private activeSessions: Map<string, ActiveSession> = new Map();
  private tourneyStates: Map<string, TourneyState> = new Map();

  public totalGamesProcessed = 0;
  public totalQ1Obs = 0;
  public totalQ2Obs = 0;
  public totalQ3Sessions = 0;

  constructor(outputDir: string, sessionTimeoutMinutes = 45) {
    this.outputDir = outputDir;
    this.sessionTimeoutMs = sessionTimeoutMinutes * 60 * 1000;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    this.q1Stream = fs.createWriteStream(path.join(outputDir, 'q1_berserk_contest.csv'), { flags: 'w' });
    this.q2Stream = fs.createWriteStream(path.join(outputDir, 'q2_rating_milestones.csv'), { flags: 'w' });
    this.q3Stream = fs.createWriteStream(path.join(outputDir, 'q3_session_stopping.csv'), { flags: 'w' });

    this.q1Stream.write('tourney_id,player,game_id,timestamp,tourney_game_num,cum_points,running_streak,berserk,opp_berserk,rating_diff,score,base_time\n');
    this.q2Stream.write('player,game_id,timestamp,pre_rating,post_rating,rating_diff,score,is_session_quit,session_game_num,milestone_100,dist_to_milestone,above_milestone\n');
    this.q3Stream.write('player,session_id,start_time,end_time,session_length,final_score,final_upset_loss,net_rating_change,end_hour_utc\n');
  }

  public processGame(game: ParsedGame): void {
    this.totalGamesProcessed++;

    this.updatePlayer(game.white.user, game.white, game);
    this.updatePlayer(game.black.user, game.black, game);

    if (game.isTourney && game.tourneyId) {
      this.updateTourney(game.tourneyId, game.white.user, game.white, game);
      this.updateTourney(game.tourneyId, game.black.user, game.black, game);
    }

    if (this.totalGamesProcessed % 50000 === 0) {
      this.pruneStaleRecords(game.epoch);
    }
  }

  private updatePlayer(username: string, pData: PlayerGameRecord, game: ParsedGame): void {
    const postRating = pData.postRating;
    const nearest100 = Math.round(postRating / 100) * 100;
    const ratingDiff = pData.rating - pData.oppRating;

    let session = this.activeSessions.get(username);

    if (!session) {
      session = {
        sessionId: `${username}_${game.epoch}`,
        player: username,
        startTime: game.epoch,
        lastTime: game.epoch,
        gameCount: 1,
        netRating: pData.diff,
        lastGame: {
          gameId: game.gameId,
          timestamp: game.timestamp,
          preRating: pData.rating,
          postRating,
          diff: pData.diff,
          score: pData.score,
          ratingDiff,
          nearest100,
        },
      };
      this.activeSessions.set(username, session);
    } else {
      const pause = game.epoch - session.lastTime;
      if (pause > this.sessionTimeoutMs) {
        this.flushSession(session);
        session = {
          sessionId: `${username}_${game.epoch}`,
          player: username,
          startTime: game.epoch,
          lastTime: game.epoch,
          gameCount: 1,
          netRating: pData.diff,
          lastGame: {
            gameId: game.gameId,
            timestamp: game.timestamp,
            preRating: pData.rating,
            postRating,
            diff: pData.diff,
            score: pData.score,
            ratingDiff,
            nearest100,
          },
        };
        this.activeSessions.set(username, session);
      } else {
        const lg = session.lastGame;
        const dist = lg.postRating - lg.nearest100;
        const above = dist >= 0 ? 1 : 0;
        this.q2Stream.write(`${username},${lg.gameId},${lg.timestamp},${lg.preRating},${lg.postRating},${lg.diff},${lg.score},0,${session.gameCount},${lg.nearest100},${dist},${above}\n`);
        this.totalQ2Obs++;

        session.lastTime = game.epoch;
        session.gameCount += 1;
        session.netRating += pData.diff;
        session.lastGame = {
          gameId: game.gameId,
          timestamp: game.timestamp,
          preRating: pData.rating,
          postRating,
          diff: pData.diff,
          score: pData.score,
          ratingDiff,
          nearest100,
        };
      }
    }
  }

  private flushSession(session: ActiveSession): void {
    const lg = session.lastGame;
    const dist = lg.postRating - lg.nearest100;
    const above = dist >= 0 ? 1 : 0;
    this.q2Stream.write(`${session.player},${lg.gameId},${lg.timestamp},${lg.preRating},${lg.postRating},${lg.diff},${lg.score},1,${session.gameCount},${lg.nearest100},${dist},${above}\n`);
    this.totalQ2Obs++;

    const isUpsetLoss = lg.score === 0.0 && lg.ratingDiff >= 100 ? 1 : 0;
    const startDate = new Date(session.startTime).toISOString();
    const endDate = new Date(session.lastTime).toISOString();
    const endHour = new Date(session.lastTime).getUTCHours();

    this.q3Stream.write(`${session.player},${session.sessionId},${startDate},${endDate},${session.gameCount},${lg.score},${isUpsetLoss},${session.netRating},${endHour}\n`);
    this.totalQ3Sessions++;
  }

  private updateTourney(tourneyId: string, username: string, pData: PlayerGameRecord, game: ParsedGame): void {
    const key = `${tourneyId}:${username}`;
    let state = this.tourneyStates.get(key);
    if (!state) {
      state = { games: 0, points: 0, streak: 0, lastTime: game.epoch };
      this.tourneyStates.set(key, state);
    }

    state.lastTime = game.epoch;
    state.games += 1;
    const rDiff = pData.rating - pData.oppRating;

    this.q1Stream.write(`${tourneyId},${username},${game.gameId},${game.timestamp},${state.games},${state.points},${state.streak},${pData.berserk},${pData.oppBerserk},${rDiff},${pData.score},${game.baseTime}\n`);
    this.totalQ1Obs++;

    if (pData.score === 1.0) {
      state.streak += 1;
      let pts = state.streak >= 3 ? 4 : 2;
      if (pData.berserk) pts += 1;
      state.points += pts;
    } else if (pData.score === 0.5) {
      state.streak = 0;
      state.points += 1;
    } else {
      state.streak = 0;
    }
  }

  private pruneStaleRecords(currentEpoch: number): void {
    const maxIdleMs = 4 * 60 * 60 * 1000;
    for (const [username, sess] of this.activeSessions.entries()) {
      if (currentEpoch - sess.lastTime > maxIdleMs) {
        this.flushSession(sess);
        this.activeSessions.delete(username);
      }
    }
    const maxTourneyIdleMs = 6 * 60 * 60 * 1000;
    for (const [key, state] of this.tourneyStates.entries()) {
      if (currentEpoch - state.lastTime > maxTourneyIdleMs) {
        this.tourneyStates.delete(key);
      }
    }
  }

  public async close(): Promise<void> {
    for (const session of this.activeSessions.values()) {
      this.flushSession(session);
    }
    this.activeSessions.clear();
    this.tourneyStates.clear();

    await Promise.all([
      new Promise<void>((res) => this.q1Stream.end(() => res())),
      new Promise<void>((res) => this.q2Stream.end(() => res())),
      new Promise<void>((res) => this.q3Stream.end(() => res())),
    ]);
  }
}
