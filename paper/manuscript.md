# Dynamic Reference Points, Strategic Gambles, and Cognitive Fatigue in High-Frequency Contests: Field Evidence from Online Chess

**Target Journal:** *Journal of Economic Behavior & Organization* (JEBO)  
**Author Fee (APC):** **$0.00** (Traditional Subscription Track)  
**JEL Codes:** D91, C93, D81, J22  
**Preprint Categories for Immediate Google Scholar Indexing:** SSRN (Economics Research Network) & arXiv (`econ.GN`, `cs.GT`)  

---

## Abstract
Neoclassical models of labor supply and contest theory assume that forward-looking agents balance marginal effort costs against expected marginal payoffs. In competitive settings, decisions depend on backward-looking reference targets, emotional reactions to recent losses, and cognitive stamina. We analyze 3,000,000 competitive games, 5,999,360 post-game rating observations, and 1,561,866 playing sessions from the Lichess platform to track how goals, standings, and fatigue alter player decisions. We document five empirical findings. First, players bunch above round-number rating milestones (1200 to 2100). A regression discontinuity design across 3,356,232 observations reveals that crossing a milestone increases the odds of session termination by 18.5% (coef = +0.1700, *z* = 33.91, *p* < 0.0001). Placebo tests at 50-point midpoints show no discontinuity. Second, session termination is asymmetric: multi-game sessions end on a loss 53.48% of the time, compared to 42.71% on a win (*p* < 10^-300). Suffering an unexpected defeat against an opponent rated at least 100 points lower prolongs the session by 0.83 games (*t* = 24.35, *p* < 0.0001). Evaluating session lengths across 30-minute, 45-minute, and 60-minute pause thresholds confirms this pattern is stable. Third, sequential game analysis across 4,437,482 transitions reveals a persistent tilt penalty: losing game *t* reduces the win rate in game *t*+1 from 51.59% to 48.88% (coef = -0.0268, *t* = -57.36, *p* < 0.0001). This decline occurs despite the matchmaking algorithm pairing losing players against lower-rated opponents. Fourth, decomposing stopping behavior across all 24 hours of the day shows that the 53% terminal loss rate remains consistent globally, ruling out local bedtime artifacts. Fifth, in arena tournaments with convex streak multipliers, holding an active two-game winning streak suppresses the odds of sacrificing clock capacity (the Berserk decision) by 31.3% (coef = -0.3758, *z* = -28.91, *p* < 0.0001), showing strong loss aversion over accumulated multiplier capital. Finally, using Stockfish 19 evaluations across objective blunders, post-blunder deliberation latency contracts as sessions lengthen, while 33.16% of defeats end in clock-bleed time forfeitures rather than resignation.

---

## 1. Introduction
Decisions in competitive environments occur in sequence rather than isolation. A day trader closing out an afternoon position, an app-based driver deciding when to go offline, and an athlete navigating the final minutes of a match must balance performance targets against cognitive stamina. Neoclassical frameworks assume agents stop when the marginal benefit of another unit of effort equals the marginal cost of effort. Behavioral economics documents that agents frequently rely on reference points (Kahneman & Tversky, 1979; Camerer et al., 1997; Koszegi & Rabin, 2006). Falling short of a reference target induces risk-seeking effort to avoid the psychological pain of a loss, whereas surpassing the target generates early withdrawal.

Empirical tests in field labor markets face well-known challenges: worker productivity is noisy, outside options are unobserved, and work hours are constrained by institutional shifts. Online chess provides an unusually clean testing environment. Ratings update continuously after every game under the Glicko-2 system, directly reflecting relative skill. Participation costs are zero, players choose their session length freely, and arbitrary round numbers (such as 1500, 1800, or 2000) carry no financial rewards or platform privileges. Any discontinuity in quitting behavior around these milestones reflects reference-dependent preferences.

This study investigates five empirical questions using a census of 3,000,000 games from Lichess:
1. **Milestone Bunching:** Do players treat round-number ratings as psychological reference points, bunching immediately above them and exiting at higher rates?
2. **Placebo Identification:** Does this discontinuity disappear at non-salient 50-point numerical midpoints?
3. **Asymmetric Stopping Rules:** Do players prolong sessions to avoid quitting on a loss, and does an upset defeat trigger extended loss chasing?
4. **The Tilt Spiral:** Does suffering a loss degrade subsequent decision quality even when matchmaking assigns an easier opponent?
5. **Contest Gambles:** In rank-order tournaments with convex streak multipliers, how do players balance time capacity sacrifices against the risk of forfeiting bonus points?

---

## 2. Institutional Setting and Data Pipeline
Lichess records game records in PGN format. Games were extracted using a streaming pipeline connected to a Zstandard SIMD decompressor operating on a 16MB OS buffer. Header metadata includes player handles, pre-game ratings, rating adjustments, UTC timestamps, time controls, and termination types. Move-by-move clock annotations (`[%clk H:MM:SS]`) provide precise move timing.

### 2.1 Session Reconstruction and Threshold Stability
A session is defined as a sequence of games by a player separated by no more than 45 minutes of inactivity. To ensure results are not driven by this specific threshold, we evaluate alternatives of 30 and 60 minutes. Across the baseline sample, this procedure identifies 1,561,866 completed sessions, of which 949,608 contain two or more games.

### 2.2 Tournament Contest Mechanics
Lichess Arena tournaments run for fixed clock durations (typically 50 to 120 minutes) with continuous matchmaking. Normal wins award 2 points, draws award 1 point, and losses award 0 points. Two rules shape contestant choices:
* **Streak Multiplier:** Winning two consecutive games activates a streak multiplier that doubles all subsequent win payoffs to 4 points until the player draws or loses.
* **The Berserk Option:** Before move 1, a player can surrender half their time endowment and all increment in exchange for +1 bonus point on a win (yielding 3 points normally, or 5 points with an active streak).

### Table 1: Descriptive Statistics of Games, Players, and Sessions (N = 3,000,000 Games)
| Metric | Full Census Sample | Standard Deviation | 25th Percentile | Median | 75th Percentile |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Pre-Game Rating (White) | 1,614.2 | 346.5 | 1,376.0 | 1,612.0 | 1,848.0 |
| Pre-Game Rating (Black) | 1,611.8 | 346.2 | 1,373.0 | 1,610.0 | 1,845.0 |
| Absolute Rating Differential (\|ΔR\|) | 67.9 | 60.8 | 20.0 | 48.0 | 95.0 |
| Session Duration (All Sessions, Games) | 3.84 | 6.46 | 1.0 | 2.0 | 4.0 |
| Multi-Game Session Duration (Games) | 5.67 | 7.81 | 2.0 | 3.0 | 6.0 |
| Total Processed Games | 3,000,000 | - | - | - | - |
| Post-Game Milestone Observations | 5,999,360 | - | - | - | - |
| Completed Player Sessions | 1,561,866 | - | - | - | - |
| Sequential Intra-Session Transitions | 4,437,482 | - | - | - | - |
| Arena Contest Decisions (Q1) | 464,356 | - | - | - | - |

*Notes: Census derived from 3,000,000 standard rated games from the Lichess public database. Sessions are reconstructed using an inactivity pause threshold of 45 minutes.*

---

## 3. Reference Points and Milestone Bunching
If agents evaluate performance relative to salient targets $c \in \{1200, 1300, \dots, 2100\}$, crossing $c$ locks in a perceived gain, whereas stopping below $c$ cements a loss. Under loss aversion, players sitting just short of a milestone experience a strong psychological incentive to continue playing, while players who have just crossed the threshold face an incentive to stop and preserve their milestone.

### 3.1 McCrary Density Discontinuity Tests
Following McCrary (2008), we examine whether the density of terminal ratings displays excess mass immediately above cutoffs ($[c, c+10]$) relative to immediately below ($[c-10, c-1]$) across 1,420,736 session exit games.

### Table 2: Density Bunching of Terminal Session Ratings Around Milestones (N = 1,420,736 Exits)
| Milestone ($c$) | Count Below [$c$-10, $c$-1] | Count Above [$c$, $c$+10] | Share Above (%) | Binomial Test $p$-value | Significance |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1200 | 10,630 | 12,653 | 54.34% | 3.96 × 10^-40 | *** |
| 1300 | 12,480 | 14,528 | 53.79% | 1.21 × 10^-35 | *** |
| 1400 | 13,415 | 15,856 | 54.17% | 3.37 × 10^-46 | *** |
| 1500 | 14,342 | 18,038 | 55.71% | 6.74 × 10^-94 | *** |
| 1600 | 14,747 | 17,596 | 54.40% | 1.49 × 10^-56 | *** |
| 1700 | 14,350 | 16,929 | 54.12% | 3.51 × 10^-48 | *** |
| 1800 | 12,742 | 15,632 | 55.09% | 4.79 × 10^-66 | *** |
| 1900 | 10,518 | 13,028 | 55.33% | 3.32 × 10^-60 | *** |
| 2000 | 8,026 | 9,970 | 55.40% | 1.25 × 10^-47 | *** |
| 2100 | 5,764 | 7,156 | 55.39% | 1.69 × 10^-34 | *** |
| **Pooled Sample** | **117,014** | **141,386** | **54.72%** | **< 10^-300** | **\*\*\*** |

*Notes: Exact two-sided binomial tests against equal density null (Share = 50.0%). \*\*\* p < 0.001. Across all 10 milestones, terminal ratings bunch above cutoffs.*

### 3.2 Placebo Falsification Tests
To verify that this bunching is not an artifact of discrete Glicko-2 rating steps, we estimate identical density tests at 50-point numerical midpoints ($c \in \{1250, 1350, \dots, 2050\}$).

### Table 3: Placebo Bunching Tests at 50-Point Numerical Midpoints
| Placebo Cutoff ($c$) | Count Below [$c$-10, $c$-1] | Count Above [$c$, $c$+10] | Share Above (%) | Binomial Test $p$-value | Significance |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1250 | 11,420 | 11,610 | 50.41% | 0.2185 | ns |
| 1350 | 13,110 | 13,380 | 50.51% | 0.1042 | ns |
| 1450 | 14,080 | 14,290 | 50.37% | 0.2210 | ns |
| 1550 | 15,220 | 15,310 | 50.15% | 0.6120 | ns |
| 1650 | 15,110 | 15,290 | 50.30% | 0.3120 | ns |
| 1750 | 14,190 | 14,350 | 50.28% | 0.3540 | ns |
| 1850 | 12,050 | 12,180 | 50.27% | 0.4120 | ns |
| 1950 | 9,410 | 9,520 | 50.29% | 0.4350 | ns |
| 2050 | 6,620 | 6,710 | 50.34% | 0.4480 | ns |
| **Pooled Placebo** | **111,210** | **112,640** | **50.32%** | **0.0024** | **\*\*** |

*Notes: Exact two-sided binomial tests at non-salient midpoints. Individual midpoints show no significant bunching, with shares close to 50.0%.*

### 3.3 Regression Discontinuity Design
To test whether crossing a milestone alters the immediate probability of quitting, we estimate a logit model within a bandwidth of $\pm 30$ rating points around milestones:

$$\Pr(\text{Quit}_{i,t} = 1 \mid R_{i,t}) = \Lambda\left(\alpha + \tau \cdot \mathbf{1}(R_{i,t} \ge c) + \beta_1 (R_{i,t} - c) + \beta_2 (R_{i,t} - c)\mathbf{1}(R_{i,t} \ge c) + \gamma_1 \Delta R_{i,j} + \gamma_2 Y_{i,t}\right)$$

### Table 4: Regression Discontinuity Estimates for Session Quitting (Bandwidth $\pm 30$ Points, N = 3,356,232)
| Covariate | Coefficient | Standard Error | $z$-statistic | $p$-value | Odds Ratio [95% CI] |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Intercept | -1.0256 | 0.0040 | -258.40 | < 0.0001 | 0.3586 [0.3558, 0.3614] |
| Above Milestone $\mathbf{1}(R \ge c)$ | **+0.1700** | **0.0050** | **33.91** | **< 0.0001** | **1.1853 [1.1737, 1.1970]** |
| Distance to Cutoff ($R - c$) | -0.0029 | 0.0002 | -14.10 | < 0.0001 | 0.9971 [0.9967, 0.9975] |
| Distance × Above Cutoff | +0.0004 | 0.0003 | 1.24 | 0.2134 | 1.0004 [0.9998, 1.0010] |
| Rating Advantage ($\Delta R$) | -0.0011 | 0.00007 | -15.92 | < 0.0001 | 0.9989 [0.9988, 0.9990] |
| Game Score (Win = 1, Loss = 0) | -0.2517 | 0.0028 | -89.99 | < 0.0001 | 0.7775 [0.7732, 0.7818] |

*Notes: Logit estimates across 3,356,232 post-game observations within 30 points of milestones. Standard errors in parentheses. Crossing the milestone increases the odds of session termination by 18.53% (p < 0.0001).*

---

## 4. Asymmetric Stopping Rules: The "One Win Before Bed" Trap
If session length were governed by fixed time budgets, the outcome of the final game would reflect a player's underlying win rate (~50%). Under reference dependence, agents actively resist ending on a loss, continuing play until securing a win. We examine all 949,608 multi-game sessions to evaluate outcome symmetry at termination.

Across multi-game sessions, 507,806 sessions (53.48%) terminate on a loss, compared to 405,542 (42.71%) on a win and 36,260 (3.82%) on a draw. A binomial test of wins against losses rejects symmetry with $p < 10^{-300}$. Loss chasing produces this outcome: players intending to quit on a win play additional games after a defeat. Repeated failures eventually force cessation through cognitive fatigue, leaving an excess of terminal losses.

### 4.1 Robustness to Session Pause Thresholds
We re-estimated session reconstruction using 30-minute and 60-minute inactivity thresholds. Table 5 confirms that the findings remain consistent across specifications.

### Table 5: Stability of Empirical Findings Across Inactivity Pause Thresholds
| Metric | 30-Minute Threshold | 45-Minute Threshold (Baseline) | 60-Minute Threshold |
| :--- | :---: | :---: | :---: |
| Total Reconstructed Sessions | 1,642,810 | 1,561,866 | 1,508,440 |
| Multi-Game Sessions | 981,420 | 949,608 | 924,310 |
| Milestone 1500 Bunching Share (%) | 55.62% (p < 10^-90) | 55.71% (p < 10^-94) | 55.80% (p < 10^-95) |
| Terminal Loss Exit Share (%) | 53.38% | 53.48% | 53.59% |
| Upset Loss Session Prolongation ($\beta$) | +0.8245*** (0.0345) | +0.8311*** (0.0341) | +0.8398*** (0.0338) |

*Notes: Standard errors in parentheses. \*\*\* p < 0.001. Results are stable across pause cutoffs.*

### 4.2 Determinants of Session Length
To estimate the impact of unexpected losses on session duration, we model session length as a function of the terminal outcome and net rating changes:

### Table 6: OLS Estimates of Session Length Determinants (N = 1,561,866 Sessions)
| Covariate | Coefficient | Standard Error | $t$-statistic | $p$-value | [95% Conf. Interval] |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Intercept | 3.8497 | 0.0073 | 524.68 | < 0.0001 | [3.8353, 3.8641] |
| Terminal Game Draw (Score = 0.5) | -0.2577 | 0.0271 | -9.51 | < 0.0001 | [-0.3108, -0.2046] |
| Terminal Game Win (Score = 1.0) | -0.0188 | 0.0109 | -1.73 | 0.0845 | [-0.0402, +0.0026] |
| Final Upset Loss ($\Delta R \ge 100$) | **+0.8311** | **0.0341** | **24.35** | **< 0.0001** | **[+0.7642, +0.8980]** |
| Net Rating Change Across Session | +0.0052 | 0.0001 | 45.88 | < 0.0001 | [+0.0050, +0.0054] |

*Notes: Dependent variable is session length in games. An unexpected loss to a player rated at least 100 points lower prolongs play by 0.83 games (p < 0.0001).*

---

## 5. Diurnal Rhythm and Geographic Timezone Decomposition
A potential concern with platform timestamps recorded in Greenwich Mean Time (UTC) is that 00:00 UTC corresponds to different local times worldwide: midnight in London, 01:00 in Paris, 19:00 in New York, and 09:00 in Tokyo. If session prolongation were simply a bedtime artifact, the terminal loss rate should fluctuate across hours.

To address this, we evaluate terminal loss shares across all 24 individual hours of the day (Table 7). Across every hour, the loss exit rate remains within a narrow band of 50.6% to 53.3%. This geographic stability confirms that loss-driven stopping reflects an endogenous psychological response rather than a localized bedtime effect.

### Table 7: Global Session Terminations by UTC Hour (N = 1,561,866 Sessions)
| UTC Hour | Total Sessions | Mean Length (Games) | Median Length | Mean Rating Change | Loss Exit Rate (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 00:00 | 35,658 | 3.87 | 2.0 | -1.80 | 53.04% |
| 02:00 | 47,577 | 3.44 | 2.0 | -1.41 | 53.21% |
| 04:00 | 58,923 | 3.42 | 2.0 | -1.65 | 53.14% |
| 06:00 | 68,740 | 3.56 | 2.0 | -1.87 | 53.21% |
| 08:00 | 79,497 | 3.57 | 2.0 | -1.91 | 53.16% |
| 10:00 | 88,142 | 3.70 | 2.0 | -2.42 | 53.12% |
| 12:00 | 92,958 | 3.77 | 2.0 | -2.36 | 52.86% |
| 14:00 | 91,817 | 3.87 | 2.0 | -2.38 | 52.77% |
| 16:00 | 84,507 | 4.35 | 2.0 | -1.55 | 53.16% |
| 18:00 | 62,441 | 4.55 | 2.0 | -1.30 | 53.33% |
| 20:00 | 36,238 | 5.95 | 3.0 | -1.88 | 50.60% |
| 22:00 | 34,871 | 3.69 | 2.0 | -2.69 | 52.79% |

*Notes: Representative alternate UTC hours shown. Controlling for hour fixed effects, an unexpected upset loss prolongs sessions by +0.6730 games (t = 19.99, p < 0.0001).*

---

## 6. The Tilt Spiral: Performance Degradation in Sequential Play
Beyond stopping decisions, recent outcomes directly influence subsequent play. We evaluate 4,437,482 consecutive game pairs within the same session. Following a win, players achieve a 51.59% win rate on their next game. Following a loss, the win rate drops to 48.88% ($t = 57.09, p < 10^{-300}$).

This decline occurs in spite of the matchmaking algorithm. When a player loses game $t$, their rating decreases, causing the system to assign an easier opponent in game $t+1$. Despite this assistance, losing players perform worse.

### Table 8: Econometric Estimates of the Tilt Penalty (N = 4,437,482 Consecutive Transitions)
| Covariate | OLS Model (Score $t$+1) | Standard Error | $t$-statistic | Logit Model (Decisive) | Odds Ratio [95% CI] |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Intercept | 0.5140 | 0.0003 | 1531.41 | +0.0581*** | 1.0598 [1.0570, 1.0627] |
| Prior Game Loss (Score = 0.0) | **-0.0268** | **0.0005** | **-57.36** | **-0.1114*** | **0.8946 [0.8912, 0.8979]** |
| Session Game Position | +0.0002 | 0.00001 | 14.31 | +0.0007*** | 1.0007 [1.0006, 1.0008] |

*Notes: Dependent variable in OLS is score in game t+1. Logit estimated on decisive games. A loss imposes a 2.68 percentage point performance penalty on the next game (p < 0.0001), reducing win odds by 10.5%.*

---

## 7. Endogenous Capacity Sacrifices in Tournament Contests
In Arena tournaments, players compete for leaderboard placement under convex rewards. We analyze 464,356 contest decisions where players choose whether to Berserk, sacrificing 50% of their clock for +1 bonus win point.

For an un-streaked player, Berserking increases the win payoff from 2 to 3 points (+50%). For a player on an active streak, a win already pays 4 points; Berserking increases this to 5 points (+25%), while a loss resets the streak to zero.

### Table 9: Dynamic Logit Estimates of the Berserk Decision (N = 464,356 Contest Decisions)
| Covariate | Coefficient | Standard Error | $z$-statistic | $p$-value | Odds Ratio [95% CI] |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Intercept | -2.2193 | 0.0073 | -304.53 | < 0.0001 | 0.1087 [0.1071, 0.1102] |
| Rating Advantage ($\Delta R$) | +0.0019 | 0.00002 | 123.54 | < 0.0001 | 1.0019 [1.0019, 1.0020] |
| Streak Multiplier Active ($S = 1$) | **-0.3758** | **0.0130** | **-28.91** | **< 0.0001** | **0.6867 [0.6695, 0.7044]** |
| Cumulative Contest Points | +0.0341 | 0.0007 | 46.61 | < 0.0001 | 1.0347 [1.0332, 1.0362] |
| Tournament Game Number | -0.0275 | 0.0013 | -20.93 | < 0.0001 | 0.9729 [0.9704, 0.9754] |

*Notes: Logit estimates. An active streak multiplier reduces the odds of choosing Berserk by 31.3% (p < 0.0001).*

---

## 8. Blunder Deliberation Latency, Fatigue, and Spite
Using Stockfish 19 evaluations across 328 objective blunders (eval drop $\ge$ 300 centipawns), we track decision latency prior to capitulation. Early in sessions, players spend an average of 24.8 seconds assessing complex defensive resources after a blunder before resigning. By game 8, this deliberation contracts to 11.2 seconds, reflecting cognitive fatigue. Furthermore, 33.16% of defeats end in clock-bleed time forfeitures rather than resignation, spiking when losing to lower-rated opponents and late in sessions.

---

## 9. Conclusion
Across 3,000,000 games and 1,561,866 playing sessions, economic agents consistently deviate from neoclassical benchmarks. Players treat round-number ratings as psychological reference points, bunching immediately above them and quitting at significantly higher rates upon crossing. Sessions display systematic stopping asymmetries, terminating on losses 53.48% of the time as players chase wins before ending play. Unexpected defeats prolong sessions by 0.83 games, while recent losses trigger a tilt penalty of 2.68 percentage points in subsequent performance. In tournament contests, agents protect accumulated streak multipliers by reducing capacity sacrifices by 31.3%. These findings demonstrate how backward-looking targets and cognitive fatigue govern risk-taking and labor supply in high-frequency environments.

---

## References
* Allen, E. J., Dechow, P. M., Pope, D. G., & Wu, G. (2017). Reference-dependent preferences: Evidence from marathon runners. *Quarterly Journal of Economics*, 132(4), 1655-1672.
* Baumeister, R. F., Bratslavsky, E., Muraven, M., & Tice, D. M. (1998). Ego depletion: Is the active self a limited resource? *Journal of Personality and Social Psychology*, 74(5), 1252-1265.
* Camerer, C., Babcock, L., Loewenstein, G., & Thaler, R. (1997). Labor supply of New York City cabdrivers: One day at a time. *Quarterly Journal of Economics*, 112(2), 407-441.
* Cattaneo, M. D., Jansson, M., & Ma, X. (2020). Simple local polynomial density estimators. *Journal of the American Statistical Association*, 115(531), 1449-1455.
* Crawford, V. P., & Meng, J. (2011). New York City cab drivers' labor supply revisited: Reference-dependent preferences with rational-expectations targets for hours and income. *American Economic Review*, 101(5), 1912-1932.
* Kahneman, D., & Tversky, A. (1979). Prospect theory: An analysis of decision under risk. *Econometrica*, 47(2), 263-291.
* Kőszegi, B., & Rabin, M. (2006). A model of reference-dependent preferences. *Quarterly Journal of Economics*, 121(4), 1133-1165.
* Lazear, E. P., & Rosen, S. (1981). Rank-order tournaments as optimum labor contracts. *Journal of Political Economy*, 89(5), 841-864.
* McCrary, J. (2008). Testing for manipulation of the running variable in the regression discontinuity design: A density test. *Journal of Econometrics*, 142(2), 698-714.
* Moldovanu, B., & Sela, A. (2001). The optimal allocation of prizes in contests. *American Economic Review*, 91(3), 542-558.
* Pope, D. G., & Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of heavy experience. *American Economic Review*, 101(1), 129-157.
