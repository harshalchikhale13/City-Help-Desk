@echo off
REM Civic Complaint Management System - Setup Script

echo ======================================
echo  Civic Complaint System - Setup
echo ======================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] PostgreSQL is not installed or not in PATH
    echo.
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo Make sure to add PostgreSQL bin folder to PATH during installation
    echo.
    pause
    exit /b 1
)

echo [+] PostgreSQL found
echo.

REM Create database
echo [*] Creating database 'civic_complaints_db'...
psql -U postgres -h localhost -c "CREATE DATABASE civic_complaints_db;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [+] Database created successfully
) else (
    echo [*] Database might already exist - continuing
)
echo.

REM Import schema
echo [*] Importing database schema...
psql -U postgres -h localhost -d civic_complaints_db -f "%cd%\database\schema.sql"
if %ERRORLEVEL% EQU 0 (
    echo [+] Database schema imported successfully
) else (
    echo [!] Error importing schema
    pause
    exit /b 1
)
echo.

echo ======================================
echo  Setup Complete!
echo ======================================
echo.
echo Next steps:
echo   1. Start Backend:  npm run dev (in backend folder)
echo   2. Start Frontend: npm start (in frontend folder)
echo.
pause
