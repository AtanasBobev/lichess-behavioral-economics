# Dynamic Reference Points, Strategic Gambles, and Cognitive Fatigue in High-Frequency Contests: Field Evidence from Online Chess

This repository contains the replication code, high-throughput streaming pipeline, econometric estimation scripts, and working paper manuscript for the empirical study on reference-dependent preferences, contest theory, and cognitive fatigue in online chess.

* **Working Paper:** [paper/Dynamic_Reference_Points_Chess_Economics.pdf](paper/Dynamic_Reference_Points_Chess_Economics.pdf)
* **Author:** Atanas Bobev (American University in Bulgaria)
* **Permanent DOI:** [10.5281/zenodo.23921614](https://doi.org/10.5281/zenodo.23921614)
* **JEL Classification:** D91, C93, D81, J22

---

## Abstract

Neoclassical models of labor supply and contest theory assume that forward-looking agents balance marginal effort costs against expected marginal payoffs. In competitive settings, decisions depend on backward-looking reference targets, emotional reactions to recent losses, and cognitive stamina. We analyze 3,000,000 competitive games, 5,999,360 post-game rating observations, and 1,561,866 playing sessions from the Lichess platform to track how goals, standings, and fatigue alter player decisions. 

We document five empirical findings:
1. **Milestone Bunching:** Players bunch above round-number rating milestones (1200 to 2100). A regression discontinuity design across 3,356,232 observations reveals that crossing a milestone increases the odds of session termination by 18.5% (coef = +0.1700, z = 33.91, p < 0.0001). Placebo tests at 50-point midpoints show no discontinuity.
2. **Asymmetric Stopping Rules:** Multi-game sessions end on a loss 53.48% of the time, compared to 42.71% on a win (p < 10^-300). Suffering an unexpected defeat against an opponent rated at least 100 points lower prolongs the session by 0.83 games (t = 24.35, p < 0.0001).
3. **The Tilt Spiral:** Sequential game analysis across 4,437,482 transitions reveals a persistent tilt penalty: losing game t reduces the win rate in game t+1 from 51.59% to 48.88% (coef = -0.0268, t = -57.36, p < 0.0001), despite the matchmaking algorithm pairing losing players against lower-rated opponents.
4. **Diurnal Stability:** Decomposing stopping behavior across all 24 hours of the day shows that the 53% terminal loss rate remains consistent globally, ruling out local bedtime artifacts.
5. **Contest Gambles:** In arena tournaments with convex streak multipliers, holding an active two-game winning streak suppresses the odds of sacrificing clock capacity (the Berserk decision) by 31.3% (coef = -0.3758, z = -28.91, p < 0.0001), showing strong loss aversion over accumulated multiplier capital.

---

## Empirical Findings Summary

| Question | Mechanism | Sample Size | Primary Estimate | Standard Error | Test Statistic | p-value |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| Q1: Contest Gambles | Streak Multiplier Active (S=1) | 464,356 | beta = -0.3758 | 0.0130 | z = -28.91 | < 0.0001 |
| Q2: Milestone RDD | Crossing Cutoff 1(R >= c) | 3,356,232 | tau = +0.1700 | 0.0050 | z = 33.91 | < 0.0001 |
| Q2: Density Bunching | Terminal Share Above 1500 | 32,380 | share = 55.71% | - | Exact Binomial | 6.74e-94 |
| Q3: Stopping Rule | Terminal Loss vs Win Share | 949,608 | 53.48% vs 42.71% | - | Exact Binomial | < 10^-300 |
| Q3: Loss Chasing | Upset Loss Session Effect | 1,561,866 | beta = +0.8311 | 0.0341 | t = 24.35 | < 0.0001 |
| Q4: The Tilt Spiral | Prior Game Loss Penalty | 4,437,482 | beta = -0.0268 | 0.0005 | t = -57.36 | < 0.0001 |

---

## Repository Structure

```text
├── analysis/                      # Python econometric replication scripts
│   ├── 01_milestones_bunching.py   # McCrary density tests, placebo midpoints, RDD logit
│   ├── 02_session_stopping.py     # Asymmetric stopping rules, upset loss prolongation
│   ├── 03_contest_theory.py       # Dynamic discrete choice logit for Berserk decisions
│   ├── 04_tilt_dynamics.py        # Lagged sequential game regressions and tilt penalty
│   ├── 05_blunder_latency.py      # Stockfish 19 UCI blunder deliberation latency
│   └── generate_figures.py        # Script to reproduce publication figures
├── figures/                       # High-resolution (300 DPI) publication figures
│   ├── fig1_bunching.png          # Density bunching at milestones 1500, 1800, 2000
│   ├── fig2_rdd_quit.png          # Discontinuous jump in quitting probability
│   ├── fig3_session_stopping.png  # Stopping outcome distributions and session CDFs
│   ├── fig4_berserk_contest.png   # Berserk choice curves across rating differentials
│   ├── fig5_blunder_latency.png   # Deliberation latency decay following blunders
│   ├── fig6_tilt_spiral.png       # Intra-session performance degradation
│   └── fig7_placebo_tests.png     # Placebo falsification at 50-point midpoints
├── paper/                         # Working paper manuscript and compiled PDF
│   ├── Dynamic_Reference_Points_Chess_Economics.pdf
│   └── manuscript.md
├── src/                           # High-throughput TypeScript streaming engine
│   ├── pgn-parser.ts              # PGN block tokenizer and move-1 clock extractor
│   ├── session-tracker.ts         # Session reconstruction and LRU memory manager
│   ├── stream-pipeline.ts         # Streaming runner coupled to Zstandard decompressor
│   └── types.ts                   # TypeScript interfaces and data models
├── package.json                   # Node.js and TypeScript project dependencies
├── tsconfig.json                  # TypeScript compiler configuration
└── README.md
```

---

## Prerequisites and Installation

### 1. TypeScript Streaming Pipeline

Requires Node.js (>= v18.0.0).

```bash
# Clone the repository
git clone https://github.com/AtanasBobev/lichess-behavioral-economics.git
cd lichess-behavioral-economics

# Install dependencies and build TypeScript
npm install
npm run build
```

### 2. Python Econometric Environment

Requires Python (>= 3.9) with standard scientific libraries:

```bash
pip install pandas numpy scipy statsmodels matplotlib
```

---

## Data Pipeline and Replication

### Streaming Raw Lichess Dumps

The streaming pipeline processes compressed `.pgn.zst` monthly dumps from [database.lichess.org](https://database.lichess.org/) with constant memory:

```bash
# Compile TypeScript to dist/
npm run build

# Stream directly from a Zstandard archive
node dist/stream-pipeline.js \
  --input /path/to/lichess_db_standard_rated_2026-10.pgn.zst \
  --output ./data \
  --zstd zstd \
  --max-games 3000000
```

The pipeline outputs three structured CSV datasets:
1. `data/q1_berserk_contest.csv`: Tournament game observations with running streak status and Berserk decisions.
2. `data/q2_rating_milestones.csv`: Pre- and post-game ratings with session quitting indicators.
3. `data/q3_session_stopping.csv`: Reconstructed session lengths, terminal game outcomes, and UTC hours.

### Running Econometric Estimations

To reproduce the regression tables and statistical tests reported in the paper:

```bash
# Question 1: Contest theory and Berserk capacity sacrifices
python analysis/03_contest_theory.py

# Question 2: Milestone bunching, placebo tests, and RDD logit
python analysis/01_milestones_bunching.py

# Question 3: Stopping rules, upset loss prolongation, and diurnal decomposition
python analysis/02_session_stopping.py

# Question 4: The tilt spiral and consecutive game performance degradation
python analysis/04_tilt_dynamics.py

# Question 5: Stockfish 19 UCI blunder deliberation latency
python analysis/05_blunder_latency.py
```

---

## Citation

```bibtex
@article{bobev2026dynamic,
  title={Dynamic Reference Points, Strategic Gambles, and Cognitive Fatigue in High-Frequency Contests: Field Evidence from Online Chess},
  author={Bobev, Atanas},
  journal={Working Paper Series},
  year={2026},
  doi={10.5281/zenodo.23921614},
  url={https://doi.org/10.5281/zenodo.23921614}
}
```

---

## License

* Code: [MIT License](LICENSE)
* Working Paper: Creative Commons Attribution 4.0 International (CC BY 4.0)
