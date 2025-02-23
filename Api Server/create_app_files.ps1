param (
    [string]$appName,
    [string]$path
)

# Check if the correct number of arguments is provided
if (-not $appName -or -not $path) {
    Write-Host "Usage: .\create_app_files.ps1 <app_name> <path>"
    exit 1
}

# Create the specified files
New-Item -Path "$path\$appName`Authentication.js" -ItemType File
New-Item -Path "$path\$appName`Validation.js" -ItemType File
New-Item -Path "$path\$appName`Router.js" -ItemType File
New-Item -Path "$path\$appName`Controller.js" -ItemType File
New-Item -Path "$path\$appName`Service.js" -ItemType File
New-Item -Path "$path\$appName`Model.js" -ItemType File

Write-Host "Files created successfully in $path"