#!/usr/bin/env bash
set -e

echo "=== DESPLIEGUE SEGURO (CONTRACTOR APP) ==="
echo "1. Asegurando githooks y verificaciones..."
npm run install-hooks

echo "2. Ejecutando comprobación de tipos y compilaciones completas..."
npm run typecheck
npm run build:api
npm run build:admin
npm run build:mobile

echo "3. Estado del repositorio Git:"
git status --short

echo "4. ADVERTENCIA DE SEGURIDAD Y PROTECCIÓN DE RAMA:"
echo "Este script NO realizará push automático a la rama main."
echo "La rama 'main' requiere Pull Request e integración continua exitosa."
echo "Para desplegar a Cloudflare Pages ejecute manualmente:"
echo "  npm run deploy:admin"
echo "  npm run deploy:mobile"

echo "✓ Despliegue seguro preparado y validado sin push automático."

