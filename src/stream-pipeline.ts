import { spawn } from 'child_process';
import * as readline from 'readline';
import { PgnParser } from './pgn-parser';
import { SessionTracker } from './session-tracker';

/**
 * Main streaming pipeline entrypoint.
 * Reads compressed .pgn.zst dumps through an OS pipe, passes game blocks
 * to the PGN parser, and routes structured observations to SessionTracker.
 */
async function runPipeline() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  const outputIdx = args.indexOf('--output');
  const zstdIdx = args.indexOf('--zstd');
  const maxIdx = args.indexOf('--max-games');

  const inputFile = inputIdx !== -1 ? args[inputIdx + 1] : 'sample.pgn.zst';
  const outputDir = outputIdx !== -1 ? args[outputIdx + 1] : './data';
  const zstdBin = zstdIdx !== -1 ? args[zstdIdx + 1] : 'zstd';
  const maxGames = maxIdx !== -1 ? parseInt(args[maxIdx + 1], 10) : 0;

  console.log('='.repeat(70));
  console.log('LICHESS ECONOMETRIC STREAMING PIPELINE (TYPESCRIPT)');
  console.log('='.repeat(70));
  console.log(`Input:       ${inputFile}`);
  console.log(`Output:      ${outputDir}`);
  console.log(`Max Games:   ${maxGames > 0 ? maxGames.toLocaleString() : 'Unlimited'}`);
  console.log('='.repeat(70));

  const tracker = new SessionTracker(outputDir, 45);

  const zstd = spawn(zstdBin, ['-dc', inputFile], {
    stdio: ['ignore', 'pipe', 'inherit'],
    windowsHide: true,
  });

  const rl = readline.createInterface({
    input: zstd.stdout,
    crlfDelay: Infinity,
  });

  let currentLines: string[] = [];
  let gameCount = 0;
  const startTime = Date.now();

  for await (const line of rl) {
    if (line.startsWith('[Event ') && currentLines.length > 0) {
      const parsed = PgnParser.parseBlock(currentLines.join('\n'));
      if (parsed) {
        tracker.processGame(parsed);
        gameCount++;
      }
      currentLines = [];

      if (gameCount % 100000 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = Math.round(gameCount / elapsed);
        console.log(`[Stream] ${gameCount.toLocaleString()} games | ${rate.toLocaleString()} g/s | Q1: ${tracker.totalQ1Obs.toLocaleString()} | Q2: ${tracker.totalQ2Obs.toLocaleString()} | Q3: ${tracker.totalQ3Sessions.toLocaleString()} sessions`);
      }

      if (maxGames > 0 && gameCount >= maxGames) {
        break;
      }
    }
    currentLines.push(line);
  }

  if (currentLines.length > 0) {
    const parsed = PgnParser.parseBlock(currentLines.join('\n'));
    if (parsed) {
      tracker.processGame(parsed);
      gameCount++;
    }
  }

  zstd.kill();
  await tracker.close();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('='.repeat(70));
  console.log(`Processing complete: ${gameCount.toLocaleString()} games in ${totalTime}s`);
  console.log(`Contest observations (Q1):     ${tracker.totalQ1Obs.toLocaleString()}`);
  console.log(`Milestone observations (Q2):   ${tracker.totalQ2Obs.toLocaleString()}`);
  console.log(`Completed sessions (Q3):       ${tracker.totalQ3Sessions.toLocaleString()}`);
  console.log('='.repeat(70));
}

runPipeline().catch((err) => {
  console.error('Fatal pipeline error:', err);
  process.exit(1);
});
