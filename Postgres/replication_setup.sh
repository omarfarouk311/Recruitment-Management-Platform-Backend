#!/usr/bin/env bash
set -euo pipefail

# Define paths
master_data_dir="./master/data"
standbys=("standby1" "standby2")

# Ensure master data directory exists
if [ ! -d "$master_data_dir" ]; then
  echo "Error: master data directory not found: $master_data_dir" >&2
  exit 1
fi

# Loop through each standby
for standby in "${standbys[@]}"; do
  standby_data_dir="./$standby/data"

  # Ensure standby data directory exists (create if needed)
  mkdir -p "$standby_data_dir"

  # Copy data from master to standby (recursively, overwrite existing files)
  cp -R -f "$master_data_dir/"* "$standby_data_dir/" 2>/dev/null || true
  echo "✅ Master data copied to $standby_data_dir"

  # Copy standby-specific configs
  cp -f "./configs/$standby/"* "$standby_data_dir/" 2>/dev/null || true
  echo "🔧 Standby configs copied to $standby_data_dir"
done

echo "⚙️ All standbys have been updated."

# Copy master config files into master data directory
cp -f "./configs/master/"* "$master_data_dir/" 2>/dev/null || true
echo "🔧 Master configs copied to $master_data_dir"

echo "🎉 All standbys and master have been updated."
