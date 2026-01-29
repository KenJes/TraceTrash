#!/bin/bash
echo "===================================="
echo "LIMPIANDO CACHES DE EXPO Y METRO"
echo "===================================="
echo ""

echo "[1/5] Limpiando cache de npm..."
npm cache clean --force

echo "[2/5] Eliminando node_modules..."
rm -rf node_modules

echo "[3/5] Eliminando .expo cache..."
rm -rf .expo

echo "[4/5] Limpiando Metro bundler cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/react-* 2>/dev/null
rm -rf $TMPDIR/haste-map-* 2>/dev/null

echo "[5/5] Reinstalando dependencias..."
npm install

echo ""
echo "===================================="
echo "CACHE LIMPIADO EXITOSAMENTE"
echo "===================================="
echo ""
echo "Ahora ejecute: npx expo start --clear"
echo ""
