"""
Entry point aplikasi FastAPI yang menginisialisasi router dan menjalankan server.
"""
import os

# Manual load of .env file from the root directory before any service imports
def load_dotenv():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dotenv_path = os.path.join(base_dir, ".env")
    if os.path.exists(dotenv_path):
        with open(dotenv_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    val = val.strip().strip("'\"")
                    os.environ[key.strip()] = val

load_dotenv()

from fastapi import FastAPI
from api.analyze import router as analyze_router

app = FastAPI(title="Lacak Buzzer API")

app.include_router(analyze_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok", "message": "Lacak Buzzer API running"}
