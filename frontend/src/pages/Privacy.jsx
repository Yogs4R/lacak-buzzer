import LegalPageLayout from '../components/LegalPageLayout';
import { useSEO } from '../hooks/useSEO';

export default function Privacy() {
  useSEO({
    canonical: 'https://lacakbuzzer.web.id/privacy',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'PrivacyPolicy',
      name: 'Kebijakan Privasi Lacak Buzzer',
      url: 'https://lacakbuzzer.web.id/privacy',
      inLanguage: 'id',
      publisher: {
        '@type': 'Organization',
        name: 'Lacak Buzzer',
        url: 'https://lacakbuzzer.web.id',
      },
    },
  });
  return (
    <LegalPageLayout title="Kebijakan Privasi">
      <section className="mb-8">
        <h2 className="text-[20px] font-semibold text-ink mb-3">
          1. Pengantar
        </h2>
        <p>
          Lacak Buzzer berkomitmen untuk menghormati dan melindungi privasi Anda. Halaman ini menjelaskan bagaimana kami memproses data ketika Anda menggunakan layanan kami untuk melakukan analisis indikator risiko.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[20px] font-semibold text-ink mb-3">
          2. Pemrosesan Data Tanpa Penyimpanan (Stateless)
        </h2>
        <p>
          Layanan kami sepenuhnya bersifat <strong>stateless</strong>. Kami tidak mengumpulkan, menyimpan, atau merekam:
        </p>
        <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5">
          <li>Username Twitter/X yang Anda cari atau masukkan.</li>
          <li>Isi tweet, profil, media, atau metadata yang diambil untuk proses analisis.</li>
          <li>Hasil perhitungan skor dan analisis akhir.</li>
        </ul>
        <p className="mt-2">
          Setiap permintaan analisis diproses secara langsung di memori server dan langsung dikirimkan kembali kepada browser Anda. Begitu tab ditutup atau di-reset, data tersebut hilang sepenuhnya dari server kami.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[20px] font-semibold text-ink mb-3">
          3. Sumber Data Publik
        </h2>
        <p>
          Sistem kami hanya mengakses dan menganalisis data yang tersedia untuk publik pada platform X/Twitter. Kami tidak pernah mengakses data privat, akun yang dikunci, pesan langsung (DM), atau data non-publik lainnya.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[20px] font-semibold text-ink mb-3">
          4. Batas Penggunaan (Rate Limiting)
        </h2>
        <p>
          Kami menggunakan metadata teknis dasar seperti alamat IP untuk melacak jumlah pencarian harian guna mendeteksi penyalahgunaan dan menerapkan batas 5 pencarian per hari. Data ini disimpan dalam file lokal terenkripsi/terpisah dan tidak dikaitkan dengan profil pencarian Anda.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[20px] font-semibold text-ink mb-3">
          5. Perubahan Kebijakan
        </h2>
        <p>
          Kami dapat memperbarui kebijakan privasi ini sewaktu-waktu. Setiap perubahan akan dipublikasikan langsung di halaman ini dengan memperbarui tanggal revisi.
        </p>
      </section>
    </LegalPageLayout>
  );
}

