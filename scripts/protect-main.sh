#!/usr/bin/env bash
set -e

# Contractor App - Guardián de Protección para la Rama Main
# Este script previene el 'git push' directo a la rama 'main' en entornos locales.

current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
remote_ref="$1"
remote_url="$2"

echo "🛡️  [Branch Protection] Verificando push hacia la rama objetivo..."

if [ "$current_branch" = "main" ] || [[ "$remote_ref" == *"refs/heads/main"* ]]; then
  if [ "$ALLOW_DIRECT_PUSH_TO_MAIN" = "1" ] || [ "$ALLOW_DIRECT_PUSH_TO_MAIN" = "true" ]; then
    echo "⚠️  [Branch Protection] Push directo a 'main' autorizado explícitamente vía ALLOW_DIRECT_PUSH_TO_MAIN."
  else
    echo ""
    echo "❌ [ERROR DE PROTECCIÓN DE RAMA MAIN]"
    echo "------------------------------------------------------------------"
    echo "El empuje (push) directo a la rama 'main' está protegido y restringido."
    echo "Para integrar cambios en 'main':"
    echo "  1. Cree una rama de función/fix: git checkout -b feat/mi-funcionalidad"
    echo "  2. Envíe sus cambios a GitHub: git push origin feat/mi-funcionalidad"
    echo "  3. Abra un Pull Request hacia 'main' para ejecutar las validaciones CI."
    echo "------------------------------------------------------------------"
    echo "Si requiere hacer bypass de emergencia en desarrollo local, ejecute:"
    echo "  ALLOW_DIRECT_PUSH_TO_MAIN=1 git push origin main"
    echo ""
    exit 1
  fi
fi

echo "✓ Verificación de protección de rama completada."
