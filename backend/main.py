"""
Entry point aplikasi FastAPI yang menginisialisasi router dan menjalankan server.
"""
# pyrefly: ignore [missing-import]
from fastapi import FastAPI

app = FastAPI(title="Lacak Buzzer API")

@app.get("/")
def root():
    return {"status": "ok", "message": "Lacak Buzzer API running"}
