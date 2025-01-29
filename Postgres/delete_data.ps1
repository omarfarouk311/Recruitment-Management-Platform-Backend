docker compose down

Remove-Item -Path ".\master" -Recurse -Force

Remove-Item -Path ".\standby1" -Recurse -Force

Remove-Item -Path ".\standby2" -Recurse -Force
