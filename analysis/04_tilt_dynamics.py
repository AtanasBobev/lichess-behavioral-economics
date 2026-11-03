"""
Replication Script: The Tilt Spiral and Matchmaking Compensation.
Evaluates sequential game transitions to isolate emotional spillovers from recent losses.
"""

import pandas as pd
import statsmodels.formula.api as smf
from scipy import stats

def run_tilt_analysis(csv_path="data/q2_rating_milestones.csv"):
    print("=" * 70)
    print("4. THE TILT SPIRAL: PERFORMANCE DEGRADATION IN SEQUENTIAL PLAY")
    print("=" * 70)

    df = pd.read_csv(csv_path)
    df = df.sort_values(["player", "timestamp"])

    df["prev_player"] = df["player"].shift(1)
    df["prev_quit"] = df["is_session_quit"].shift(1)
    df["prev_score"] = df["score"].shift(1)

    intra = df[(df["player"] == df["prev_player"]) & (df["prev_quit"] == 0)].copy()
    intra["prev_loss"] = (intra["prev_score"] == 0.0).astype(int)
    intra["prev_win"] = (intra["prev_score"] == 1.0).astype(int)

    print(f"Intra-session transitions: {len(intra):,}")

    # 1. Performance Comparison
    wr = intra.groupby("prev_score")["score"].agg(["count", "mean", "std"])
    print("\n[Win Rates in Game t+1 by Game t Outcome]")
    print(wr)

    # 2. Econometric Models
    print("\n[Linear Probability Model of Subsequent Score]")
    ols = smf.ols("score ~ prev_loss + session_game_num", data=intra).fit()
    print(ols.summary().tables[1])

    decisive = intra[intra["score"].isin([0.0, 1.0])].copy()
    print("\n[Logit Model on Decisive Games (Win vs Loss)]")
    logit = smf.logit("score ~ prev_loss + session_game_num", data=decisive).fit(disp=False)
    print(logit.summary().tables[1])

if __name__ == "__main__":
    run_tilt_analysis()
