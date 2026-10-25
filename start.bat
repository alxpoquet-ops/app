@echo off
REM Lancement local sous Windows. Prerequis : Node.js 20+ et ffmpeg.
cd /d "%~dp0"
where node >nul 2>nul || (echo Installe Node.js : https://nodejs.org & pause & exit /b 1)
where ffmpeg >nul 2>nul || (echo Installe ffmpeg : winget install Gyan.FFmpeg & pause & exit /b 1)
if not exist node_modules call npm install --omit=dev
start "" http://localhost:3000
node server\index.js
pause
