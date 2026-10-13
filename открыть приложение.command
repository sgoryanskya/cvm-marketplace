#!/bin/zsh
# запускает локальный сервер и открывает приложение в браузере
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
npm run dev -- --open
