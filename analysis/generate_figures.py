"""
Generates publication-quality figures for the paper.
Outputs Figures 1 through 7 into the figures/ directory.
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

os.makedirs("figures", exist_ok=True)
plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
plt.rcParams.update({
    "font.family": "serif",
    "font.size": 10,
    "axes.labelsize": 11,
    "axes.titlesize": 12,
    "xtick.labelsize": 9,
    "ytick.labelsize": 9,
    "legend.fontsize": 9,
    "figure.titlesize": 13,
})

def generate_figure_1(df):
    print("Generating Figure 1: Density Discontinuity...")
    fig, axes = plt.subplots(1, 3, figsize=(14, 4.2), sharey=False)
    milestones = [1500, 1800, 2000]
    quits = df[df["is_session_quit"] == 1]

    for ax, c in zip(axes, milestones):
        sub = quits[(quits["post_rating"] >= c - 25) & (quits["post_rating"] <= c + 25)]
        bins = np.arange(c - 25, c + 26, 2)
        n, b, patches = ax.hist(sub["post_rating"], bins=bins, edgecolor="white", linewidth=0.8)
        for patch, left_edge in zip(patches, b[:-1]):
            if left_edge >= c:
                patch.set_facecolor("#b91c1c")
            else:
                patch.set_facecolor("#1e3a8a")
        ax.axvline(c, color="black", linestyle="--", linewidth=1.2)
        ax.set_title(f"Milestone {c}")
        ax.set_xlabel("Post-Session Rating")
        ax.set_ylabel("Frequency")

    plt.tight_layout()
    plt.savefig("figures/fig1_bunching.png", dpi=300)
    plt.close()

if __name__ == "__main__":
    print("Run with empirical CSV datasets to regenerate all figures.")
