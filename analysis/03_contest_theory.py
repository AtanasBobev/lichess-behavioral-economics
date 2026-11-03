"""
Replication Script: Contest Theory and Endogenous Capacity Sacrifices.
Estimates the dynamic discrete choice logit model of the Berserk decision in Arena tournaments.
"""

import pandas as pd
import statsmodels.formula.api as smf

def run_contest_analysis(csv_path="data/q1_berserk_contest.csv"):
    print("=" * 70)
    print("3. CONTEST THEORY & THE BERSERK DECISION UNDER CONVEX REWARDS")
    print("=" * 70)

    df = pd.read_csv(csv_path)
    print(f"Total tournament observations: {len(df):,}")

    df["streak_active"] = (df["running_streak"] >= 2).astype(int)

    # 1. Berserk Rate by Streak Multiplier Status
    summary = df.groupby("streak_active")["berserk"].agg(["count", "mean"])
    print("\n[Berserk Choice Rates by Streak Multiplier Status]")
    print(summary)

    # 2. Dynamic Logit Model
    print("\n[Dynamic Discrete Choice Logit Model]")
    logit_model = smf.logit(
        "berserk ~ rating_diff + streak_active + cum_points + tourney_game_num",
        data=df
    ).fit(disp=False)
    print(logit_model.summary().tables[1])

if __name__ == "__main__":
    run_contest_analysis()
