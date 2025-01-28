docker-compose up -d

Start-Sleep -Seconds 60

docker-compose stop

.\replication_setup.ps1

docker-compose start
