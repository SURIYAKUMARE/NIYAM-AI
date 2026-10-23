@echo off
echo =========================================================================
echo Launching AICTE Verify Platform (Backend + Frontend)
echo =========================================================================

start "AICTE Backend [FastAPI :8000]" cmd /k "run_backend.bat"
timeout /t 3 /nobreak > nul
start "AICTE Frontend [Next.js :3000]" cmd /k "run_frontend.bat"

echo.
echo AICTE Verify services have been launched in separate terminal windows.
echo - Frontend: http://localhost:3000
echo - Backend API & Swagger: http://127.0.0.1:8000/docs
echo.
pause
