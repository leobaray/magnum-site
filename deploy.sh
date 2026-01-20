#!/usr/bin/env bash
set -euo pipefail
cd /sistemas/magnum

git pull --ff-only

# garante dev deps pro build (vite etc), mesmo se o shell estiver com NODE_ENV=production
export NODE_ENV=development
npm ci

npm run build
npm prune --omit=dev

# sobe/atualiza o app carregando config+env do ecosystem
pm2 startOrReload ecosystem.config.cjs --only magnum --env production --update-env
pm2 save --force
