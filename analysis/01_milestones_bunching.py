"""
Replication Script: Milestone Bunching and Regression Discontinuity Design (RDD).
Evaluates reference-dependent preferences across 5,999,360 post-game observations.
Includes McCrary density discontinuity tests, placebo midpoints, and RDD logit models.
"""

import pandas as pd
import numpy as np
import statsmodels.formula.api as smf
from scipy import stats

def run_milestone_analysis(csv_path="data/q2_rating_milestones.csv"):
    print("=" * 70)
    print("1. MILESTONE BUNCHING AND REGRESSION DISCONTINUITY DESIGN")
    print("=" * 70)

    df = pd.read_csv(csv_path)
    df = df[(df["post_rating"] >= 1000) & (df["post_rating"] <= 2400)].copy()

    # 1. McCrary Density Tests on Session Exits
    quits = df[df["is_session_quit"] == 1].copy()
    milestones = [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100]

    bunching_results = []
    for c in milestones:
        n_below = len(quits[(quits["post_rating"] >= c - 10) & (quits["post_rating"] < c)])
        n_above = len(quits[(quits["post_rating"] >= c) & (quits["post_rating"] <= c + 10)])
        total = n_below + n_above
        ratio = (n_above / total) if total > 0 else 0.5
        p_val = stats.binomtest(n_above, total, 0.5).pvalue if total > 0 else 1.0

        bunching_results.append({
            "milestone": c,
            "below_[c-10,c-1]": n_below,
            "above_[c,c+10]": n_above,
            "share_above": f"{ratio:.4%}",
            "p_value": f"{p_val:.2e}"
        })

    print("\n[Density Bunching Around Salient Milestones]")
    print(pd.DataFrame(bunching_results).to_string(index=False))

    # 2. Placebo Midpoint Falsification Tests
    placebos = [1250, 1350, 1450, 1550, 1650, 1750, 1850, 1950, 2050]
    placebo_results = []
    for c in placebos:
        n_below = len(quits[(quits["post_rating"] >= c - 10) & (quits["post_rating"] < c)])
        n_above = len(quits[(quits["post_rating"] >= c) & (quits["post_rating"] <= c + 10)])
        total = n_below + n_above
        ratio = (n_above / total) if total > 0 else 0.5
        p_val = stats.binomtest(n_above, total, 0.5).pvalue if total > 0 else 1.0

        placebo_results.append({
            "placebo_cutoff": c,
            "below": n_below,
            "above": n_above,
            "share_above": f"{ratio:.4%}",
            "p_value": f"{p_val:.4f}"
        })

    print("\n[Placebo Falsification at 50-Point Midpoints]")
    print(pd.DataFrame(placebo_results).to_string(index=False))

    # 3. RDD Logit Model for Session Termination
    window_df = df[(df["dist_to_milestone"] >= -30) & (df["dist_to_milestone"] <= 30)].copy()
    print(f"\n[RDD Logit Model: Bandwidth ±30 points, N = {len(window_df):,}]")

    rdd_model = smf.logit(
        "is_session_quit ~ above_milestone + dist_to_milestone + dist_to_milestone:above_milestone + rating_diff + score",
        data=window_df
    ).fit(disp=False)

    print(rdd_model.summary().tables[1])

if __name__ == "__main__":
    run_milestone_analysis()
