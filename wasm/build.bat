@echo off
REM ============================================================
REM AsciiLens — WASM Build Script
REM Compiles C++ to WebAssembly via Emscripten
REM ============================================================

echo [AsciiLens] Setting up Emscripten environment...
call "%~dp0..\emsdk\emsdk_env.bat" >nul 2>&1

echo [AsciiLens] Compiling C++ to WASM...

if not exist "%~dp0build" mkdir "%~dp0build"

em++ ^
    "%~dp0src\ascii_engine.cpp" ^
    "%~dp0src\presets.cpp" ^
    "%~dp0src\color_system.cpp" ^
    "%~dp0src\performance_monitor.cpp" ^
    "%~dp0src\bindings.cpp" ^
    -o "%~dp0build\ascii_engine.mjs" ^
    -s WASM=1 ^
    -s MODULARIZE=1 ^
    -s EXPORT_NAME="createAsciiEngine" ^
    -s EXPORT_ES6=1 ^
    -s ALLOW_MEMORY_GROWTH=1 ^
    -s EXPORTED_RUNTIME_METHODS="['HEAPU8']" ^
    -s EXPORTED_FUNCTIONS="['_malloc', '_free']" ^
    -s ENVIRONMENT="web" ^
    -s SINGLE_FILE=0 ^
    --bind ^
    -O2 ^
    -std=c++17

if %ERRORLEVEL% EQU 0 (
    echo [AsciiLens] Build successful!
    echo   - %~dp0build\ascii_engine.mjs
    echo   - %~dp0build\ascii_engine.wasm
) else (
    echo [AsciiLens] Build FAILED!
    exit /b 1
)
