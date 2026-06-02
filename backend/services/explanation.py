"""
Logika untuk menghasilkan penjelasan teks dengan OpenRouter.
"""
import os
import httpx
from typing import List, Dict


def get_fallback_explanation(score: int, risk_band: str, signals: List[str]) -> str:
    """Mengembalikan penjelasan template Bahasa Indonesia secara deterministik."""
    sig_text = ", ".join(signals) if signals else "tidak ada sinyal dominan"
    return (
        f"Hasil menunjukkan risiko {risk_band} dengan skor {score}/100. "
        f"Sinyal utama yang terlihat adalah {sig_text}. "
        "Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu."
    )


async def generate_explanation(
    score: int,
    risk_band: str,
    confidence: str,
    tweet_count: int,
    metrics: Dict[str, int],
    signals: List[str]
) -> str:
    """Mengenerate penjelasan bahasa Indonesia dari metrics."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash-lite")

    if not api_key:
        return get_fallback_explanation(score, risk_band, signals)

    # Hanya kirimkan metrik ringkasan, bukan tweet mentah atau bio profil.
    prompt = (
        "Analisis akun Twitter/X menghasilkan metrik sebagai berikut:\n"
        f"- Skor Risiko Amplifikasi Terkoordinasi: {score}/100\n"
        f"- Kategori Risiko: {risk_band}\n"
        f"- Kepercayaan: {confidence} (berdasarkan {tweet_count} tweet)\n"
        f"- Sinyal Utama: {', '.join(signals)}\n"
        "- Metrik Rinci:\n"
    )
    for k, v in metrics.items():
        prompt += f"  * {k}: {v}/100\n"

    prompt += (
        "\nBerikan analisis ringkas dalam Bahasa Indonesia. Format penjelasan Anda agar terbagi menjadi 2 paragraf pendek yang terpisah secara jelas tanpa menggunakan format markdown (jangan gunakan cetak tebal dengan **, jangan gunakan daftar poin/bullet points). "
        "Jelaskan arti dari metrik tersebut secara netral, objektif, dan profesional. "
        "PENTING: Jangan membuat tuduhan bahwa akun tersebut adalah bot, buzzer, palsu, berbayar, atau terkoordinasi secara jahat. "
        "Pernyataan harus berupa indikator risiko berbasis pola perilaku saja.\n\n"
        "Wajib sertakan kalimat caveat berikut di bagian paling akhir penjelasan Anda:\n"
        "Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu."
    )

    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"].strip()
                # Pastikan caveat selalu ada di akhir respons
                caveat = "Skor ini adalah indikator risiko berbasis pola perilaku, bukan bukti bahwa akun tersebut terkoordinasi, palsu, dibayar, atau memiliki niat tertentu."
                if caveat not in content:
                    content += " " + caveat
                return content
            else:
                return get_fallback_explanation(score, risk_band, signals)
    except Exception:
        return get_fallback_explanation(score, risk_band, signals)
