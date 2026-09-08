# Start the Mediora AI FastAPI backend in the current PowerShell session.
# Usage: .\start_backend.ps1
#        .\start_backend.ps1 -Port 8000 -Reload

[CmdletBinding()]
param(
    [int]$Port = 8000,
    [switch]$Reload,
    [string]$Host = "127.0.0.1"
)

$ErrorActionPreference = "Stop"
$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $BackendDir

if (-not (Test-Path ".\venv\Scripts\python.exe")) {
    Write-Host "Backend virtualenv not found at $BackendDir\venv" -ForegroundColor Red
    Write-Host "Create it first:  python -m venv venv ; .\venv\Scripts\Activate.ps1 ; pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Make sure the chest model can print its progress bar without codec errors.
$env:PYTHONIOENCODING = "utf-8"
$env:TF_CPP_MIN_LOG_LEVEL = "2"

$uvicornArgs = @("main:app", "--host", $Host, "--port", $Port)
if ($Reload) { $uvicornArgs += "--reload" }

Write-Host "Starting Mediora AI backend at http://$Host`:$Port ..." -ForegroundColor Cyan
& ".\venv\Scripts\python.exe" -m uvicorn @uvicornArgs
