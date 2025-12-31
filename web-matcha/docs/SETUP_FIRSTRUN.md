# First Run (One-time Setup)

This document explains what you must do **only the first time** you set up the project on a new machine
(or after deleting the database/container).

## Requirements
- Docker Desktop
- Your project has a schema file: `sql/001_init.sql`

> macOS/zsh note: if your password contains `!`, always wrap it in **single quotes** to avoid:
> `zsh: event not found`

---

## 1) Create and start SQL Server container (one time)
```bash
docker run -e 'ACCEPT_EULA=Y' -e 'MSSQL_SA_PASSWORD=YourStrong!Passw1rd' \
  -p 1433:1433 --name matcha-sql -d mcr.microsoft.com/mssql/server:2022-latest
```

## 2) Create the database and connect
```bash
docker exec -it matcha-sql /opt/mssql-tools18/bin/sqlcmd \
-S localhost -U sa -P 'YourStrong!Passw1rd' -C \
-Q "CREATE DATABASE Matcha;"
```
## 3) Run the schema script sql/001_init.sql
Copy the script into the container
```bash
docker cp ../sql/001_init.sql matcha-sql:/tmp/001_init.sql 
```
Execute the script against the Matcha database
```bash
docker exec -it matcha-sql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong!Passw1rd' -C \
  -d Matcha -i /tmp/001_init.sql
```