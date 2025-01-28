# Define paths
$masterDataDir = ".\master\data"    # Master data directory
$standbys = @(
    "standby1", # Hot Standby 1
    "standby2" # Hot Standby 2
)

foreach ($standby in $standbys) {
    $standbyDataDir = ".\$standby\data"
    
    # Copy data from master to standby
    Copy-Item -Path "$masterDataDir\*" -Destination $standbyDataDir -Recurse -Force
    Write-Host "Master data copied to $standbyDataDir"
    
    # Copy standby configs
    Copy-Item -Path ".\configs\$standby\*" -Destination $standbyDataDir -Force
    Write-Host "Standby configs copied to $standbyDataDir"
}

Write-Host "All standbys have been updated."

# Copy master configs
Copy-Item -Path ".\configs\master\*" -Destination $masterDataDir -Force
Write-Host "Master configs copied to $masterDataDir"

Write-Host "All standbys and master have been updated."
