@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ============================================
echo    GrowUp AI Course - site update
echo ============================================
echo.
git add -A
git diff --cached --stat
echo.
set /p MSG="Update name (e.g. Day 25): "
if "%MSG%"=="" set MSG=content update
git commit -m "%MSG%"
echo.
echo Pushing to GitHub...
git push
echo.
if %errorlevel%==0 (
  echo ============================================
  echo    DONE. Live in ~1 minute:
  echo    https://mdbiplobislam.github.io/growup-ai-course/
  echo ============================================
) else (
  echo !!! Something went wrong - show the text above to Claude
)
echo.
pause
