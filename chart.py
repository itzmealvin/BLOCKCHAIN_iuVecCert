# Re-importing necessary libraries after state reset
import matplotlib.pyplot as plt
import numpy as np

# Data
data = {
    "Credential Groups": [10, 20, 50, 100, 200, 500, 1000],
    "Time to Build (ms)": [647.74, 1171.1, 3097.8, 9544.98, 40956.6, 221795.78, 905295.07],
    "Total Proof Size (MB)": [9.7, 19.4, 48.5, 97, 194, 485, 969.9],
    "Proof Size Per Group (MB)": [0.97, 0.97, 0.97, 0.97, 0.97, 0.97, 0.9699]
}

# Extract data
groups = data["Credential Groups"]
time_to_build = data["Time to Build (ms)"]
total_proof_size = data["Total Proof Size (MB)"]
proof_size_per_group = data["Proof Size Per Group (MB)"]

# Updated plotting with line colors changed to purple and orange
fig, ax1 = plt.subplots(figsize=(14, 7))

# Bar chart with spacing
bar_width = 0.4  # Adjust width of bars
bar_positions = np.arange(len(groups))  # Evenly spaced positions
bars = ax1.bar(bar_positions, time_to_build, width=bar_width, color='orange', alpha=0.7, label='Time to Build (ms)')

# Customizing the x-axis
ax1.set_xlabel("Credential Groups", fontsize=12)
ax1.set_xticks(bar_positions)
ax1.set_xticklabels(groups)
ax1.set_ylabel("Time to Build (ms)", fontsize=12)
ax1.set_yscale('log')
ax1.tick_params(axis='y')

# Secondary y-axis for Total Proof Size and Proof Size Per Group
ax2 = ax1.twinx()
ax2.plot(bar_positions, total_proof_size, color='purple', marker='o', label='Total Proof Size (MB)')
ax2.plot(bar_positions, proof_size_per_group, color='green', marker='x', linewidth=2.5, label='Proof Size Per Group (MB)')

# Y-axis label for the second axis
ax2.set_ylabel("Proof Size (MB)", fontsize=12)
ax2.tick_params(axis='y')

# Adding legends
lines, labels = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax2.legend(lines + lines2, labels + labels2, loc='upper left')

# Title and grid
plt.title("Credential Groups vs. Build Time and Proof Size", fontsize=14)
plt.grid(axis='y', which='both', linestyle='--', linewidth=0.5)

plt.tight_layout()
plt.show()
