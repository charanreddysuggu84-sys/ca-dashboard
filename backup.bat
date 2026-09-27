@echo off
setlocal

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set STAMP=%%i

set DEST=backups\%STAMP%
mkdir "%DEST%"

echo Backing up database...
copy /Y "backend\ca_dashboard.db" "%DEST%\ca_dashboard.db" >nul
if exist "%DEST%\ca_dashboard.db" (
    echo   OK: database backed up.
) else (
    echo   FAILED: database was not copied. Is uvicorn still running? Stop it and try again.
)

echo Backing up uploads...
robocopy "backend\uploads" "%DEST%\uploads" /E /NFL /NDL /NJH /NJS >nul
if exist "%DEST%\uploads" (
    echo   OK: uploads backed up.
) else (
    echo   FAILED: uploads folder was not copied.
)

echo.
echo Backup complete: %DEST%
pause