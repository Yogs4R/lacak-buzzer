"""
Entry point aplikasi FastAPI yang menginisialisasi router dan menjalankan server.
"""
from fastapi import FastAPI
from api.analyze import router as analyze_router

app = FastAPI(title="Lacak Buzzer API")

app.include_router(analyze_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok", "message": "Lacak Buzzer API running"}
