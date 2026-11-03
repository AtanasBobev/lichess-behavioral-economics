"""
Replication Script: Stockfish 19 UCI Blunder Analysis and Capitulation Latency.
Analyzes deliberation latency following decisive engine blunder swings (>= 300 cp).
"""

import pandas as pd
import numpy as np
import statsmodels.formula.api as smf

def run_blunder_analysis(csv_path="data/q4_blunder_latency.csv"):
    print("=" * 70)
    print("5. REAL-TIME BLUNDER CAPITULATION AND COGNITIVE FATIGUE")
    print("=" * 70)

    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print(f"Data file not found at {csv_path}. Run the UCI engine extraction pipeline first.")
        return

    print(f"Total objective blunders evaluated: {len(df):,}")

    df["log_latency"] = np.log(df["latency_sec"].clip(lower=1.0))

    # OLS Model of Deliberation Latency on Session Fatigue
    model = smf.ols("log_latency ~ session_game_num + abs_eval_drop + player_elo", data=df).fit()
    print("\n[Deliberation Latency Regression]")
    print(model.summary().tables[1])

if __name__ == "__main__":
    run_blunder_analysis()
