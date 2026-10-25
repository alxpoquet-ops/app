#!/usr/bin/env sh
# Lancement local (Mac / Linux). Prérequis : Node.js 20+ et ffmpeg.
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Installe Node.js : https://nodejs.org"; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo "Installe ffmpeg : brew install ffmpeg (Mac) ou sudo apt install ffmpeg (Linux)"; exit 1; }
[ -d node_modules ] || npm install --omit=dev
( sleep 2; (command -v open >/dev/null && open http://localhost:3000) || (command -v xdg-open >/dev/null && xdg-open http://localhost:3000) ) >/dev/null 2>&1 &
node server/index.js
