@echo off
echo =========================================================================
echo Starting AICTE Verify FastAPI Compliance & Verification Backend Service
echo Port: http://127.0.0.1:8000
echo Swagger Documentation: http://127.0.0.1:8000/docs
echo =========================================================================

python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
