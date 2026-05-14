#Requires -Version 5.1
<#
.SYNOPSIS
  تهيئة Git (إن لزم)، ربط origin، دمج main عن بُعد، ثم commit وpush لفرع main.
  المستودع: https://github.com/mahmoud-fouad2/Rejuvira1

.USAGE
  1) ثبّت Git for Windows: https://git-scm.com/download/win
  2) من PowerShell (كمسؤول إن لزم لتنفيذ السكربتات):
     cd "C:\Users\user\Desktop\Rejuvira1-main repo"
     .\scripts\sync-to-github-main.ps1

  لفرض الدفع مع تجاهل تاريخ بعيد (خطير — استخدمه فقط إذا قررت أن المحلي هو المصدر الوحيد):
     .\scripts\sync-to-github-main.ps1 -ForcePush

.NOTES
  لا يُرفع ملف .env — محمي عبر .gitignore
#>

param(
  [switch]$ForcePush
)

$ErrorActionPreference = "Stop"
$RemoteUrl = "https://github.com/mahmoud-fouad2/Rejuvira1.git"

function Test-GitAvailable {
  return [bool](Get-Command git -ErrorAction SilentlyContinue)
}

if (-not (Test-GitAvailable)) {
  Write-Error @"
Git غير مثبت أو غير موجود في PATH.
ثبّت Git من https://git-scm.com/download/win
أعد فتح PowerShell ثم أعد تشغيل هذا السكربت.
"@
}

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RepoRoot

Write-Host "المجلد: $RepoRoot" -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
  Write-Host "تهيئة مستودع محلي (git init)..." -ForegroundColor Yellow
  git init
  git branch -M main
}

$hasOrigin = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
  git remote add origin $RemoteUrl
  Write-Host "تمت إضافة remote: origin" -ForegroundColor Green
}
else {
  $current = git remote get-url origin
  if ($current -ne $RemoteUrl) {
    git remote set-url origin $RemoteUrl
    Write-Host "تم تحديث origin إلى $RemoteUrl" -ForegroundColor Green
  }
}

Write-Host "جلب origin..." -ForegroundColor Cyan
git fetch origin 2>$null

$remoteMainExists = git rev-parse --verify "origin/main" 2>$null
if ($LASTEXITCODE -eq 0 -and $remoteMainExists) {
  Write-Host "دمج origin/main مع المحلي (allow-unrelated-histories)..." -ForegroundColor Yellow
  git merge "origin/main" --allow-unrelated-histories -m "merge: align local workspace with remote main" 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Warning @"
فشل الدمج التلقائي (ربما تعارض ملفات).
أصلح التعارضات يدوياً ثم:
  git add -A
  git commit -m "resolve merge"
  git push -u origin main
"@
    exit 1
  }
}

git add -A
$status = git status --porcelain
if (-not $status) {
  Write-Host "لا توجد تغييرات للالتزام بها." -ForegroundColor Gray
}
else {
  git commit -m "chore: sync local Rejuvira updates to main (UI, deploy, Tailwind prod deps)"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "ملاحظة: قد يكون الالتزام فارغاً أو يحتاج تكوين user.name / user.email." -ForegroundColor Yellow
    git config user.email 2>$null
    if ($LASTEXITCODE -ne 0) {
      Write-Error @"
اضبط هوية Git ثم أعد المحاولة:
  git config user.email "you@example.com"
  git config user.name "Your Name"
"@
    }
    exit 1
  }
}

if ($ForcePush) {
  Write-Warning "Force push إلى main — سيستبدل التاريخ البعيد إذا كان مختلفاً."
  git push -u origin main --force
}
else {
  git push -u origin main
}

if ($LASTEXITCODE -eq 0) {
  Write-Host "تم الدفع إلى origin/main بنجاح." -ForegroundColor Green
}
else {
  Write-Error @"
فشل git push. غالباً تحتاج مصادقة GitHub:
  - PAT من Settings → Developer settings → Personal access tokens
  - أو: gh auth login
  - أو: SSH key مع remote git@github.com:mahmoud-fouad2/Rejuvira1.git
"@
}
