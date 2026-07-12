param(
  [string]$ProjectRoot =
    "C:\Users\Eliel Teruel\CONTRACTOR-APP\apps\mobile"
)

$ErrorActionPreference = "Stop"

$concretePath = Join-Path `
  $ProjectRoot `
  "src\app\calculos\concreto.tsx"

if (-not (Test-Path -LiteralPath $concretePath)) {
  throw "No se encontro concreto.tsx"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath =
  "$concretePath.backup-$timestamp"

Copy-Item `
  -LiteralPath $concretePath `
  -Destination $backupPath `
  -Force

$content = Get-Content `
  -LiteralPath $concretePath `
  -Raw

$options =
  [System.Text.RegularExpressions.RegexOptions]::
    Singleline

# Quita los parámetros de cálculo del objeto
# ConcreteSavedSettings donde fueron insertados por error.
$savedSettingsPattern = @'
(const\s+settings\s*:\s*ConcreteSavedSettings\s*=\s*\{.*?sandPriceMode\s*,\s*gravelPriceMode\s*,)\s*cementDensityKgM3\s*:.*?defaultAggregateBagVolume\s*:\s*getFormulaNumber\s*\(.*?\)\s*,\s*(\};)
'@

$savedRegex = New-Object `
  System.Text.RegularExpressions.Regex(
    $savedSettingsPattern,
    $options
  )

if ($savedRegex.IsMatch($content)) {
  $content = $savedRegex.Replace(
    $content,
    '$1' + "`r`n    " + '$2',
    1
  )

  Write-Host `
    "Corregido el objeto ConcreteSavedSettings." `
    -ForegroundColor Green
} else {
  Write-Host `
    "El objeto ConcreteSavedSettings ya estaba corregido." `
    -ForegroundColor Yellow
}

# Inserta los parámetros únicamente dentro de
# la llamada calculateConcrete(...).
$calculatePattern = @'
(const\s+calculatedResult\s*=\s*calculateConcrete\s*\(\s*\{.*?sandPriceMode\s*,\s*gravelPriceMode\s*,)(\s*\}\s*,\s*\{)
'@

$calculateRegex = New-Object `
  System.Text.RegularExpressions.Regex(
    $calculatePattern,
    $options
  )

$calculationBlockPattern = @'
const\s+calculatedResult\s*=\s*calculateConcrete\s*\(\s*\{.*?cementDensityKgM3\s*:
'@

if (
  [regex]::IsMatch(
    $content,
    $calculationBlockPattern,
    $options
  )
) {
  Write-Host `
    "La llamada calculateConcrete ya contiene los parametros." `
    -ForegroundColor Yellow
} elseif ($calculateRegex.IsMatch($content)) {
  $insertion = @'
$1
        cementDensityKgM3:
          getFormulaNumber(
            formulaParameters,
            "cement_density_kg_m3",
            1440,
          ),
        dryVolumeFactor:
          getFormulaNumber(
            formulaParameters,
            "dry_volume_factor",
            1.54,
          ),
        defaultAggregateBagVolume:
          getFormulaNumber(
            formulaParameters,
            "aggregate_bag_volume_m3",
            0.0142,
          ),$2
'@

  $content = $calculateRegex.Replace(
    $content,
    $insertion,
    1
  )

  Write-Host `
    "Parametros agregados a calculateConcrete." `
    -ForegroundColor Green
} else {
  throw "No se encontro la llamada calculateConcrete para corregirla."
}

$utf8NoBom =
  New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
  $concretePath,
  $content,
  $utf8NoBom
)

Write-Host ""
Write-Host `
  "Reparacion terminada." `
  -ForegroundColor Cyan
Write-Host `
  "Respaldo: $backupPath" `
  -ForegroundColor Cyan
Write-Host `
  "Ejecuta ahora: npx tsc --noEmit" `
  -ForegroundColor Cyan
