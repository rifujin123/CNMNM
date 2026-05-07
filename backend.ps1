# Kích hoạt venv ở gốc repo, chạy Django trên mọi interface (LAN).
# Script đặt ở gốc repo → $PSScriptRoot chính là thư mục project.
$RepoRoot = $PSScriptRoot
$Activate = Join-Path $RepoRoot "venv\Scripts\Activate.ps1"
if (-not (Test-Path $Activate)) {
  Write-Error "Không thấy venv tại '$Activate'. Hãy tạo .venv trong thư mục repo (venv\Scripts\activate)."
  exit 1
}

. $Activate
$env:DJANGO_DEBUG = "True"
Set-Location (Join-Path $RepoRoot "backend")
python manage.py runserver 0.0.0.0:8000
