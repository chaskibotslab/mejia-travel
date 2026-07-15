# =============================================================================
# FIRMA Y CONSTRUYE el APK/AAB de Mejia Travel para Play Store
# Ejecutar desde la raiz del proyecto:
#   powershell -ExecutionPolicy Bypass -File scripts\sign-and-build.ps1
# =============================================================================

$keytool   = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
$root      = Split-Path -Parent $PSScriptRoot
$keystoreFile = Join-Path $root 'android\mejiatravel.keystore'
$propFile  = Join-Path $root 'android\key.properties'
$buildGradle = Join-Path $root 'android\app\build.gradle'
$androidDir = Join-Path $root 'android'

# ---- PASO 1: Generar keystore si no existe -----------------------------------
if (-not (Test-Path $keystoreFile)) {
  Write-Host ""
  Write-Host "============================================"
  Write-Host " GENERANDO KEYSTORE DE FIRMA"
  Write-Host "============================================"
  Write-Host "Introduce una contrasenia para el keystore (minimo 6 caracteres)."
  Write-Host "GUARDALA EN UN LUGAR SEGURO. Sin ella no podras actualizar la app en Play Store."
  Write-Host ""
  $pass1 = Read-Host "Contrasenia del keystore" -AsSecureString
  $pass2 = Read-Host "Confirma la contrasenia"  -AsSecureString
  $p1 = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass1))
  $p2 = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass2))
  if ($p1 -ne $p2) { Write-Error "Las contrasenias no coinciden."; exit 1 }
  if ($p1.Length -lt 6) { Write-Error "La contrasenia debe tener al menos 6 caracteres."; exit 1 }

  & $keytool -genkey -v `
    -keystore $keystoreFile `
    -alias mejiatravel `
    -keyalg RSA -keysize 2048 `
    -validity 10000 `
    -storepass $p1 `
    -keypass $p1 `
    -dname "CN=Mejia Travel, OU=Chaski Bots Lab, O=Chaski Bots Lab, L=Machachi, S=Pichincha, C=EC"

  if ($LASTEXITCODE -ne 0) { Write-Error "Error generando keystore."; exit 1 }

  # Guardar propiedades (NO subir a git)
  $propContent = @"
storeFile=../mejiatravel.keystore
storePassword=$p1
keyAlias=mejiatravel
keyPassword=$p1
"@
  Set-Content -Path $propFile -Value $propContent -Encoding UTF8
  Write-Host ""
  Write-Host "Keystore guardado en: $keystoreFile"
  Write-Host "IMPORTANTE: Guarda tambien este archivo: $propFile"
  Write-Host ""
} else {
  Write-Host "Keystore ya existe: $keystoreFile"
  if (-not (Test-Path $propFile)) {
    Write-Host "Falta key.properties. Introduce la contrasenia del keystore existente:"
    $pass = Read-Host "Contrasenia"
    $propContent = @"
storeFile=../mejiatravel.keystore
storePassword=$pass
keyAlias=mejiatravel
keyPassword=$pass
"@
    Set-Content -Path $propFile -Value $propContent -Encoding UTF8
  }
}

# ---- PASO 2: Configurar signing en build.gradle si no esta configurado -------
$gradleContent = Get-Content $buildGradle -Raw

if ($gradleContent -notmatch 'signingConfigs') {
  Write-Host "Configurando signing en build.gradle..."

  $signingBlock = @'

def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

'@

  $releaseSigningConfig = @'
        signingConfigs {
            release {
                if (keystorePropertiesFile.exists()) {
                    storeFile file(keystoreProperties['storeFile'])
                    storePassword keystoreProperties['storePassword']
                    keyAlias keystoreProperties['keyAlias']
                    keyPassword keystoreProperties['keyPassword']
                }
            }
        }
'@

  # Agregar bloque de propiedades antes de "android {"
  $gradleContent = $gradleContent -replace '(android \{)', "$signingBlock`$1"

  # Agregar signingConfigs dentro de "android {"
  $gradleContent = $gradleContent -replace '(android \{)', "`$1`n$releaseSigningConfig"

  # Configurar buildType release para usar signingConfig
  $gradleContent = $gradleContent -replace '(buildTypes \{[^}]*release \{)', "`$1`n            signingConfig signingConfigs.release"

  Set-Content -Path $buildGradle -Value $gradleContent -Encoding UTF8
  Write-Host "build.gradle actualizado con signing config."
} else {
  Write-Host "Signing ya configurado en build.gradle."
}

# ---- PASO 3: npx cap sync ---------------------------------------------------
Write-Host ""
Write-Host "Sincronizando Capacitor..."
Set-Location $root
& npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Warning "cap sync tuvo advertencias, continuando..." }

# ---- PASO 4: Compilar APK firmado y AAB -------------------------------------
Write-Host ""
Write-Host "============================================"
Write-Host " COMPILANDO APK + AAB FIRMADOS"
Write-Host "============================================"
Set-Location $androidDir

Write-Host "Compilando APK release..."
& .\gradlew assembleRelease
if ($LASTEXITCODE -ne 0) { Write-Error "Error compilando APK."; exit 1 }

Write-Host "Compilando AAB release (para Play Store)..."
& .\gradlew bundleRelease
if ($LASTEXITCODE -ne 0) { Write-Error "Error compilando AAB."; exit 1 }

# ---- RESULTADO ---------------------------------------------------------------
Write-Host ""
Write-Host "============================================"
Write-Host " BUILD EXITOSO"
Write-Host "============================================"
$apkPath = Join-Path $androidDir 'app\build\outputs\apk\release\app-release.apk'
$aabPath = Join-Path $androidDir 'app\build\outputs\bundle\release\app-release.aab'

if (Test-Path $apkPath) {
  $size = [math]::Round((Get-Item $apkPath).Length / 1MB, 1)
  Write-Host "APK (instalar en celular):     $apkPath ($size MB)"
}
if (Test-Path $aabPath) {
  $size = [math]::Round((Get-Item $aabPath).Length / 1MB, 1)
  Write-Host "AAB (subir a Play Store):      $aabPath ($size MB)"
}
Write-Host ""
Write-Host "Abriendo carpeta de salida..."
explorer (Join-Path $androidDir 'app\build\outputs')
