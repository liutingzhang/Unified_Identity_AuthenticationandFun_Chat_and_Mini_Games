@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title Auth System - One-Click Start

:: ========================================
::   Auth System One-Click Start Script
:: ========================================
echo.

:: 1. Administrative Privileges Check
echo --- [1/4] Checking for Administrator privileges...
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ^> WARNING: Not running as Administrator. Continuing...
) else (
    echo ✓ Administrator privileges granted.
)
echo.

:: 2. Define local paths and set temporary environment
echo --- [2/4] Setting up local environment...
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
set "NODE_DIR=%SCRIPT_DIR%\node"
set "PHP_DIR=%SCRIPT_DIR%\php"
set "AUTH_SYSTEM_PATH=%SCRIPT_DIR%\auth-system"

if not exist "%NODE_DIR%" (goto ERROR_NO_EXEC)
if not exist "%PHP_DIR%" (goto ERROR_NO_EXEC)
if not exist "%AUTH_SYSTEM_PATH%" (goto ERROR_NO_EXEC)

:: Set PATH for this session ONLY. This is the safe way.
set "PATH=%NODE_DIR%;%PHP_DIR%;%PATH%"
echo ✓ Environment PATH set for this session.
echo.

:: 2.1 Check PHP Runtime
echo --- [2.1/4] Checking PHP Runtime...
php -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ^> PHP runtime check failed. Attempting to fix VCRUNTIME...
    if exist "%SCRIPT_DIR%\VC_redist.x64.exe" (
        echo ^> Installing VC++ Redistributable...
        "%SCRIPT_DIR%\VC_redist.x64.exe" /install /passive /norestart
        timeout /t 5 >nul
        echo ^> Installation command executed. Retrying PHP check...
        php -v >nul 2>&1
        if %errorlevel% neq 0 (
             echo ^> WARNING: PHP still failed to run. Backend might not work.
             echo ^> Please try running VC_redist.x64.exe manually.
        ) else (
             echo ^> ✓ PHP Runtime fixed.
        )
    ) else (
        echo ^> WARNING: VC_redist.x64.exe not found. PHP might fail.
    )
) else (
    echo ^> ✓ PHP Runtime check passed.
)
echo.

:: 3. Install Dependencies
echo --- [3/4] Preparing project...
cd /d "%AUTH_SYSTEM_PATH%"

if not exist "package.json" (
    echo ^> ERROR: package.json not found.
    goto ERROR_EXIT
)

echo ^> Checking for npm dependencies...
if not exist "node_modules" (
    echo ^> Dependencies not found. Installing now, please wait...
    npm install
    if %errorlevel% neq 0 (
        echo ^> ERROR: npm install failed. Check your network or run manually.
        goto ERROR_EXIT
    )
    echo ^> ✓ Dependencies installed successfully.
) else (
    echo ^> ✓ Dependencies already exist.
)
echo.

set "BACKEND_PORT=8000"
set "AUTH_PORT=5172"
set "SUBSITE_START_PORT=5173"

:: 4. Start Servers
echo --- [4/4] Starting servers...
echo ========================================
echo.
echo ^> Frontend will be at: http://localhost:%AUTH_PORT%
echo ^> Backend will be at:  http://localhost:%BACKEND_PORT%
echo ^> Close this window to stop the services.
echo.

echo ^> --- Starting Auth Backend (PHP)...
start "" /B /D "%AUTH_SYSTEM_PATH%\api" php -S 127.0.0.1:%BACKEND_PORT% index.php

echo ^> --- Starting Auth Frontend (Vite)...
set "API_PORT=%BACKEND_PORT%"
start "" /B /D "%AUTH_SYSTEM_PATH%" npx vite --port %AUTH_PORT% --host --strictPort --open

echo ^> --- Starting Logoly (Vite)...
if exist "%SCRIPT_DIR%\logoly-master" (
    echo ^> Starting Logoly on port 5173
    call :ENSURE_NODE_MODULES "%SCRIPT_DIR%\logoly-master"
    start "" /B /D "%SCRIPT_DIR%\logoly-master" npx vite --port 5173 --host --strictPort
    echo ^> Logoly will be at: http://localhost:5173
)

echo ^> --- Starting ainvyou (Python)...
if exist "%SCRIPT_DIR%\ainvyou\server.py" (
    if exist "%SCRIPT_DIR%\ainvyou\Python\python.exe" (
        echo ^> Starting ainvyou server on port 5174
        start "" /B /D "%SCRIPT_DIR%\ainvyou" "%SCRIPT_DIR%\ainvyou\Python\python.exe" "%SCRIPT_DIR%\ainvyou\server.py" --host 0.0.0.0 --port 5174
        echo ^> ainvyou will be at: http://localhost:5174
    ) else (
        echo ^> WARNING: ainvyou\Python\python.exe not found. Skipped starting ainvyou.
    )
)

goto END

:ERROR_NO_EXEC
echo.
echo --- !!! OPERATION FAILED !!! ---
echo ^> A critical folder ('node', 'php', or 'auth-system') is missing.
echo ^> Please ensure the project structure is complete.
goto END

:ERROR_EXIT
echo.
echo --- !!! OPERATION FAILED !!! ---
echo ^> A critical error occurred. Please check the output above.
goto END

:END
echo.
if defined NO_PAUSE goto END_NO_PAUSE
pause
:END_NO_PAUSE
exit /b

:IS_PORT_IN_USE
set "PORT_TO_CHECK=%~1"
netstat -ano -p tcp | findstr /R /C:"^[ ]*TCP[ ]*[^ ]*:%PORT_TO_CHECK%[ ]" >nul 2>&1
if %errorlevel% EQU 0 (exit /b 0) else (exit /b 1)

:ALLOC_PORT
set "ALLOC_NAME=%~1"
set "ALLOC_START=%~2"
set /a ALLOC_PORT_TMP=%ALLOC_START%
:ALLOC_PORT_LOOP
call :IS_PORT_IN_USE %ALLOC_PORT_TMP%
if %errorlevel% EQU 0 (
    set /a ALLOC_PORT_TMP+=1
    goto ALLOC_PORT_LOOP
)
set "%ALLOC_NAME%=%ALLOC_PORT_TMP%"
exit /b 0

:ENSURE_NODE_MODULES
set "APP_DIR=%~1"
if not exist "%APP_DIR%\\package.json" exit /b 0
if exist "%APP_DIR%\\node_modules" exit /b 0
echo ^> Dependencies not found for %APP_DIR%. Installing...
pushd "%APP_DIR%"
npm install
set "NPM_ERR=%errorlevel%"
popd
exit /b %NPM_ERR%
