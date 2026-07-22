#!/usr/bin/env bash
set -e

echo "=== DESPLIEGUE SEGURO (CONTRACTOR APP) ==="
echo "1. Ejecutando comprobación de tipos y builds..."
npm run typecheck
npm run build:api
npm run build:admin

echo "2. Estado del repositorio Git:"
git status --short

echo "3. ADVERTENCIA DE SEGURIDAD:"
echo "Este script NO realizará push automático a la rama main."
echo "Para desplegar a Cloudflare Pages ejecute:"
echo "  npm run deploy:admin"
echo "  npm run deploy:mobile"

echo "✓ Despliegue seguro preparado sin push automático."
