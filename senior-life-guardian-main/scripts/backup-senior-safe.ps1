# Backup Senior Safe -> disco externo
# Uso: .\scripts\backup-senior-safe.ps1 -Destination "D:\Backups"

param(
    [Parameter(Mandatory = $false)]
    [string]$Destination = "D:\Backups"
)

$ErrorActionPreference = "Stop"

$appRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $appRoot
$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$targetRoot = Join-Path $Destination "SeniorSafe-backup-$stamp"

if (-not (Test-Path $Destination)) {
    $driveRoot = Split-Path $Destination -Qualifier
    if ($driveRoot -and (Test-Path $driveRoot)) {
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    } else {
        Write-Error "No existe la ruta de destino: $Destination. Conecta el disco externo o indica otra ruta con -Destination."
    }
}

New-Item -ItemType Directory -Path $targetRoot -Force | Out-Null

Write-Host "Backup Senior Safe" -ForegroundColor Cyan
Write-Host "  Origen repo : $repoRoot"
Write-Host "  Origen app  : $appRoot"
Write-Host "  Destino     : $targetRoot"
Write-Host ""

$robocopyArgs = @(
    $repoRoot,
    (Join-Path $targetRoot "senior-life-guardian-repo"),
    "/E", "/R:2", "/W:2", "/NFL", "/NDL", "/NJH", "/NJS", "/NC", "/NS",
    "/XD", "node_modules", ".wrangler"
)

$robocopy = Start-Process -FilePath "robocopy.exe" -ArgumentList $robocopyArgs -Wait -PassThru -NoNewWindow
if ($robocopy.ExitCode -gt 7) {
    Write-Error "robocopy fallo con codigo $($robocopy.ExitCode)"
}

$gitInfo = @()
Push-Location $repoRoot
try {
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $gitInfo += "Git remote: $(git remote get-url origin 2>$null)"
        $gitInfo += "Git branch: $(git branch --show-current 2>$null)"
        $gitInfo += "Git commit: $(git log -1 --oneline 2>$null)"
        $gitInfo += ""
        $gitInfo += "--- git status ---"
        $gitInfo += (git status -sb 2>$null | Out-String)
    }
} finally {
    Pop-Location
}

$wranglerSecrets = @()
Push-Location $appRoot
try {
    if (Test-Path (Join-Path $appRoot "dist\server")) {
        $wranglerOut = npm run cf:secrets 2>&1 | Out-String
        $wranglerSecrets += $wranglerOut
    } else {
        $wranglerSecrets += "(dist/server no existe; ejecuta npm run build para listar secretos Cloudflare)"
    }
} catch {
    $wranglerSecrets += "(No se pudo listar secretos: $($_.Exception.Message))"
} finally {
    Pop-Location
}

$envExists = Test-Path (Join-Path $appRoot ".env")
$migrations = Get-ChildItem (Join-Path $appRoot "supabase\migrations\*.sql") -ErrorAction SilentlyContinue
$envLabel = if ($envExists) { "SI (contiene secretos de produccion)" } else { "NO - copiar manualmente" }

$content = @"
SENIOR SAFE - MANIFIESTO DE BACKUP
Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Carpeta: $targetRoot

=== ARCHIVOS CRITICOS ===
.env incluido: $envLabel
Migraciones SQL: $($migrations.Count) archivos en supabase/migrations/

=== PRODUCCION ===
Sitio: https://alarmaseniorsafe.cl
GitHub: https://github.com/enriquecasadesign1957/senior-life-guardian
Supabase project: cgcnjnhifdmornedzpid
Cloudflare Worker: senior-life-guardian

=== WEBHOOKS ===
WhatsApp: POST https://alarmaseniorsafe.cl/api/public/twilio-whatsapp-webhook
Twilio status: POST https://alarmaseniorsafe.cl/api/public/twilio-status-callback
Zoho email: POST https://alarmaseniorsafe.cl/api/public/zoho-email-webhook

=== NUMEROS ===
WhatsApp alertas: +56229147733
WhatsApp comercial: +56971404580
Email: hola@alarmaseniorsafe.cl

=== GIT ===
$($gitInfo -join "`n")

=== CLOUDFLARE SECRETS (nombres) ===
$($wranglerSecrets -join "`n")

=== RESTAURAR ===
Ver BACKUP.md en senior-life-guardian-main/senior-life-guardian-main/

"@

Set-Content -Path (Join-Path $targetRoot "MANIFEST.txt") -Value $content -Encoding UTF8

Copy-Item (Join-Path $appRoot "BACKUP.md") -Destination $targetRoot -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $appRoot "DEPLOY.md") -Destination $targetRoot -Force -ErrorAction SilentlyContinue

$sizeMb = [math]::Round((Get-ChildItem $targetRoot -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB, 1)

Write-Host ""
Write-Host "Backup completado." -ForegroundColor Green
Write-Host "  Ubicacion : $targetRoot"
Write-Host "  Tamano    : ~${sizeMb} MB"
Write-Host "  Manifiesto: $(Join-Path $targetRoot 'MANIFEST.txt')"
if (-not $envExists) {
    Write-Host "  AVISO: .env no encontrado - copia manual obligatoria." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Recomendado: cifrado BitLocker en el disco externo." -ForegroundColor DarkYellow
