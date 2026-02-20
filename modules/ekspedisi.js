/**
 * Modul Manajemen Buku Ekspedisi (ExpeditionManager)
 * Mengelola logika bisnis untuk input surat, deteksi massal, dan penyiapan dokumen.
 */

const ExpeditionManager = (() => {
    // Kunci penyimpanan lokal
    const STORAGE_KEY = 'serang_ekspedisi_data';

    /**
     * Mengambil seluruh data dari local storage
     * @returns {Array} Daftar surat (diurutkan berdasarkan yang terbaru)
     */
    const getAllData = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Gagal mengambil data dari Storage:", error);
            return [];
        }
    };

    /**
     * Menyimpan data ke local storage
     * @param {Array} data 
     */
    const saveData = (data) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error("Gagal menyimpan data:", error);
            return false;
        }
    };

    /**
     * Menambahkan surat baru dengan deteksi pengiriman massal otomatis
     * @param {Object} entryData - Data dari form
     */
    const addEntry = (entryData) => {
        if (!entryData.penerima || !entryData.noSurat) {
            throw new Error("Nomor Surat dan Penerima wajib diisi.");
        }

        const allData = getAllData();
        const normalizedPenerima = entryData.penerima.toLowerCase().trim();

        // Logika Deteksi Massal:
        // Cek apakah penerima ini sudah ada di database sebelumnya
        const isAlreadyExist = allData.some(item => 
            item.penerima.toLowerCase().trim() === normalizedPenerima
        );

        const newEntry = {
            id: Date.now(),
            noSurat: entryData.noSurat,
            tglSurat: entryData.tglSurat || new Date().toISOString().split('T')[0],
            pengirim: entryData.pengirim || "Umum",
            penerima: entryData.penerima.trim(),
            alamat: entryData.alamat || "-",
            isMassal: isAlreadyExist, // Jika sudah ada, entry baru otomatis Massal
            createdAt: new Date().toISOString()
        };

        // Update status 'isMassal' untuk semua entri lama dengan penerima yang sama
        let updatedData = allData;
        if (isAlreadyExist) {
            updatedData = allData.map(item => {
                if (item.penerima.toLowerCase().trim() === normalizedPenerima) {
                    return { ...item, isMassal: true };
                }
                return item;
            });
        }

        updatedData.unshift(newEntry);
        saveData(updatedData);

        return newEntry;
    };

    /**
     * Mencari data berdasarkan keyword (No Surat atau Penerima)
     * @param {string} query 
     */
    const searchData = (query) => {
        const q = query.toLowerCase();
        return getAllData().filter(item => 
            item.noSurat.toLowerCase().includes(q) || 
            item.penerima.toLowerCase().includes(q)
        );
    };

    /**
     * Simulasi Proses OCR Kamera (AI-Powered Extraction)
     */
    const simulateOCR = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    noSurat: `S-${Math.floor(Math.random() * 1000)}/KPKNL.1202/2026`,
                    tglSurat: new Date().toISOString().split('T')[0],
                    pengirim: "Seksi Umum",
                    penerima: "PT. JASA RAHARJA",
                    alamat: "Jl. Sudirman No. 10, Serang, Banten"
                });
            }, 1200);
        });
    };

    /**
     * Template Tanda Terima (A4 Optimization)
     */
    const generateReceiptTemplate = (selectedItems) => {
        if (selectedItems.length === 0) return "<p>Tidak ada data untuk dicetak.</p>";

        const rows = selectedItems.map(item => `
            <tr style="border-bottom: 2px solid #000;">
                <td style="width: 55%; padding: 15px; border-right: 1px solid #000; vertical-align: top;">
                    <div style="font-size: 9px; color: #555; margin-bottom: 4px;">TUJUAN/PENERIMA:</div>
                    <div style="font-size: 14px; font-weight: 800; text-transform: uppercase;">${item.penerima}</div>
                    <div style="font-size: 11px; margin-top: 4px; line-height: 1.2;">${item.alamat}</div>
                </td>
                <td style="width: 45%; padding: 15px; vertical-align: top;">
                    <div style="font-size: 9px; color: #555; margin-bottom: 4px;">PENGIRIM (KPKNL SERANG):</div>
                    <div style="font-size: 11px; font-weight: bold;">${item.pengirim}</div>
                    <div style="font-size: 10px;">No: ${item.noSurat}</div>
                    <div style="margin-top: 25px; border-top: 1px dashed #000; padding-top: 5px;">
                        <span style="font-size: 9px;">Tgl Terima: ____/____/2026 &nbsp;&nbsp; Paraf:</span>
                    </div>
                </td>
            </tr>
        `).join('');

        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 800px; margin: auto; border: 2px solid #000;">
                <div style="text-align: center; padding: 15px; background: #f0f0f0; border-bottom: 3px double #000;">
                    <h2 style="margin: 0; font-size: 18px;">LEMBAR KONTROL EKSPEDISI</h2>
                    <small>KPKNL SERANG - SISTEM SATU SERANG</small>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    ${rows}
                </table>
            </div>
        `;
    };

    return {
        addEntry,
        getAllData,
        searchData,
        deleteEntry: (id) => {
            const filtered = getAllData().filter(item => item.id !== id);
            saveData(filtered);
        },
        simulateOCR,
        generateReceiptTemplate
    };
})();