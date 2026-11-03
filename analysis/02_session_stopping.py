"""
Replication Script: Asymmetric Session Stopping Rules and Diurnal Decomposition.
Tests whether players prolong sessions to avoid ending on a loss (the "one win before bed" trap).
"""

import pandas as pd
import statsmodels.formula.api as smf
from scipy import stats

def run_stopping_analysis(csv_path="data/q3_session_stopping.csv"):
    print("=" * 70)
    print("2. ASYMMETRIC SESSION STOPPING RULES AND LOSS CHASING")
    print("=" * 70)

    df = pd.read_csv(csv_path)
    print(f"Total sessions loaded: {len(df):,}")

    multi = df[df["session_length"] >= 2].copy()
    print(f"Multi-game sessions (>= 2 games): {len(multi):,}")

    # 1. Outcome Asymmetry at Termination
    wins = len(multi[multi["final_score"] == 1.0])
    losses = len(multi[multi["final_score"] == 0.0])
    draws = len(multi[multi["final_score"] == 0.5])
    total = len(multi)

    print("\n[Terminal Outcome Distribution in Multi-Game Sessions]")
    print(f"  Wins:   {wins:,} ({wins / total:.2%})")
    print(f"  Losses: {losses:,} ({losses / total:.2%})")
    print(f"  Draws:  {draws:,} ({draws / total:.2%})")

    p_val = stats.binomtest(wins, wins + losses, 0.5).pvalue
    print(f"  Binomial test p-value: {p_val:.2e}")

    # 2. Regression: Determinants of Session Length
    print("\n[OLS Model: Determinants of Session Length]")
    ols_model = smf.ols(
        "session_length ~ C(final_score) + final_upset_loss + net_rating_change",
        data=df
    ).fit()
    print(ols_model.summary().tables[1])

    # 3. Global Stability Across 24 UTC Hours
    print("\n[Global Diurnal Stability: Loss Exit Rates by UTC Hour]")
    hourly = df.groupby("end_hour_utc").agg(
        sessions=("session_length", "count"),
        mean_length=("session_length", "mean"),
        loss_exit_rate=("final_score", lambda s: (s == 0.0).mean())
    ).reset_index()
    print(hourly.to_string(index=False))

if __name__ == "__main__":
    run_stopping_analysis()
