/**
 * Modul Kendaraan Terpadu - SATU-SERANG (V5.9 - PDF Report Integrated)
 * Update: Preview Foto Kendaraan Real-time, UI Modal Modern & Export PDF
 */

window.currentRole = 'admin'; 

const Kendaraan = {
    storageKey: 'data_kendaraan_serang_v5',
    historyKey: 'history_kendaraan_serang_v5',

    init: function() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = [
                { id: 1, nama: 'TOYOTA FORTUNER', plat: 'A 1 KK', jenis: 'Mobil', status: 'Tersedia', foto: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=400', peminjamSekarang: '', jamHingga: '' },
                { id: 2, nama: 'TOYOTA AVANZA', plat: 'A 1234 B', jenis: 'Mobil', status: 'Tersedia', foto: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400', peminjamSekarang: '', jamHingga: '' }
            ];
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }
        if (!localStorage.getItem(this.historyKey)) localStorage.setItem(this.historyKey, JSON.stringify([]));
    },

    getData() { return JSON.parse(localStorage.getItem(this.storageKey)) || []; },
    getHistory() { return JSON.parse(localStorage.getItem(this.historyKey)) || []; },

    handleImagePreview(url) {
        const imgTag = document.getElementById('u-preview-img');
        const defaultPlaceholder = 'https://placehold.co/400x250?text=Preview+Foto+Kendaraan';
        imgTag.src = url || defaultPlaceholder;
    },

    applyFilters() {
        const queryPencarian = document.getElementById('h-search')?.value.toLowerCase() || '';
        const tanggalMulai = document.getElementById('h-start-date')?.value || '';
        const tanggalSelesai = document.getElementById('h-end-date')?.value || '';
        const barisTabel = document.querySelectorAll('#history-table-body tr');

        barisTabel.forEach(baris => {
            const teksBaris = baris.innerText.toLowerCase();
            const tanggalBaris = baris.getAttribute('data-date');
            let cocokPencarian = teksBaris.includes(queryPencarian);
            let cocokTanggal = true;
            if (tanggalMulai && tanggalBaris < tanggalMulai) cocokTanggal = false;
            if (tanggalSelesai && tanggalBaris > tanggalSelesai) cocokTanggal = false;
            baris.style.display = (cocokPencarian && cocokTanggal) ? '' : 'none';
        });
    },

    unduhLaporan() {
        const barisTabel = document.querySelectorAll('#history-table-body tr');
        let csv = "Tanggal,Unit,Peminjam,Status,Keterangan\n";
        let adaData = false;
        barisTabel.forEach(baris => {
            if (baris.style.display !== 'none') {
                const kolom = baris.querySelectorAll('td');
                const dataBaris = Array.from(kolom).map(k => `"${k.innerText.trim()}"`).join(",");
                csv += dataBaris + "\n";
                adaData = true;
            }
        });
        if (!adaData) return alert("Tidak ada data yang sesuai filter untuk diunduh!");
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `LAPORAN_LOG_KENDARAAN_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    },

    // FUNGSI BARU: Export PDF
    unduhLaporanPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');
        const barisTabel = document.querySelectorAll('#history-table-body tr');
        const dataRows = [];

        barisTabel.forEach(baris => {
            if (baris.style.display !== 'none') {
                const kolom = baris.querySelectorAll('td');
                dataRows.push([
                    kolom[0].innerText,
                    kolom[1].innerText,
                    kolom[2].innerText,
                    kolom[3].innerText,
                    kolom[4].innerText
                ]);
            }
        });

        if (dataRows.length === 0) return alert("Tidak ada data untuk dicetak!");

        doc.setFontSize(16);
        doc.text("LAPORAN RIWAYAT PENGGUNAAN KENDARAAN", 14, 15);
        doc.setFontSize(10);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);

        doc.autoTable({
            startY: 28,
            head: [['WAKTU', 'UNIT', 'PERSONEL', 'AKSI', 'KETERANGAN']],
            body: dataRows,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 8 }
        });

        doc.save(`LAPORAN_KENDARAAN_${new Date().toISOString().slice(0,10)}.pdf`);
    },

    showModule(role = window.currentRole, tabAktif = 'unit') {
        this.init();
        window.currentRole = role;
        const isAdmin = role === 'admin';
        const data = this.getData();
        const container = document.getElementById('module-content');
        if (!container) return;

        container.innerHTML = `
        <div class="p-6 space-y-8 animate-in fade-in duration-500">
            <div class="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div class="relative z-10">
                    <h2 class="text-2xl font-black uppercase italic tracking-tighter">Manajemen Armada</h2>
                    <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Satu-Serang Logistik</p>
                </div>
                <div class="flex flex-wrap justify-center gap-4 relative z-10">
                    <div class="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
                        <button onclick="Kendaraan.showModule('${role}','unit')" class="px-6 py-2 rounded-xl text-[9px] font-black uppercase ${tabAktif === 'unit' ? 'bg-indigo-500 text-white' : 'text-slate-400'}">Inventaris</button>
                        ${isAdmin ? `<button onclick="Kendaraan.showModule('admin','history')" class="px-6 py-2 rounded-xl text-[9px] font-black uppercase ${tabAktif === 'history' ? 'bg-indigo-500 text-white' : 'text-slate-400'}">Riwayat Log</button>` : ''}
                    </div>
                    ${role === 'admin' && tabAktif === 'unit' ? `
                    <button onclick="Kendaraan.openModalUnit()" class="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg active:scale-95">
                    + Tambah Unit
                    </button>
                    ` : ''}                </div>
            </div>

            ${isAdmin && tabAktif === 'history' ? this.renderHistoryUI() : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${data.map(u => this.renderUnitCard(u)).join('')}
            </div>`}
        </div>
        ${this.renderModals()}
        `;
    },

    renderUnitCard(u) {
        const isAdmin = window.currentRole === 'admin';
        const isTersedia = u.status === 'Tersedia';
        const fotoDefault = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400';

        return `
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div class="h-48 overflow-hidden relative">
                <img src="${u.foto || fotoDefault}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onerror="this.src='https://placehold.co/400x250?text=No+Image'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div class="absolute bottom-4 left-6">
                    <span class="text-[10px] font-black text-white bg-indigo-600 px-3 py-1 rounded-lg uppercase tracking-widest">${u.plat}</span>
                </div>
                <div class="absolute top-4 right-4 flex gap-2">
                    ${isAdmin ? `<button onclick="Kendaraan.openModalUnit(${u.id})" class="bg-white/20 backdrop-blur-md text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all"><i class="fa-solid fa-pen text-[10px]"></i></button>` : ''}
                    <span class="px-3 py-1 rounded-full text-[8px] font-black uppercase ${isTersedia ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white shadow-lg shadow-rose-200'}">${u.status}</span>
                </div>
            </div>
            <div class="p-8">
                <h3 class="text-lg font-black text-slate-800 uppercase mb-4">${u.nama}</h3>
                <div class="mb-6 min-h-[40px]">
                    ${!isTersedia ? `
                        <div class="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                            <p class="text-[9px] text-rose-400 font-bold uppercase mb-1">Peminjam:</p>
                            <p class="text-[11px] font-black text-rose-700 uppercase">${u.peminjamSekarang}</p>
                            <p class="text-[10px] font-bold text-rose-500 mt-1 italic">Hingga Jam: ${u.jamHingga}</p>
                        </div>
                    ` : `<div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 border-dashed text-center"><p class="text-[9px] text-slate-400 font-bold uppercase italic tracking-widest">Siap Digunakan</p></div>`}
                </div>
                <div class="flex gap-2">
                    ${isTersedia 
                        ? `<button onclick="Kendaraan.openModalPinjam(${u.id},'${u.nama}')" class="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 shadow-lg transition-all">Pinjam Unit</button>`
                        : `<button onclick="Kendaraan.openModalKembali(${u.id},'${u.nama}')" class="flex-1 bg-white border-2 border-slate-100 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase hover:text-rose-600 hover:border-rose-100 transition-all">Kembalikan</button>`
                    }
                </div>
            </div>
        </div>`;
    },

    renderHistoryUI() {
        const h = this.getHistory();
        return `
        <div class="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
            <div class="p-8 border-b border-slate-50 bg-slate-50/50 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="md:col-span-2 relative">
                        <input type="text" id="h-search" onkeyup="Kendaraan.applyFilters()" placeholder="Cari nama, kendaraan, atau tujuan..." class="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-none text-[11px] font-bold shadow-sm focus:ring-2 focus:ring-indigo-500/20">
                        <i class="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    </div>
                    <div class="relative">
                        <label class="absolute -top-2 left-4 px-2 bg-white text-[8px] font-black text-slate-400 uppercase">Mulai</label>
                        <input type="date" id="h-start-date" onchange="Kendaraan.applyFilters()" class="w-full p-4 rounded-2xl bg-white border-none text-[11px] font-bold shadow-sm">
                    </div>
                    <div class="relative">
                        <label class="absolute -top-2 left-4 px-2 bg-white text-[8px] font-black text-slate-400 uppercase">Selesai</label>
                        <input type="date" id="h-end-date" onchange="Kendaraan.applyFilters()" class="w-full p-4 rounded-2xl bg-white border-none text-[11px] font-bold shadow-sm">
                    </div>
                </div>
                <div class="flex justify-between items-center pt-2">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Filter data berdasarkan periode tanggal</p>
                    <div class="flex gap-2">
                        <button onclick="Kendaraan.unduhLaporan()" class="bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 transition-all active:scale-95">
                            <i class="fa-solid fa-file-csv"></i> CSV
                        </button>
                        <button onclick="Kendaraan.unduhLaporanPDF()" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95">
                            <i class="fa-solid fa-file-pdf"></i> Unduh PDF
                        </button>
                    </div>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <tr><th class="p-6">Waktu</th><th class="p-6">Unit</th><th class="p-6">Personel</th><th class="p-6">Aksi</th><th class="p-6">Keterangan</th></tr>
                    </thead>
                    <tbody id="history-table-body" class="divide-y divide-slate-50">
                        ${h.map(x => `
                        <tr class="hover:bg-slate-50/80 transition-colors" data-date="${x.tanggalISO || ''}">
                            <td class="p-6 text-[10px] font-bold text-slate-400">${x.tanggal}</td>
                            <td class="p-6 text-[11px] font-black text-slate-800 uppercase">${x.kendaraan}</td>
                            <td class="p-6 text-[11px] font-black text-indigo-600 uppercase">${x.peminjam}</td>
                            <td class="p-6"><span class="px-2 py-1 rounded-lg ${x.tipe === 'PINJAM' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'} font-black text-[8px] uppercase">${x.tipe}</span></td>
                            <td class="p-6 text-[10px] font-bold text-slate-500 uppercase italic">${x.keterangan}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    },

    saveLog(entri) {
        const h = this.getHistory();
        entri.tanggalISO = entri.tanggalISO || new Date().toISOString().split('T')[0]; 
        h.unshift(entri);
        localStorage.setItem(this.historyKey, JSON.stringify(h.slice(0, 1000)));
    },

    prosesPinjam() {
        const id = document.getElementById('f-id').value;
        const n = document.getElementById('f-nama').value;
        const tgl = document.getElementById('f-tanggal').value;
        const selesai = document.getElementById('f-jam-selesai').value;
        const tujuan = document.getElementById('f-tujuan').value;
        
        if (!n || !selesai || !tgl) return alert('Nama, Tanggal, dan Jam Selesai wajib diisi!');
        
        let data = this.getData().map(u => {
            if (u.id == id) {
                u.status = 'Dipinjam';
                u.peminjamSekarang = n.toUpperCase();
                u.jamHingga = selesai;
            }
            return u;
        });

        localStorage.setItem(this.storageKey, JSON.stringify(data));
        
        this.saveLog({
            tipe: 'PINJAM',
            tanggal: `${tgl} | ${new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}`,
            tanggalISO: tgl,
            peminjam: n.toUpperCase(),
            kendaraan: document.getElementById('f-u-nama').value,
            keterangan: `S/D: ${selesai} | TUJUAN: ${tujuan.toUpperCase()}`
        });

        this.closeModal();
        this.showModule(window.currentRole, 'unit');
    },

    prosesKembali() {
        const id = document.getElementById('fk-id').value;
        const bbm = document.getElementById('fk-bbm').value;
        if (!bbm) return alert('Mohon isi status BBM terakhir!');
        let data = this.getData().map(u => {
            if (u.id == id) {
                u.status = 'Tersedia';
                u.peminjamSekarang = '';
                u.jamHingga = '';
            }
            return u;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.saveLog({
            tipe: 'KEMBALI',
            tanggal: new Date().toLocaleString('id-ID'),
            peminjam: 'SISTEM',
            kendaraan: document.getElementById('fk-u-nama').value,
            keterangan: `KONDISI BBM: ${bbm.toUpperCase()}`
        });
        this.closeModal();
        this.showModule(window.currentRole, 'unit');
    },

    renderModals() {
        const hariIni = new Date().toISOString().split('T')[0];
        return `
        <div id="modal-unit" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden z-[100] flex items-center justify-center p-4">
            <div class="bg-white p-8 rounded-[3rem] w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 id="modal-unit-title" class="text-xl font-black text-slate-800 uppercase italic mb-6">Konfigurasi Unit</h3>
                
                <div class="space-y-4">
                    <div class="w-full h-44 rounded-3xl overflow-hidden bg-slate-100 mb-4 border-2 border-dashed border-slate-200 flex items-center justify-center">
                        <img id="u-preview-img" src="" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/400x250?text=Preview+Image'">
                    </div>

                    <input type="hidden" id="u-id">
                    
                    <div>
                        <label class="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-2">URL Foto Kendaraan</label>
                        <input id="u-foto" oninput="Kendaraan.handleImagePreview(this.value)" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-[11px] font-bold" placeholder="Paste URL gambar di sini...">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-2">Nama Unit</label>
                            <input id="u-nama" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-[11px] font-bold uppercase" placeholder="Nama Kendaraan">
                        </div>
                        <div>
                            <label class="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-2">Plat Nomor</label>
                            <input id="u-plat" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-[11px] font-bold uppercase" placeholder="Plat Nomor">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <select id="u-jenis" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-[11px] font-bold uppercase outline-none"><option>Mobil</option><option>Motor</option></select>
                        <select id="u-status" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-[11px] font-bold uppercase outline-none"><option>Tersedia</option><option>Maintenance</option></select>
                    </div>

                    <div class="flex flex-col gap-2 pt-4">
                        <button onclick="Kendaraan.prosesSimpanUnit()" class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-indigo-700 transition-all active:scale-95">Simpan Aset</button>
                        <button onclick="Kendaraan.closeModal()" class="w-full text-slate-400 font-bold text-[9px] uppercase py-2 hover:text-slate-600 transition-colors">Batal</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="modal-pinjam" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden z-[100] flex items-center justify-center p-4">
            <div class="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
                <h3 class="text-xl font-black text-slate-800 uppercase italic mb-8">Formulir Peminjaman</h3>
                <input type="hidden" id="f-id"><input type="hidden" id="f-u-nama">
                <div class="space-y-4">
                    <input id="f-nama" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-[11px] font-bold uppercase" placeholder="Nama Lengkap Peminjam">
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="text-[8px] font-black text-slate-400 ml-2">TANGGAL GUNA</label><input type="date" id="f-tanggal" value="${hariIni}" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-[11px] font-bold"></div>
                        <div><label class="text-[8px] font-black text-slate-400 ml-2">ESTIMASI SELESAI</label><input type="time" id="f-jam-selesai" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-[11px] font-bold"></div>
                    </div>
                    <textarea id="f-tujuan" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-[11px] font-bold h-24 uppercase" placeholder="Tujuan Perjalanan / Dinas"></textarea>
                    <button onclick="Kendaraan.prosesPinjam()" class="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-indigo-600 transition-all">Konfirmasi Pinjam</button>
                    <button onclick="Kendaraan.closeModal()" class="w-full text-slate-400 font-bold text-[9px] uppercase py-2 hover:text-slate-600">Batal</button>
                </div>
            </div>
        </div>

        <div id="modal-kembali" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden z-[100] flex items-center justify-center p-4">
            <div class="bg-white p-10 rounded-[3rem] w-full max-w-sm shadow-2xl text-center">
                <h3 class="text-xl font-black text-slate-800 uppercase italic mb-8">Pengembalian Unit</h3>
                <input type="hidden" id="fk-id"><input type="hidden" id="fk-u-nama">
                <input id="fk-bbm" class="w-full bg-slate-50 border-none p-5 rounded-2xl text-center text-[11px] font-black uppercase mb-6" placeholder="Kondisi BBM (Contoh: 80%)">
                <button onclick="Kendaraan.prosesKembali()" class="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all">Submit & Selesai</button>
                <button onclick="Kendaraan.closeModal()" class="w-full text-slate-400 font-bold text-[9px] uppercase py-2 hover:text-slate-600">Batal</button>
            </div>
        </div>`;
    },

    openModalUnit(id = null) {
        this.closeModal();
        const modal = document.getElementById('modal-unit');
        const title = document.getElementById('modal-unit-title');
        const imgPreview = document.getElementById('u-preview-img');

        if (id) {
            const u = this.getData().find(x => x.id == id);
            title.innerText = "Edit Unit";
            document.getElementById('u-id').value = u.id;
            document.getElementById('u-nama').value = u.nama;
            document.getElementById('u-plat').value = u.plat;
            document.getElementById('u-foto').value = u.foto || '';
            document.getElementById('u-jenis').value = u.jenis;
            document.getElementById('u-status').value = u.status;
            this.handleImagePreview(u.foto); 
        } else {
            title.innerText = "Tambah Unit Baru";
            document.getElementById('u-id').value = '';
            document.getElementById('u-nama').value = '';
            document.getElementById('u-plat').value = '';
            document.getElementById('u-foto').value = '';
            imgPreview.src = 'https://placehold.co/400x250?text=Paste+URL+Foto';
        }
        modal.classList.remove('hidden');
    },

    prosesSimpanUnit() {
        const id = document.getElementById('u-id').value;
        const nama = document.getElementById('u-nama').value.toUpperCase();
        const plat = document.getElementById('u-plat').value.toUpperCase();
        const foto = document.getElementById('u-foto').value;
        const jenis = document.getElementById('u-jenis').value;
        const status = document.getElementById('u-status').value;
        
        if (!nama || !plat) return alert('Nama dan Plat wajib diisi!');
        
        let data = this.getData();
        const unitBaru = { 
            id: id ? parseInt(id) : Date.now(), 
            nama, plat, foto, jenis, status, 
            peminjamSekarang: '', 
            jamHingga: '' 
        };

        if (id) data = data.map(u => u.id == id ? unitBaru : u); 
        else data.push(unitBaru);

        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.closeModal();
        this.showModule(window.currentRole, 'unit');
    },

    closeModal() { document.querySelectorAll('[id^="modal-"]').forEach(m => m.classList.add('hidden')); },
    openModalPinjam(id, n) { 
        this.closeModal();
        document.getElementById('f-id').value = id; 
        document.getElementById('f-u-nama').value = n; 
        document.getElementById('modal-pinjam').classList.remove('hidden'); 
    },
    openModalKembali(id, n) { 
        this.closeModal();
        document.getElementById('fk-id').value = id; 
        document.getElementById('fk-u-nama').value = n; 
        document.getElementById('modal-kembali').classList.remove('hidden'); 
    }
};

window.Kendaraan = Kendaraan;
Kendaraan.showModule(window.currentRole, 'unit');