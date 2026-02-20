// assets/js/modules/pdf.js

const PDFEngine = {
    downloadPDF: function(id) {
        // Ambil data dari server/local (Contoh jika menggunakan data lokal sementara)
        const allData = JSON.parse(localStorage.getItem('data_cuti_serang')) || [];
        const data = allData.find(c => c.id === id || c.idCuti === id);

        if (!data) return alert("Data tidak ditemukan!");
        if (!data.tte) return alert("Dokumen belum ditandatangani (TTE)!");

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // --- LOGIKA RENDER PDF (Sesuai gambar kodingan Anda) ---
        doc.setFont("helvetica", "bold");
        doc.text("KEMENTERIAN KEUANGAN REPUBLIK INDONESIA", 105, 20, { align: "center" });
        // ... lanjutkan sisa kodingan render Anda di sini ...

        // Bagian Akhir: Eksekusi Download
        doc.save(`Surat_Cuti_${data.nama}.pdf`);
    }
};

// Pastikan terdaftar di window global
window.PDFEngine = PDFEngine;