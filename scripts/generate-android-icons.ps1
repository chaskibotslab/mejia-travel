# Genera iconos del launcher de Android desde supabase/mt.png
# Copia a todas las carpetas mipmap-* del proyecto Capacitor
Add-Type -AssemblyName System.Drawing

$root    = Split-Path -Parent $PSScriptRoot
$src     = Join-Path $root 'supabase\mt.png'
$resDir  = Join-Path $root 'android\app\src\main\res'

if (-not (Test-Path $src)) {
  Write-Error "No se encontro $src"
  exit 1
}

# Tamanios por densidad: [densidad, tamano_launcher, tamano_foreground]
$densities = @(
  @{ folder = 'mipmap-mdpi';     launcher = 48;  foreground = 108 },
  @{ folder = 'mipmap-hdpi';     launcher = 72;  foreground = 162 },
  @{ folder = 'mipmap-xhdpi';    launcher = 96;  foreground = 216 },
  @{ folder = 'mipmap-xxhdpi';   launcher = 144; foreground = 324 },
  @{ folder = 'mipmap-xxxhdpi';  launcher = 192; foreground = 432 }
)

$img = [System.Drawing.Image]::FromFile($src)

function Save-Resized($source, $size, $outPath) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.DrawImage($source, 0, 0, $size, $size)
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

function Save-WithPadding($source, $canvasSize, $outPath) {
  # El foreground del adaptive icon necesita ~10% de padding en cada lado
  # para que no quede cortado por la mascara (circulo/squircle)
  $padding = [int]($canvasSize * 0.18)
  $imgSize = $canvasSize - ($padding * 2)

  $bmp = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize)
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  # Fondo blanco (Play Store lo requiere transparente o color, aqui usamos blanco limpio)
  $g.Clear([System.Drawing.Color]::White)
  $rect = New-Object System.Drawing.Rectangle($padding, $padding, $imgSize, $imgSize)
  $g.DrawImage($source, $rect)
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

foreach ($d in $densities) {
  $dir = Join-Path $resDir $d.folder
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

  # ic_launcher.png (icono clasico)
  $launcherPath = Join-Path $dir 'ic_launcher.png'
  Save-Resized $img $d.launcher $launcherPath
  Write-Host "OK  $($d.folder)\ic_launcher.png ($($d.launcher)x$($d.launcher))"

  # ic_launcher_round.png (icono redondo)
  $roundPath = Join-Path $dir 'ic_launcher_round.png'
  Save-Resized $img $d.launcher $roundPath
  Write-Host "OK  $($d.folder)\ic_launcher_round.png"

  # ic_launcher_foreground.png (capa delantera del adaptive icon)
  $fgPath = Join-Path $dir 'ic_launcher_foreground.png'
  Save-WithPadding $img $d.foreground $fgPath
  Write-Host "OK  $($d.folder)\ic_launcher_foreground.png ($($d.foreground)x$($d.foreground))"
}

$img.Dispose()

# Actualizar el background del adaptive icon a blanco en XML
$v24Dir = Join-Path $resDir 'drawable-v24'
if (-not (Test-Path $v24Dir)) { New-Item -ItemType Directory -Path $v24Dir | Out-Null }

$anydpiDir = Join-Path $resDir 'mipmap-anydpi-v26'
if (-not (Test-Path $anydpiDir)) { New-Item -ItemType Directory -Path $anydpiDir | Out-Null }

$adaptiveLauncher = @'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
'@

Set-Content -Path (Join-Path $anydpiDir 'ic_launcher.xml') -Value $adaptiveLauncher -Encoding UTF8
Set-Content -Path (Join-Path $anydpiDir 'ic_launcher_round.xml') -Value $adaptiveLauncher -Encoding UTF8
Write-Host "OK  mipmap-anydpi-v26\ic_launcher*.xml"

# Color de fondo del adaptive icon (blanco)
$valuesDir = Join-Path $resDir 'values'
$colorsFile = Join-Path $valuesDir 'colors.xml'

if (Test-Path $colorsFile) {
  $content = Get-Content $colorsFile -Raw
  if ($content -notmatch 'ic_launcher_background') {
    $content = $content -replace '</resources>', "    <color name=""ic_launcher_background"">#FFFFFF</color>`n</resources>"
    Set-Content -Path $colorsFile -Value $content -Encoding UTF8
    Write-Host "OK  values\colors.xml (agregado ic_launcher_background)"
  } else {
    Write-Host "OK  values\colors.xml (ic_launcher_background ya existe)"
  }
} else {
  $colorsXml = @'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
'@
  Set-Content -Path $colorsFile -Value $colorsXml -Encoding UTF8
  Write-Host "OK  values\colors.xml (creado)"
}

Write-Host ""
Write-Host "Iconos generados. Ahora ejecuta:"
Write-Host "  cd .."
Write-Host "  npx cap sync android"
Write-Host "  cd android"
Write-Host "  .\gradlew assembleRelease"
