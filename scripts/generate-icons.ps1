# Genera todos los iconos PWA + apple-touch + favicon desde supabase/mt.png
Add-Type -AssemblyName System.Drawing

$root   = Split-Path -Parent $PSScriptRoot
$src    = Join-Path $root 'supabase\mt.png'
$outDir = Join-Path $root 'public\icons'
$publicDir = Join-Path $root 'public'

if (-not (Test-Path $src)) {
  Write-Error "No se encontro $src"
  exit 1
}
if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir | Out-Null
}

$sizes = @(48, 72, 96, 128, 144, 152, 192, 256, 384, 512, 1024)
$img = [System.Drawing.Image]::FromFile($src)

function Resize-Save($source, $size, $outPath) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.DrawImage($source, 0, 0, $size, $size)
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

foreach ($s in $sizes) {
  $out = Join-Path $outDir ("icon-$s.png")
  Resize-Save $img $s $out
  Write-Host "OK  icon-$s.png"
}

# apple-touch-icon (iOS Safari y Add to Home)
Resize-Save $img 180 (Join-Path $publicDir 'apple-touch-icon.png')
Write-Host "OK  apple-touch-icon.png (180)"

# favicon clasico (32x32 sirve para favicon.ico modernos)
Resize-Save $img 32 (Join-Path $publicDir 'favicon-32x32.png')
Resize-Save $img 16 (Join-Path $publicDir 'favicon-16x16.png')
Write-Host "OK  favicons (16, 32)"

$img.Dispose()
Write-Host ""
Write-Host "Listo. Todos los iconos regenerados desde supabase/mt.png"
