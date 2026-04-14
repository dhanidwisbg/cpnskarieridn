import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const htmlContent = `
<p><strong>Kebijakan Privasi CPNS Karier Indonesia</strong></p><p>Di <strong>CPNS Karier Indonesia</strong>, kami sangat menghargai privasi dan keamanan data pengguna kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, melindungi, dan mengelola informasi pribadi Anda ketika Anda mengakses website dan menggunakan layanan kami.</p><p>Dengan mendaftar dan menggunakan layanan CPNS Karier Indonesia, Anda menyetujui praktik pengumpulan dan penggunaan data yang dijelaskan dalam kebijakan ini.</p><p><strong>1. Informasi yang Kami Kumpulkan</strong></p><p>Untuk memberikan pengalaman layanan pencarian formasi dan produk digital yang optimal, kami mengumpulkan beberapa jenis informasi berikut:</p><ul><li><strong>Informasi Akun:</strong> Saat Anda mendaftar, kami mengumpulkan data dasar seperti nama lengkap, alamat email, dan kata sandi yang dienkripsi.</li><li><strong>Data Kualifikasi Pendidikan:</strong> Untuk menjalankan fungsi mesin pencari formasi, sistem kami akan merekam input kualifikasi pendidikan yang Anda masukkan (misalnya jenjang D3, D4, S1, S2, S3, atau status profesional/sedang bekerja) agar dapat mencocokkannya dengan database instansi.</li><li><strong>Data Transaksi:</strong> Jika Anda melakukan pembelian produk digital kami, kami akan mengumpulkan riwayat transaksi. <em>Catatan: Kami tidak menyimpan detail kartu kredit atau kredensial perbankan Anda secara langsung, karena pembayaran diproses melalui pihak ketiga (Payment Gateway) yang aman.</em></li><li><strong>Data Teknis dan Aktivitas:</strong> Kami mengumpulkan informasi log standar seperti alamat IP, jenis browser, waktu akses, serta riwayat pencarian formasi Anda di dalam website untuk keperluan analisis dan peningkatan performa sistem.</li></ul><p><strong>2. Penggunaan Informasi</strong></p><p>Data yang kami kumpulkan hanya digunakan untuk tujuan operasional dan peningkatan layanan, meliputi:</p><ul><li>Mengelola akun Anda dan memberikan akses penuh ke fitur pencarian agregator formasi CPNS.</li><li>Memproses pesanan, memvalidasi pembayaran, dan mengirimkan akses produk digital yang Anda beli.</li><li>Mengirimkan email pemberitahuan terkait pembaruan sistem, konfirmasi transaksi, atau informasi penting lainnya seputar layanan CPNS Karier.</li><li>Menganalisis pola penggunaan website untuk memperbaiki algoritma pencarian dan antarmuka pengguna.</li></ul><p><strong>3. Perlindungan dan Keamanan Data</strong></p><p>Kami menerapkan langkah-langkah keamanan teknis yang wajar untuk melindungi informasi pribadi Anda dari akses, pengubahan, pengungkapan, atau penghancuran yang tidak sah. Data kata sandi Anda disimpan dalam format yang dienkripsi. Namun, kami juga mengimbau Anda untuk tidak membagikan informasi login akun Anda kepada pihak manapun.</p><p><strong>4. Pembagian Data dengan Pihak Ketiga</strong></p><p>CPNS Karier Indonesia <strong>tidak akan pernah menjual, menyewakan, atau menukar</strong> informasi pribadi Anda kepada pihak ketiga untuk kepentingan pemasaran mereka. Kami hanya membagikan data Anda kepada:</p><ul><li><strong>Penyedia Layanan (Payment Gateway):</strong> Secara eksklusif untuk memproses transaksi keuangan secara aman saat Anda membeli produk premium kami.</li><li><strong>Kewajiban Hukum:</strong> Jika diwajibkan oleh hukum yang berlaku di Indonesia atau jika ada permintaan resmi dari otoritas penegak hukum untuk melindungi hak dan keamanan operasional CPNS Karier.</li></ul><p><strong>5. Penggunaan Cookies</strong></p><p>Website kami menggunakan <em>cookies</em> untuk mengenali sesi login Anda, mengingat preferensi pencarian Anda, dan mempercepat waktu muat halaman. Anda dapat mengatur browser Anda untuk menolak <em>cookies</em>, namun hal ini mungkin membatasi beberapa fungsi website kami.</p><p><strong>6. Hak Pengguna</strong></p><p>Anda memiliki hak untuk:</p><ul><li>Mengakses dan memperbarui informasi pribadi di halaman profil akun Anda.</li><li>Meminta penghapusan akun Anda beserta data yang terkait secara permanen dari sistem kami dengan menghubungi tim dukungan pelanggan kami.</li></ul><p><strong>7. Perubahan Kebijakan Privasi</strong></p><p>Kami berhak untuk memperbarui Kebijakan Privasi ini sewaktu-waktu. Setiap perubahan akan diterbitkan di halaman ini dengan memperbarui tanggal revisi di bagian bawah dokumen. Penggunaan yang berkelanjutan atas layanan kami setelah perubahan tersebut merupakan bentuk persetujuan Anda terhadap kebijakan yang baru.</p><p><strong>Kontak Kami</strong> Jika Anda memiliki pertanyaan lebih lanjut mengenai Kebijakan Privasi ini, kendala akun, atau perlindungan data, silakan hubungi kami melalui email: [Masukkan Alamat Email Support Anda].</p>
`;

export default function PrivacyPage({ onBack }) {
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
