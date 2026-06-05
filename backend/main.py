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

from contextlib import asynccontextmanager
from fastapi import FastAPI
from api.analyze import router as analyze_router
from services.init_db import init_twitter_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inisialisasi basis data Twitter scraper di runtime menggunakan secrets env
    init_twitter_db()
    yield

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Lacak Buzzer API", lifespan=lifespan)

# Konfigurasi CORS agar hanya domain frontend resmi yang dapat memanggil API di Hugging Face Spaces
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://lacakbuzzer.web.id",
        "https://lacakbuzzer.pages.dev",  # Ganti dengan subdomain .pages.dev Anda jika berbeda
        "http://localhost:5173",          # Untuk testing lokal di browser
        "http://localhost:4173"           # Untuk testing preview lokal
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok", "message": "Lacak Buzzer API running"}

