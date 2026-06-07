import asyncio
from twscrape import API

async def test_accounts():
    api = API()
    print("🔍 Mengambil daftar akun dari database...")
    accounts = await api.pool.accounts()
    
    if not accounts:
        print("❌ Tidak ada akun yang terdaftar di database accounts.db!")
        return
        
    for acc in accounts:
        print(f"\n--- Menguji Akun: @{acc.username} ---")
        print(f"Status Active: {acc.active}")
        print(f"Error Message Terakhir: {acc.error_msg}")
        
        # Validasi cookies format
        cookies = acc.cookies
        auth_token = cookies.get("auth_token")
        ct0 = cookies.get("ct0")
        
        if not auth_token or not ct0:
            print("❌ Cookies auth_token atau ct0 kosong!")
            continue
            
        print("尝试 mengambil data profile dummy ('detikcom') untuk tes login...")
        try:
            user = await api.user_by_login("detikcom")
            if user:
                print("✅ Sukses! Koneksi scraper berfungsi dengan baik.")
                break
            else:
                print("❌ Gagal: Twitter mengembalikan data kosong.")
        except Exception as e:
            print(f"❌ Error saat scraping: {e}")
            print("Tips: Periksa apakah akun ditangguhkan (suspend) atau perlu verifikasi manual di browser.")

if __name__ == "__main__":
    asyncio.run(test_accounts())
