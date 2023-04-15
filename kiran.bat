@echo off

set "cmd1=start C:\path\to\ganache-2.5.4-windows-x86_64\Ganache.exe"
set "cmd2=npx truffle migrate --reset"
set "cmd3=npm run dev"
set "error="

echo Starting Ganache...
%cmd1% || set "error=Error starting Ganache"

echo Waiting for 50 seconds...
timeout /t 50 /nobreak >nul

echo Running Truffle Migration...
%cmd2% || set "error=Error running Truffle Migration"

echo Waiting for 20 seconds...
timeout /t 20 /nobreak >nul

echo Starting Dev Server...
%cmd3% || set "error=Error starting Dev Server"

if defined error (
  echo %error%
  pause
) else (
  echo Done.
  pause
)

exit /b