@echo off

:: !USAGE: automatically run our project by just typing: (run ehr mobile) 
:: !IMPORTANT: place it in your User folder (e.g., C:\Users\YourName) 
:: and ensure that folder is added to your Windows Environment Variables (PATH).

if /i "%~1" neq "ehr" goto usage
if /i "%~2" neq "mobile" goto usage

echo [INFO] Starting EHR Mobile (Android)...
start "EHR Mobile" cmd /k "cd /d %USERPROFILE%\EHR\ehr && npm run android"

echo [INFO] Starting EHR PHP Backend (Website)...
start "EHR Backend" cmd /k "cd /d %USERPROFILE%\electronic-health-record && php artisan serve --host=0.0.0.0 --port=8000"

goto :eof

:usage
echo Usage: run ehr mobile
echo (data synced into web)
