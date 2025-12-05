# Script de instalación rápida de Cloud Functions
# Windows PowerShell

Write-Host "🚀 Instalando Cloud Functions para TraceTrash..." -ForegroundColor Green
Write-Host ""

# Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js no está instalado. Instala Node.js v18+ desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green

# Verificar Firebase CLI
Write-Host ""
Write-Host "📦 Verificando Firebase CLI..." -ForegroundColor Yellow
$firebaseVersion = firebase --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Firebase CLI no encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g firebase-tools
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar Firebase CLI" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Firebase CLI instalado: $firebaseVersion" -ForegroundColor Green
}

# Ir al directorio functions
Write-Host ""
Write-Host "📂 Navegando a carpeta functions..." -ForegroundColor Yellow
Set-Location functions

# Instalar dependencias
Write-Host ""
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green

# Compilar TypeScript
Write-Host ""
Write-Host "🔨 Compilando TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar TypeScript" -ForegroundColor Red
    exit 1
}
Write-Host "✅ TypeScript compilado correctamente" -ForegroundColor Green

# Regresar a la raíz
Set-Location ..

Write-Host ""
Write-Host "✅ ¡Instalación completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Ejecuta: firebase login" -ForegroundColor White
Write-Host "2. Ejecuta: firebase use --add (selecciona tu proyecto)" -ForegroundColor White
Write-Host "3. Verifica que tu proyecto esté en plan Blaze" -ForegroundColor White
Write-Host "4. Ejecuta: firebase deploy --only functions" -ForegroundColor White
Write-Host ""
Write-Host "📖 Ver DEPLOYMENT_FUNCTIONS.md para más detalles" -ForegroundColor Yellow
