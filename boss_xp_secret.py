import os
import urllib.request
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# -------------------------------------------------------------
# 1. Dataset Loading with Fallbacks
# -------------------------------------------------------------
csv_filename = "gaming_analytics_performance.csv"
fallback_path = os.path.join(os.path.expanduser("~"), "Downloads", csv_filename)
gdrive_url = "https://drive.usercontent.google.com/download?id=1vUjsGTfzxneuZjKSZYSXa_UpeUmWJskg&export=download"

if os.path.exists(csv_filename):
    data_path = csv_filename
elif os.path.exists(fallback_path):
    data_path = fallback_path
else:
    print(f"'{csv_filename}' not found locally. Downloading from Google Drive...")
    urllib.request.urlretrieve(gdrive_url, csv_filename)
    data_path = csv_filename

print(f"Loading data from: {data_path}")
df = pd.read_csv(data_path)

# Quick analytical overview
print(f"Total sessions loaded: {len(df)}")
print("\nSummary by Game Genre:")
summary = df.groupby("Game_Genre").agg(
    Sessions=("Session_ID", "count"),
    Avg_Bosses=("Bosses_Defeated", "mean"),
    Max_Bosses=("Bosses_Defeated", "max"),
    Avg_XP=("XP_Gained", "mean"),
    Max_XP=("XP_Gained", "max")
).reset_index()
print(summary.to_string(index=False))

# -------------------------------------------------------------
# 2. Scatter Plot Setup (Larger Figure Size)
# -------------------------------------------------------------
plt.figure(figsize=(14, 8))
sns.set_theme(style="whitegrid")

ax = sns.scatterplot(
    data=df,
    x="Bosses_Defeated",
    y="XP_Gained",
    hue="Game_Genre",
    size="Playtime_Minutes",
    sizes=(30, 180),
    palette="tab10",
    alpha=0.85,
    edgecolor="black",
    linewidth=0.6
)

# -------------------------------------------------------------
# 3. Axis Constraints & Increments
# - x-axis: 0 to 5, step of 1 (with padding -0.3 to 5.3)
# - y-axis: 0 to 2500, step of 500 (with padding -50 to 2850)
# -------------------------------------------------------------
plt.xlim(-0.3, 5.3)
plt.ylim(-50, 2850)
plt.xticks(range(0, 6, 1), fontsize=11)
plt.yticks(range(0, 2501, 500), fontsize=11)

# Titles & Labels
plt.title("Bosses Defeated vs. XP Gained by Game Genre and Playtime", fontsize=16, fontweight="bold", pad=15)
plt.xlabel("Bosses Defeated", fontsize=13, fontweight="bold", labelpad=10)
plt.ylabel("XP Gained", fontsize=13, fontweight="bold", labelpad=10)

# Place legend outside the plot area for optimal clarity
plt.legend(bbox_to_anchor=(1.02, 1), loc="upper left", borderaxespad=0, title_fontsize=12, fontsize=11)

plt.tight_layout()

# -------------------------------------------------------------
# 4. Save Plot
# -------------------------------------------------------------
output_filename = "boss_xp_secret.png"
plt.savefig(output_filename, dpi=300, bbox_inches="tight")
plt.close()

print(f"\nChart successfully saved as '{output_filename}'")

