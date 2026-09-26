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

# Quick Summary Analysis
print(f"Total sessions loaded: {len(df)}")
print("\nSummary Statistics:")
print(df[['Playtime_Minutes', 'Focus_Score_Pct', 'Actions_Per_Minute', 'Bosses_Defeated']].describe())

# -------------------------------------------------------------
# 2. Scatter Plot Setup
# - Y-axis: Focus_Score_Pct
# - X-axis: Playtime_Minutes
# - Colors: Game_Genre
# - Size scale: Actions_Per_Minute (circles from 50 to 300)
# - Annotations / Style: Bosses_Defeated (0 to 5)
# -------------------------------------------------------------
plt.figure(figsize=(14, 8))
sns.set_theme(style="whitegrid")

# Create scatter plot with seaborn
ax = sns.scatterplot(
    data=df,
    x="Playtime_Minutes",
    y="Focus_Score_Pct",
    hue="Game_Genre",
    size="Actions_Per_Minute",
    sizes=(50, 300),
    palette="tab10",
    alpha=0.85,
    edgecolor="black",
    linewidth=0.6
)

# -------------------------------------------------------------
# 3. Axis Constraints & Ticks
# - Y-axis: 50 to 100 adds up by 10
# - X-axis: 20 to 140 adds up by 20
# -------------------------------------------------------------
plt.xlim(10, 155)
plt.ylim(45, 105)
plt.xticks(range(20, 141, 20), fontsize=11)
plt.yticks(range(50, 101, 10), fontsize=11)

# Annotate Bosses_Defeated (0-5) on points where bosses were defeated
for idx, row in df.iterrows():
    if row['Bosses_Defeated'] > 0:
        plt.text(
            row['Playtime_Minutes'] + 1.2,
            row['Focus_Score_Pct'] + 0.3,
            f"B:{int(row['Bosses_Defeated'])}",
            fontsize=8,
            fontweight='bold',
            color='#333333',
            alpha=0.9
        )

# Titles & Labels
plt.title("Game Genre Analysis: Focus Score (%) vs. Playtime (Minutes)", fontsize=16, fontweight="bold", pad=15)
plt.xlabel("Playtime (Minutes)", fontsize=13, fontweight="bold", labelpad=10)
plt.ylabel("Focus Score (%)", fontsize=13, fontweight="bold", labelpad=10)

# Legend positioning outside plot
plt.legend(bbox_to_anchor=(1.02, 1), loc="upper left", borderaxespad=0, title_fontsize=12, fontsize=11)

plt.tight_layout()

# -------------------------------------------------------------
# 4. Save Plot
# -------------------------------------------------------------
output_filename = "focus_playtime_scatter.png"
plt.savefig(output_filename, dpi=300, bbox_inches="tight")
plt.close()

print(f"\nScatter plot successfully saved as '{output_filename}'")
