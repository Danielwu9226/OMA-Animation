import os
import pandas as pd
import matplotlib.pyplot as plt

# File paths
csv_filename = "student_sports_performance.csv"
fallback_path = os.path.join(os.path.expanduser("~"), "Downloads", csv_filename)

if os.path.exists(csv_filename):
    data_path = csv_filename
elif os.path.exists(fallback_path):
    data_path = fallback_path
else:
    raise FileNotFoundError(f"Could not find '{csv_filename}' in current directory or Downloads folder.")

# 1. Load the dataset
print(f"Loading data from: {data_path}")
df = pd.read_csv(data_path)

# 2. Filter / Group data to calculate total calories burned per sport
calories_per_sport = df.groupby("Sport")["Calories_Burned"].sum().reset_index()

# Sort by Calories_Burned in descending order for better visualization
calories_per_sport = calories_per_sport.sort_values(by="Calories_Burned", ascending=False)

print("\nTotal Calories Burned Per Sport:")
print(calories_per_sport.to_string(index=False))

# 3. Generate Bar Chart using matplotlib
plt.figure(figsize=(10, 6))

# Custom vibrant color palette
colors = ["#2b5c8f", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02"]
bars = plt.bar(
    calories_per_sport["Sport"],
    calories_per_sport["Calories_Burned"],
    color=colors[:len(calories_per_sport)],
    edgecolor="black",
    linewidth=0.8,
    width=0.55
)

# Styling and Labels
plt.title("Total Calories Burned per Sport", fontsize=16, fontweight="bold", pad=15)
plt.xlabel("Sport", fontsize=12, labelpad=10)
plt.ylabel("Total Calories Burned (kcal)", fontsize=12, labelpad=10)
plt.grid(axis="y", linestyle="--", alpha=0.5)

# Add value labels above each bar
for bar in bars:
    height = bar.get_height()
    plt.text(
        bar.get_x() + bar.get_width() / 2.0,
        height + (max(calories_per_sport["Calories_Burned"]) * 0.015),
        f"{int(height):,}",
        ha="center",
        va="bottom",
        fontsize=10,
        fontweight="bold"
    )

# Adjust y-limit to accommodate bar value labels cleanly
plt.ylim(0, max(calories_per_sport["Calories_Burned"]) * 1.12)
plt.tight_layout()

# 4. Save the plot as sports_summary.png
output_filename = "sports_summary.png"
plt.savefig(output_filename, dpi=300, bbox_inches="tight")
plt.close()

print(f"\nBar chart successfully created and saved as '{output_filename}'.")
