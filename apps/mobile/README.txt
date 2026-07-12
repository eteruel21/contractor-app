CORRECCIÓN FINAL DE CONCRETO

Esta corrección modifica únicamente:

- src\utils\calculations.ts
- src\app\calculos\concreto.tsx

Agrega o verifica:

- cementDensityKgM3, dryVolumeFactor y
  defaultAggregateBagVolume dentro de ConcreteInput.
- Import de useFormulaParameters.
- Import de getFormulaNumber.
- Hook concrete_standard.

INSTRUCCIONES

1. Copia corregir-concreto-final.ps1 dentro de:

C:\Users\Eliel Teruel\CONTRACTOR-APP\apps\mobile

2. Ejecuta:

cd "C:\Users\Eliel Teruel\CONTRACTOR-APP\apps\mobile"

powershell -ExecutionPolicy Bypass `
  -File .\corregir-concreto-final.ps1

npx tsc --noEmit

No ejecutes nuevamente los instaladores anteriores.
