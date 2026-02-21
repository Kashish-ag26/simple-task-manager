@echo off
setlocal enabledelayedexpansion
title TaskFlow — Starting...
color 0A

echo.
echo  ████████╗ █████╗ ███████╗██╗  ██╗███████╗██╗      ██████╗ ██╗    ██╗
echo     ██╔══╝██╔══██╗██╔════╝██║ ██╔╝██╔════╝██║     ██╔═══██╗██║    ██║
echo     ██║   ███████║███████╗█████╔╝ █████╗  ██║     ██║   ██║██║ █╗ ██║
echo     ██║   ██╔══██║╚════██║██╔═██╗ ██╔══╝  ██║     ██║   ██║██║███╗██║
echo     ██║   ██║  ██║███████║██║  ██╗██║     ███████╗╚██████╔╝╚███╔███╔╝
echo     ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝
echo.
echo  Starting server...
echo.

cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo  Installing dependencies first — please wait...
    call npm install
    echo.
)

REM Start the server in background
start /min "" cmd /c "npm run dev > server.log 2>&1"

REM Wait for server to be ready
echo  Waiting for server to start on http://localhost:3000 ...
:WAIT_LOOP
timeout /t 2 /nobreak >nul
curl -s -o nul -w "%%{http_code}" http://localhost:3000 | find "200" >nul 2>&1
if errorlevel 1 (
    set /a attempts+=1
    if !attempts! lss 20 goto WAIT_LOOP
)

REM Open Chrome
echo  Opening in Chrome...
start chrome http://localhost:3000

echo.
echo  TaskFlow is running at http://localhost:3000
echo  Close this window to stop the server.
echo.
pause
taskkill /f /im node.exe >nul 2>&1
echo  Server stopped.
