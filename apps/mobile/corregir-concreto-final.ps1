param(
  [string]$ProjectRoot =
    "C:\Users\Eliel Teruel\CONTRACTOR-APP\apps\mobile"
)

$ErrorActionPreference = "Stop"

$calculationsPath = Join-Path `
  $ProjectRoot `
  "src\utils\calculations.ts"

$concretePath = Join-Path `
  $ProjectRoot `
  "src\app\calculos\concreto.tsx"

foreach ($path in @($calculationsPath, $concretePath)) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "No se encontró el archivo: $path"
  }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

Copy-Item `
  -LiteralPath $calculationsPath `
  -Destination "$calculationsPath.backup-$timestamp" `
  -Force

Copy-Item `
  -LiteralPath $concretePath `
  -Destination "$concretePath.backup-$timestamp" `
  -Force

$utf8NoBom =
  New-Object System.Text.UTF8Encoding($false)

$options =
  [System.Text.RegularExpressions.RegexOptions]::
    Singleline

# =========================================================
# 1. CORREGIR ConcreteInput
# =========================================================

$calculations = Get-Content `
  -LiteralPath $calculationsPath `
  -Raw

$concreteInputPattern = @'
export\s+type\s+ConcreteInput\s*=\s*\{(?<body>.*?)\r?\n\};
'@

$concreteInputRegex = New-Object `
  System.Text.RegularExpressions.Regex(
    $concreteInputPattern,
    $options
  )

$concreteInputMatch =
  $concreteInputRegex.Match($calculations)

if (-not $concreteInputMatch.Success) {
  throw "No se encontró el bloque ConcreteInput."
}

$concreteInputBody =
  $concreteInputMatch.Groups["body"].Value

if (
  $concreteInputBody -notmatch
    'cementDensityKgM3\?\s*:\s*number'
) {
  $newBody = [regex]::Replace(
    $concreteInputBody,
    '(gravelPriceMode\s*:\s*AggregatePriceMode\s*;)',
    @'
$1

  cementDensityKgM3?: number;
  dryVolumeFactor?: number;
  defaultAggregateBagVolume?: number;
'@,
    1
  )

  if ($newBody -eq $concreteInputBody) {
    throw "No se encontró gravelPriceMode dentro de ConcreteInput."
  }

  $newConcreteInput =
    "export type ConcreteInput = {" +
    $newBody +
    "`r`n};"

  $calculations =
    $calculations.Substring(
      0,
      $concreteInputMatch.Index
    ) +
    $newConcreteInput +
    $calculations.Substring(
      $concreteInputMatch.Index +
      $concreteInputMatch.Length
    )

  Write-Host `
    "ConcreteInput actualizado." `
    -ForegroundColor Green
} else {
  Write-Host `
    "ConcreteInput ya estaba actualizado." `
    -ForegroundColor Yellow
}

[System.IO.File]::WriteAllText(
  $calculationsPath,
  $calculations,
  $utf8NoBom
)

# =========================================================
# 2. CORREGIR IMPORTS Y HOOK EN concreto.tsx
# =========================================================

$concrete = Get-Content `
  -LiteralPath $concretePath `
  -Raw

if (
  $concrete -notmatch
    'import\s*\{\s*useFormulaParameters\s*\}\s*from\s*"\.\./\.\./hooks/useFormulaParameters"'
) {
  $companyImport =
    'import { useCompany } from "../../contexts/CompanyContext";'

  if (-not $concrete.Contains($companyImport)) {
    throw "No se encontró el import de CompanyContext."
  }

  $concrete = $concrete.Replace(
    $companyImport,
    @'
import { useCompany } from "../../contexts/CompanyContext";
import { useFormulaParameters } from "../../hooks/useFormulaParameters";
'@
  )

  Write-Host `
    "Import useFormulaParameters agregado." `
    -ForegroundColor Green
} else {
  Write-Host `
    "Import useFormulaParameters ya existe." `
    -ForegroundColor Yellow
}

$formulaImportPattern = @'
import\s*\{(?<names>.*?)\}\s*from\s*"\.\./\.\./utils/formula-parameters"\s*;
'@

$formulaImportRegex = New-Object `
  System.Text.RegularExpressions.Regex(
    $formulaImportPattern,
    $options
  )

$formulaImportMatch =
  $formulaImportRegex.Match($concrete)

if ($formulaImportMatch.Success) {
  $importNames =
    $formulaImportMatch.Groups["names"].Value

  if (
    $importNames -notmatch
      '\bgetFormulaNumber\b'
  ) {
    $newNames =
      $importNames.TrimEnd() +
      ",`r`n  getFormulaNumber,`r`n"

    $newImport =
      "import {" +
      $newNames +
      '} from "../../utils/formula-parameters";'

    $concrete =
      $concrete.Substring(
        0,
        $formulaImportMatch.Index
      ) +
      $newImport +
      $concrete.Substring(
        $formulaImportMatch.Index +
        $formulaImportMatch.Length
      )

    Write-Host `
      "getFormulaNumber agregado al import existente." `
      -ForegroundColor Green
  } else {
    Write-Host `
      "Import getFormulaNumber ya existe." `
      -ForegroundColor Yellow
  }
} else {
  $localStoragePattern = @'
(import\s*\{\s*loadLocalData\s*,\s*saveLocalData\s*,?\s*\}\s*from\s*"\.\./\.\./utils/local-storage"\s*;)
'@

  $localStorageRegex = New-Object `
    System.Text.RegularExpressions.Regex(
      $localStoragePattern,
      $options
    )

  if (-not $localStorageRegex.IsMatch($concrete)) {
    throw "No se encontró el import de local-storage."
  }

  $concrete = $localStorageRegex.Replace(
    $concrete,
    @'
$1
import {
  getFormulaNumber,
} from "../../utils/formula-parameters";
'@,
    1
  )

  Write-Host `
    "Import getFormulaNumber agregado." `
    -ForegroundColor Green
}

if (
  $concrete -notmatch
    'parameters\s*:\s*formulaParameters'
) {
  $companyHookPattern =
    '(const\s*\{\s*activeCompany\s*\}\s*=\s*useCompany\(\)\s*;)'

  $companyHookRegex = New-Object `
    System.Text.RegularExpressions.Regex(
      $companyHookPattern,
      $options
    )

  if (-not $companyHookRegex.IsMatch($concrete)) {
    throw "No se encontró useCompany() dentro de la pantalla."
  }

  $concrete = $companyHookRegex.Replace(
    $concrete,
    @'
$1
  const {
    parameters: formulaParameters,
  } = useFormulaParameters(
    activeCompany?.id,
    "concrete_standard",
  );
'@,
    1
  )

  Write-Host `
    "Hook concrete_standard agregado." `
    -ForegroundColor Green
} else {
  Write-Host `
    "Hook concrete_standard ya existe." `
    -ForegroundColor Yellow
}

[System.IO.File]::WriteAllText(
  $concretePath,
  $concrete,
  $utf8NoBom
)

Write-Host ""
Write-Host `
  "Corrección final de concreto aplicada." `
  -ForegroundColor Cyan
Write-Host `
  "Ejecuta ahora: npx tsc --noEmit" `
  -ForegroundColor Cyan
