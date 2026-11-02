# Genera el keystore de firma para Google Play (ejecutar UNA sola vez).
# Guarda el .jks en lugar seguro; nunca lo subas a Git.
#
# Uso:
#   cd senior-life-guardian-main
#   .\scripts\generate-play-keystore.ps1
#
# Luego codifica en Base64 para GitHub Secret ANDROID_KEYSTORE_BASE64:
#   [Convert]::ToBase64String([IO.File]::ReadAllBytes(".\senior-safe-release.jks"))

param(
  [string]$OutFile = "senior-safe-release.jks",
  [string]$Alias = "senior-safe",
  [int]$ValidityDays = 10000
)

$ErrorActionPreference = "Stop"

if (Test-Path $OutFile) {
  Write-Host "Ya existe $OutFile — renómbralo o bórralo antes de regenerar." -ForegroundColor Yellow
  exit 1
}

Write-Host "Generando keystore para Google Play..." -ForegroundColor Cyan
Write-Host "Alias: $Alias"
Write-Host ""

$storePass = Read-Host "Contraseña del keystore (guardarla en ANDROID_KEYSTORE_PASSWORD)" -AsSecureString
$keyPassSecure = Read-Host "Contraseña de la clave [Enter = misma que keystore]" -AsSecureString

function ConvertToPlain([Security.SecureString]$secure) {
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

$storePlain = ConvertToPlain $storePass
$keyPlain = if ($keyPassSecure.Length -gt 0) { ConvertToPlain $keyPassSecure } else { $storePlain }

$dname = "CN=Senior Safe, OU=Mobile, O=Alarma Senior Safe, L=Santiago, ST=RM, C=CL"

& keytool -genkeypair -v `
  -storetype PKCS12 `
  -keystore $OutFile `
  -alias $Alias `
  -keyalg RSA `
  -keysize 2048 `
  -validity $ValidityDays `
  -storepass $storePlain `
  -keypass $keyPlain `
  -dname $dname

Write-Host ""
Write-Host "Keystore creado: $OutFile" -ForegroundColor Green
Write-Host ""
Write-Host "GitHub Secrets (Settings → Secrets → Actions):" -ForegroundColor Cyan
Write-Host "  ANDROID_KEYSTORE_BASE64     = (Base64 del archivo .jks)"
Write-Host "  ANDROID_KEYSTORE_PASSWORD   = contraseña del keystore"
Write-Host "  ANDROID_KEY_ALIAS           = $Alias"
Write-Host "  ANDROID_KEY_PASSWORD        = contraseña de la clave (opcional si es la misma)"
Write-Host ""
Write-Host "Base64 en PowerShell:" -ForegroundColor Cyan
Write-Host "  [Convert]::ToBase64String([IO.File]::ReadAllBytes(`".\$OutFile`"))"
