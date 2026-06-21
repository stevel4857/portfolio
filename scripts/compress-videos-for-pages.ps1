# Compress linked MP4s to fit Cloudflare Pages 25 MiB per-file limit.
$ErrorActionPreference = 'Stop'
$MaxBytes = 24 * 1024 * 1024  # 24 MiB safety margin

$Ffmpeg = 'C:\Users\Steve Luiting\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe'
$Ffprobe = 'C:\Users\Steve Luiting\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffprobe.exe'

$Root = Split-Path $PSScriptRoot -Parent
$OutDir = Join-Path $Root '.video-compress-tmp'
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Get-VideoInfo($Path) {
    $json = & $Ffprobe -v error -show_entries format=duration -show_entries stream=width,height -of json $Path | ConvertFrom-Json
    $duration = [double]$json.format.duration
    $video = $json.streams | Where-Object { $_.width } | Select-Object -First 1
    return @{
        Duration = $duration
        Width = [int]$video.width
        Height = [int]$video.height
    }
}

function Compress-Video($InputPath, $OutputPath) {
    $info = Get-VideoInfo $InputPath
    $targetKbps = [math]::Floor((($MaxBytes * 8) / $info.Duration) / 1000 * 0.92)
    if ($targetKbps -lt 400) { $targetKbps = 400 }
    $audioKbps = if ($targetKbps -gt 900) { 96 } else { 64 }
    $videoKbps = $targetKbps - $audioKbps

    $scale = if ($info.Width -ge 3840) { '1280:640' }
             elseif ($info.Width -ge 2560) { '1600:800' }
             else { '1280:640' }

    Write-Host "Compressing $(Split-Path $InputPath -Leaf): ${info.Duration}s -> ~${targetKbps}k total, scale=$scale"

    & $Ffmpeg -y -i $InputPath `
        -vf "scale=$scale" `
        -c:v libx264 -preset medium -pix_fmt yuv420p `
        -b:v "${videoKbps}k" -maxrate "${videoKbps}k" -bufsize "$($videoKbps * 2)k" `
        -c:a aac -b:a "${audioKbps}k" -ac 2 `
        -movflags +faststart `
        $OutputPath

    $size = (Get-Item $OutputPath).Length
    Write-Host "  -> $([math]::Round($size/1MB, 2)) MB"
    if ($size -gt $MaxBytes) {
        throw "Output still too large: $OutputPath ($size bytes)"
    }
}

$jobs = @(
    @{ Src = Join-Path $Root 'demos\360assets\LibraryShoot_final.mp4'; Out = Join-Path $OutDir 'LibraryShoot_final.mp4' },
    @{ Src = Join-Path $Root 'demos\360assets\VRVideooffice2019.mp4'; Out = Join-Path $OutDir 'VRVideooffice2019.mp4' },
    @{ Src = Join-Path $Root 'assets\LibraryShoot_browser_audio.mp4'; Out = Join-Path $OutDir 'LibraryShoot_browser_audio.mp4' }
)

foreach ($job in $jobs) {
    Compress-Video $job.Src $job.Out
}

$replacements = @(
    @{ From = Join-Path $OutDir 'LibraryShoot_final.mp4'; To = @(
        (Join-Path $Root 'assets\LibraryShoot_final.mp4'),
        (Join-Path $Root 'demos\360assets\LibraryShoot_final.mp4')
    )},
    @{ From = Join-Path $OutDir 'VRVideooffice2019.mp4'; To = @(
        (Join-Path $Root 'assets\VRVideooffice2019.mp4'),
        (Join-Path $Root 'demos\360assets\VRVideooffice2019.mp4')
    )},
    @{ From = Join-Path $OutDir 'LibraryShoot_browser_audio.mp4'; To = @(
        (Join-Path $Root 'assets\LibraryShoot_browser_audio.mp4')
    )}
)

foreach ($rep in $replacements) {
    foreach ($dest in $rep.To) {
        Copy-Item -Force $rep.From $dest
        Write-Host "Replaced $dest"
    }
}

Write-Host 'Done. All outputs under 24 MiB.'