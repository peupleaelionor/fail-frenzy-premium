@echo off
REM FAIL FRENZY - Quick Start Script (Windows)
REM Usage: quick-start.bat

echo.
echo ====================================
echo  FAIL FRENZY - Quick Start Script
echo ====================================
echo.

REM Check Node.js
echo [1/5] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node -v') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:v=%

if %NODE_MAJOR% LSS 18 (
    echo ERROR: Node.js version must be 18 or higher
    node -v
    pause
    exit /b 1
)

echo SUCCESS: Node.js detected
node -v
echo.

REM Check npm
echo [2/5] Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo SUCCESS: npm detected
npm -v
echo.

REM Install dependencies
echo [3/5] Installing dependencies...
echo This may take 2-3 minutes...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo SUCCESS: Dependencies installed!
echo.

REM Build project
echo [4/5] Building project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo SUCCESS: Build complete!
echo.

REM Start dev server
echo [5/5] Starting development server...
echo.
echo ==========================================
echo  FAIL FRENZY is ready!
echo ==========================================
echo.
echo  Local:   http://localhost:5173
echo  Game:    http://localhost:5173/game
echo.
echo  Press Ctrl+C to stop the server
echo ==========================================
echo.

REM Open browser
start http://localhost:5173

REM Start dev server
call npm run dev
