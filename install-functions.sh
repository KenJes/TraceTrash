#!/bin/bash
# Script de instalación rápida de Cloud Functions
# Para Linux/Mac

echo "🚀 Instalando Cloud Functions para TraceTrash..."
echo ""

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instala Node.js v18+ desde https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js instalado: $NODE_VERSION"

# Verificar Firebase CLI
echo ""
echo "📦 Verificando Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo "⚠️ Firebase CLI no encontrado. Instalando..."
    npm install -g firebase-tools
    if [ $? -ne 0 ]; then
        echo "❌ Error al instalar Firebase CLI"
        exit 1
    fi
else
    FIREBASE_VERSION=$(firebase --version)
    echo "✅ Firebase CLI instalado: $FIREBASE_VERSION"
fi

# Ir al directorio functions
echo ""
echo "📂 Navegando a carpeta functions..."
cd functions

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi
echo "✅ Dependencias instaladas correctamente"

# Compilar TypeScript
echo ""
echo "🔨 Compilando TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error al compilar TypeScript"
    exit 1
fi
echo "✅ TypeScript compilado correctamente"

# Regresar a la raíz
cd ..

echo ""
echo "✅ ¡Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ejecuta: firebase login"
echo "2. Ejecuta: firebase use --add (selecciona tu proyecto)"
echo "3. Verifica que tu proyecto esté en plan Blaze"
echo "4. Ejecuta: firebase deploy --only functions"
echo ""
echo "📖 Ver DEPLOYMENT_FUNCTIONS.md para más detalles"
