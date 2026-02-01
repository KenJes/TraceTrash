@echo off
echo ====================================
echo LIMPIANDO CACHES DE EXPO Y METRO
echo ====================================
echo.

echo [1/6] Deteniendo procesos de Metro...
taskkill /F /IM node.exe 2>nul

echo [2/6] Limpiando cache de npm...
call npm cache clean --force

echo [3/6] Eliminando node_modules...
if exist node_modules (
    rmdir /s /q node_modules
)

echo [4/6] Eliminando .expo cache...
if exist .expo (
    rmdir /s /q .expo
)

echo [5/6] Limpiando Metro bundler cache...
if exist "%TEMP%\metro-*" (
    rmdir /s /q "%TEMP%\metro-*"
)
if exist "%TEMP%\react-*" (
    rmdir /s /q "%TEMP%\react-*"
)
if exist "%TEMP%\haste-map-*" (
    del /f /q "%TEMP%\haste-map-*"
)

echo [6/6] Reinstalando dependencias...
call npm install

echo.
echo ====================================
echo CACHE LIMPIADO EXITOSAMENTE
echo ====================================
echo.
echo Ahora ejecute: npx expo start --clear
echo.
pause
