import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const htmlContent = `
<p><strong>Syarat dan Ketentuan CPNS Karier</strong></p><p>Selamat datang di <strong>CPNS Karier</strong>. Dengan mengakses, mendaftar, atau menggunakan layanan kami, Anda dianggap telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan di bawah ini. Jika Anda tidak menyetujui bagianmana pun dari ketentuan ini, Anda disarankan untuk tidak melanjutkan penggunaan website ini.</p><p><strong>1. Definisi dan Layanan</strong></p><p>1.1. <strong>CPNS Karier</strong> adalah platform mesin pencari informasi instansi dan formasi pendaftaran CPNS yang didasarkan pada kualifikasi pendidikan pengguna. <br /><br />1.2. CPNS Karier berfungsi sebagai <strong>agregator/media informasi</strong> dan bukan merupakan bagian dari instansi pemerintah manapun. <br /><br />1.3. Seluruh proses pendaftaran resmi, pengumuman hasil, dan keputusan akhir tetap berada sepenuhnya di bawah otoritas portal resmi <strong>SSCASN BKN (Badan Kepegawaian Negara)</strong>.</p><p><strong>2. Sumber dan Validitas Data</strong></p><p>2.1. Informasi formasi yang disajikan di CPNS Karier dikumpulkan dan divalidasi secara manual berdasarkan dokumen edaran resmi PDF Formasi CPNS 2024 dari berbagai instansi. <br /><br />2.2. Meskipun kami melakukan upaya terbaik untuk memastikan validitas data, CPNS Karier tidak bertanggung jawab atas segala perubahan mendadak yang dilakukan oleh instansi terkait atau kesalahan input yang berasal dari dokumen sumber asli. Pengguna disarankan untuk tetap melakukan verifikasi ulang pada dokumen resmi yang dilampirkan oleh instansi terkait.</p><p><strong>3. Pendaftaran dan Keamanan Akun</strong></p><p>3.1. Pengguna wajib membuat akun dan melakukan login untuk dapat mengakses fitur pencarian formasi secara penuh. <br /><br />3.2. Pengguna bertanggung jawab menjaga kerahasiaan informasi akun dan kata sandi masing-masing. <br /><br />3.3. <strong>Larangan Penggunaan Akun:</strong></p><ul><li>Dilarang keras memperjualbelikan atau memindahtangankan akses akun kepada pihak lain.</li><li>Dilarang menggunakan website atau akun CPNS Karier sebagai media promosi layanan atau produk lain yang tidak berkaitan dengan CPNS Karier, termasuk namun tidak terbatas pada aktivitas promosi di platform media sosial seperti Live TikTok untuk kepentingan komersial maupun non-komersial. </li></ul><p>3.4. CPNS Karier berhak melakukan pemblokiran atau penghapusan akun secara permanen tanpa pemberitahuan jika ditemukan indikasi pelanggaran terhadap poin-poin di atas.</p><p><strong>4. Hak Kekayaan Intelektual</strong></p><p>4.1. Seluruh sistem, kode, basis data, dan algoritma pencarian yang ada pada website CPNS Karier adalah hak milik intelektual kami. <br />4.2. <strong>Larangan Keras:</strong> Dilarang melakukan pengambilan data secara otomatis (<em>scraping/crawling</em>), menggandakan, atau menduplikasi algoritma pencarian CPNS Karier untuk kepentingan apapun tanpa izin tertulis dari manajemen CPNS Karier. </p><p>Kami akan mengambil langkah hukum yang tegas terhadap segala bentuk pelanggaran hak kekayaan intelektual.</p><p><strong>5. Kebijakan Transaksi dan Pengembalian Dana (<em>Refund</em>)</strong></p><p>5.1. CPNS Karier menyediakan produk digital seperti e-book panduan seleksi dan fitur premium lainnya. </p><p>5.2. Detail produk dan deskripsi layanan telah disampaikan secara jelas pada halaman informasi produk sebelum pembelian. Pembeli dianggap telah memahami ketentuan produk sebelum melakukan transaksi. </p><p>5.3. <strong>Ketentuan Refund:</strong> Pengembalian dana hanya dapat dilakukan jika:</p><ul><li>Fitur atau layanan yang dibeli tidak berfungsi secara total (100%) karena kendala sistem pada pihak kami.</li><li>Terdapat kendala teknis yang mengakibatkan akses produk terhambat secara permanen setelah upaya perbaikan dilakukan. 5.4. Refund tidak dapat diajukan atas dasar kelalaian pengguna dalam membaca deskripsi produk atau berubah pikiran setelah transaksi berhasil.</li></ul><p><strong>6. Batasan Tanggung Jawab</strong></p><p>CPNS Karier tidak bertanggung jawab atas kegagalan administrasi atau ketidaklolosan pelamar dalam seleksi CPNS. Layanan kami bersifat membantu pemetaan peluang berdasarkan data yang tersedia, namun keberhasilan seleksi sepenuhnya bergantung pada pemenuhan syarat resmi dan performa peserta pada setiap tahapan ujian.</p><p><strong>7. Perubahan Ketentuan</strong></p><p>CPNS Karier berhak untuk mengubah atau memperbarui Syarat dan Ketentuan ini sewaktu-waktu tanpa pemberitahuan terlebih dahulu. Pengguna diharapkan untuk memeriksa halaman ini secara berkala.</p>
`;

export default function TermsPage({ onBack }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      <header style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}>
          <ArrowLeft size={18} />
          Kembali
        </button>
      </header>
      
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ background: 'white', padding: '40px 48px', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', lineHeight: 1.8 }}>
          <div className="doc-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </main>

      <style>{`
        .doc-content p { margin-bottom: 1em; color: #334155; font-size: 15px; }
        .doc-content strong { color: #0f172a; font-weight: 800; }
        .doc-content ul { margin-left: 20px; margin-bottom: 1em; }
        .doc-content li { margin-bottom: 0.5em; color: #334155; font-size: 15px; }
      `}</style>
    </div>
  );
}
