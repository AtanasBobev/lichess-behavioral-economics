import { ParsedGame, PlayerGameRecord } from './types';

/**
 * Parses raw PGN text blocks into structured game records.
 * Extracts time controls, ratings, scores, and move 1 clock annotations
 * to identify endogenous Berserk capacity sacrifices.
 */
export class PgnParser {
  private static clkRegex = /\[%clk\s+(\d+):(\d+):(\d+)\]/g;

  public static parseBlock(pgnText: string): ParsedGame | null {
    const lines = pgnText.split('\n');

    let site: string | null = null;
    let event: string | null = null;
    let utcDate: string | null = null;
    let utcTime: string | null = null;
    let whiteUser: string | null = null;
    let blackUser: string | null = null;
    let whiteElo: number | null = null;
    let blackElo: number | null = null;
    let whiteDiff = 0;
    let blackDiff = 0;
    let result: string | null = null;
    let timeControl: string | null = null;
    let termination: string | null = null;
    let firstMovesLine: string | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith('[Site ')) {
        site = this.extractTag(line);
      } else if (line.startsWith('[Event ')) {
        event = this.extractTag(line);
      } else if (line.startsWith('[UTCDate ')) {
        utcDate = this.extractTag(line);
      } else if (line.startsWith('[UTCTime ')) {
        utcTime = this.extractTag(line);
      } else if (line.startsWith('[White ')) {
        whiteUser = this.extractTag(line);
      } else if (line.startsWith('[Black ')) {
        blackUser = this.extractTag(line);
      } else if (line.startsWith('[WhiteElo ')) {
        const val = parseInt(this.extractTag(line) || '', 10);
        whiteElo = isNaN(val) ? null : val;
      } else if (line.startsWith('[BlackElo ')) {
        const val = parseInt(this.extractTag(line) || '', 10);
        blackElo = isNaN(val) ? null : val;
      } else if (line.startsWith('[WhiteRatingDiff ')) {
        const val = parseInt((this.extractTag(line) || '').replace('+', ''), 10);
        whiteDiff = isNaN(val) ? 0 : val;
      } else if (line.startsWith('[BlackRatingDiff ')) {
        const val = parseInt((this.extractTag(line) || '').replace('+', ''), 10);
        blackDiff = isNaN(val) ? 0 : val;
      } else if (line.startsWith('[Result ')) {
        result = this.extractTag(line);
      } else if (line.startsWith('[TimeControl ')) {
        timeControl = this.extractTag(line);
      } else if (line.startsWith('[Termination ')) {
        termination = this.extractTag(line);
      } else if (line.startsWith('1. ') && !firstMovesLine) {
        firstMovesLine = line;
      }
    }

    if (!whiteUser || !blackUser || whiteElo === null || blackElo === null || !utcDate || !utcTime) {
      return null;
    }

    const isoDate = utcDate.replace(/\./g, '-');
    const timestampStr = `${isoDate}T${utcTime}Z`;
    const epoch = new Date(timestampStr).getTime();
    if (isNaN(epoch)) return null;

    let wScore = 0.5;
    let bScore = 0.5;
    if (result === '1-0') {
      wScore = 1.0;
      bScore = 0.0;
    } else if (result === '0-1') {
      wScore = 0.0;
      bScore = 1.0;
    }

    let baseSec = 0;
    if (timeControl && timeControl.includes('+')) {
      const parts = timeControl.split('+');
      baseSec = parseInt(parts[0], 10) || 0;
    }

    let wBerserk = 0;
    let bBerserk = 0;
    if (firstMovesLine && baseSec >= 60) {
      this.clkRegex.lastIndex = 0;
      const clks: number[] = [];
      let match: RegExpExecArray | null;
      while ((match = this.clkRegex.exec(firstMovesLine)) !== null && clks.length < 2) {
        const sec = parseInt(match[1], 10) * 3600 + parseInt(match[2], 10) * 60 + parseInt(match[3], 10);
        clks.push(sec);
      }
      if (clks.length >= 2) {
        const threshold = Math.floor(baseSec / 2) + 2;
        if (clks[0] <= threshold) wBerserk = 1;
        if (clks[1] <= threshold) bBerserk = 1;
      }
    }

    const gameId = site ? site.split('/').pop() || 'unknown' : 'unknown';
    const isTourney = !!(event && (event.toLowerCase().includes('arena') || event.toLowerCase().includes('tournament')));
    const tourneyId = event || 'casual';

    const white: PlayerGameRecord = {
      user: whiteUser,
      rating: whiteElo,
      postRating: whiteElo + whiteDiff,
      diff: whiteDiff,
      score: wScore,
      oppRating: blackElo,
      berserk: wBerserk,
      oppBerserk: bBerserk,
    };

    const black: PlayerGameRecord = {
      user: blackUser,
      rating: blackElo,
      postRating: blackElo + blackDiff,
      diff: blackDiff,
      score: bScore,
      oppRating: whiteElo,
      berserk: bBerserk,
      oppBerserk: wBerserk,
    };

    return {
      gameId,
      event: event || '',
      timestamp: timestampStr,
      epoch,
      baseTime: baseSec,
      isTourney,
      tourneyId,
      termination: termination || 'Normal',
      white,
      black,
    };
  }

  private static extractTag(line: string): string | null {
    const start = line.indexOf('"');
    const end = line.lastIndexOf('"');
    if (start !== -1 && end > start) {
      return line.substring(start + 1, end);
    }
    return null;
  }
}
