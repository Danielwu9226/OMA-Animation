import os
import pandas as pd
import matplotlib.pyplot as plt

# File paths
csv_filename = "student_sports_performance.csv"
fallback_path = os.path.join(os.path.expanduser('~'), 'Downloads', csv_filename)

if os.path.exists(csv_filename):
    data_path = csv_filename
elif os.path.exists(fallback_path):
    data_path = fallback_path
else:
    raise FileNotFoundError(f"Could not find '{csv_filename}' in current directory or Downloads folder.")

print(f"Loading data from: {data_path}")
# Load the dataset
df = pd.read_csv(data_path)

# Calculate Calorie Burn Rate (Calories per minute)
df['Calorie_Burn_Rate'] = df['Calories_Burned'] / df['Duration_Minutes']

# Prepare data for scatter plot
x = df['Avg_Heart_Rate_BPM']
y = df['Calorie_Burn_Rate']
colors_map = {
    'Running': '#2ca02c',    # green
    'Tennis': '#ff7f0e',     # orange
    'Soccer': '#1f77b4',     # blue
    'Swimming': '#9467bd',   # purple
    'Cycling': '#d2ff00',    # lime (approx)
    'Badminton': '#ffeb3b',  # yellow
    'Basketball': '#d2b48c'  # light brown (tan)
}
# Assign colors based on sport
c = df['Sport'].map(colors_map)
# Marker size based on duration minutes (scale for visibility)
size_factor = 20  # scaling factor for marker size
s = df['Duration_Minutes'] * size_factor

plt.figure(figsize=(10, 6))
scatter = plt.scatter(x, y, c=c, s=s, edgecolor='black', alpha=0.8)

# Axis settings
plt.xticks(range(120, 181, 10))
plt.yticks(range(10, 31, 5))
plt.xlim(115, 185)
plt.ylim(5, 35)

plt.title('Hidden Insight: Exercise Intensity (Heart Rate) vs. Caloric Efficiency (Cal/Min)', fontsize=14, fontweight='bold')
plt.xlabel('Average Heart Rate (BPM)')
plt.ylabel('Calorie Burn Rate (Calories/min)')

# Create custom legend for sports colors
from matplotlib.lines import Line2D
legend_elements = [Line2D([0], [0], marker='o', color='w', label=sport,
                          markerfacecolor=col, markersize=10, markeredgecolor='black')
                   for sport, col in colors_map.items()]
plt.legend(handles=legend_elements, title='Sport', loc='upper left')

# Optionally annotate points with duration minutes
for idx, row in df.iterrows():
    plt.text(row['Avg_Heart_Rate_BPM'] + 0.5, row['Calorie_Burn_Rate'] + 0.2,
             str(int(row['Duration_Minutes'])), fontsize=8)

plt.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()

output_file = 'exercise_intensity_scatter.png'
plt.savefig(output_file, dpi=300, bbox_inches='tight')
plt.close()

print(f"Scatter plot saved as {output_file}")
