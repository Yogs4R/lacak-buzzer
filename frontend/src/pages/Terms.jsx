export default function Terms() {
  return (
    <div className="animate-fade-in-up py-24 px-4 max-w-[800px] mx-auto w-full font-main text-bodyText leading-relaxed">
      <p className="eyebrow text-center">LEGAL</p>
      <h1 className="text-[40px] font-bold text-ink mt-4 text-center mb-10 leading-tight">
        Syarat & Ketentuan
      </h1>

      <section className="mb-8">
        <h2 className="text-[20px] font-semibold text-ink mb-3">
          1. Penerimaan Ketentuan
        </h2>
        <p>
          Dengan mengakses atau menggunakan platform Lacak Buzzer, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui bagian mana pun dari ketentuan ini, Anda tidak diperkenankan menggunakan layanan kami.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[20px] font-semibold text-ink mb-3">
          2. Sifat Layanan (Disclaimer Penting)
        </h2>
        <p>
          Lacak Buzzer menyediakan indikator risiko berbasis analisis kecerdasan buatan terhadap perilaku publik di platform X/Twitter.
        </p>
        <div className="text-sm leading-relaxed text-[#ffd8bf] bg-[#1a1109] border-l-4 border-l-[#f97316] rounded-sm p-4 mt-4">
          <strong>PENTING:</strong> Skor yang disajikan sepenuhnya merupakan indikator risiko berbasis perilaku statistika. Skor ini BUKAN bukti konklusif bahwa suatu akun merupakan buzzer, akun palsu, akun berbayar, atau bertindak dengan niat manipulatif tertentu. Layanan ini ditujukan untuk kebutuhan riset, edukasi, dan jurnalisme.
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-[20px] font-semibold text-ink mb-3">
          3. Penggunaan yang Diperbolehkan
        </h2>
        <p>
          Anda diperbolehkan menggunakan layanan ini secara wajar. Anda dilarang keras untuk:
        </p>
        <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5">
          <li>Melakukan pemindaian otomatis berskala besar (scraping) terhadap API kami tanpa izin tertulis.</li>
          <li>Menggunakan hasil analisis untuk melakukan intimidasi, doxxing, pelecehan, atau kampanye kebencian terhadap pemilik akun tertentu.</li>
          <li>Menggunakan bot X kami untuk melakukan spamming berlebihan yang melanggar ketentuan penggunaan platform X.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-[20px] font-semibold text-ink mb-3">
          4. Batas Tanggung Jawab
        </h2>
        <p>
          Lacak Buzzer, pengembang, dan kontributornya tidak bertanggung jawab atas kerugian atau dampak sosial, hukum, finansial, atau reputasi yang timbul akibat kesalahan penafsiran hasil analisis oleh pengguna atau pihak ketiga. Pengguna bertanggung jawab penuh atas cara mereka membagikan dan menafsirkan data dari platform ini.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-[20px] font-semibold text-ink mb-3">
          5. Perubahan Layanan
        </h2>
        <p>
          Kami berhak untuk mengubah, menangguhkan, atau menghentikan aspek apa pun dari layanan kami sewaktu-waktu tanpa pemberitahuan sebelumnya, termasuk membatasi akses demi menjaga stabilitas infrastruktur server.
        </p>
      </section>

      <hr className="border-borderCustom my-10" />

      <p className="text-[12px] text-mutedText text-center">
        Terakhir diperbarui: Juni 2026
      </p>
    </div>
  );
}
