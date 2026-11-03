export interface PlayerGameRecord {
  user: string;
  rating: number;
  postRating: number;
  diff: number;
  score: number;
  oppRating: number;
  berserk: number;
  oppBerserk: number;
}

export interface ParsedGame {
  gameId: string;
  event: string;
  timestamp: string;
  epoch: number;
  baseTime: number;
  isTourney: boolean;
  tourneyId: string;
  termination: string;
  white: PlayerGameRecord;
  black: PlayerGameRecord;
}

export interface ActiveSession {
  sessionId: string;
  player: string;
  startTime: number;
  lastTime: number;
  gameCount: number;
  netRating: number;
  lastGame: {
    gameId: string;
    timestamp: string;
    preRating: number;
    postRating: number;
    diff: number;
    score: number;
    ratingDiff: number;
    nearest100: number;
  };
}

export interface TourneyState {
  games: number;
  points: number;
  streak: number;
  lastTime: number;
}
