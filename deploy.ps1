param([string]$Message = "Deploy iller7")

Write-Host "Validating questions..." -ForegroundColor Cyan
python scripts/validate.py
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Bundling content..." -ForegroundColor Cyan
python scripts/bundle.py
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Committing and pushing..." -ForegroundColor Cyan
git add .
git commit -m $Message
git push origin main

Write-Host "Done! GitHub Actions will deploy." -ForegroundColor Green
