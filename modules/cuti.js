/**
 * Modul Cuti V6.9 - SATU-SERANG
 * Update: Variasi Jenis Cuti, Logika Cuti Sakit, & Reset Kuota Admin
 */
const CutiModule = {
    storageKey: 'data_cuti_serang',
    saldoKey: 'saldo_cuti_pegawai',
    holidayKey: 'data_libur_serang',
    
    defaultHolidays: ['2026-01-01', '2026-08-17', '2026-12-25'],

    init: function() {
        if (!localStorage.getItem(this.holidayKey)) {
            localStorage.setItem(this.holidayKey, JSON.stringify(this.defaultHolidays));
        }
        // Inisialisasi Saldo Default ke 12 jika belum ada (Sesuai permintaan)
        if (!localStorage.getItem(this.saldoKey)) {
            localStorage.setItem(this.saldoKey, JSON.stringify({ tahunan: 12 }));
        }
    },

    // Fitur Reset Khusus Administrator
    resetSaldoKe12: function() {
        if (confirm("ADMIN: Reset saldo cuti pegawai menjadi 12 hari?")) {
            localStorage.setItem(this.saldoKey, JSON.stringify({ tahunan: 12 }));
            this.updateDisplaySaldo();
            alert("Saldo berhasil direset ke 12 hari.");
        }
    },

    getHolidays: function() {
        return JSON.parse(localStorage.getItem(this.holidayKey)) || this.defaultHolidays;
    },

    calculateWorkDays: function(startDate, endDate) {
        let count = 0;
        let curDate = new Date(startDate);
        const lastDate = new Date(endDate);
        const holidayList = this.getHolidays();

        while (curDate <= lastDate) {
            const dayOfWeek = curDate.getDay();
            const dateString = curDate.toISOString().split('T')[0];
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            const isHoliday = holidayList.includes(dateString);

            if (!isWeekend && !isHoliday) count++;
            curDate.setDate(curDate.getDate() + 1);
        }
        return count;
    },

    showModule: function() {
        this.init();
        const container = document.getElementById('module-content');
        if (!container) return;

        container.innerHTML = `
            <div class="p-8 animate-in fade-in duration-500">
                <div class="flex justify-between items-end mb-8">
                    <div>
                        <h2 class="text-3xl font-black italic text-slate-800 uppercase tracking-tighter">Manajemen Cuti</h2>
                        <div class="flex gap-4 mt-2">
                            <button onclick="CutiModule.switchTab('riwayat')" id="tab-riwayat" class="text-[10px] font-black uppercase tracking-widest border-b-2 border-indigo-600 text-indigo-600 pb-1">Riwayat Pengajuan</button>
                            <button onclick="CutiModule.switchTab('pengaturan')" id="tab-pengaturan" class="text-[10px] font-black uppercase tracking-widest text-slate-400 pb-1">Pengaturan Libur</button>
                        </div>
                    </div>
                    <div class="flex gap-4 items-center">
                        <div class="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 text-right group relative cursor-help">
                            <p class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Sisa Cuti Tahunan</p>
                            <p id="display-saldo" class="text-xl font-black text-indigo-600">-- Hari</p>
                            <button onclick="CutiModule.resetSaldoKe12()" class="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 bg-white shadow rounded-full w-5 h-5 text-[8px] text-slate-300 hover:text-rose-500 transition-all">R</button>
                        </div>
                        <button onclick="CutiModule.openForm()" class="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
                            <i class="fa-solid fa-plus mr-2"></i> Ajukan Cuti
                        </button>
                    </div>
                </div>

                <div id="section-riwayat" class="grid gap-6"></div>

                <div id="section-pengaturan" class="hidden animate-in fade-in">
                    <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h4 class="font-black text-slate-800 uppercase text-sm mb-4">Tambah Keputusan Libur Baru</h4>
                        <div class="flex gap-4 mb-8">
                            <input type="date" id="new-holiday-date" class="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                            <button onclick="CutiModule.addHoliday()" class="bg-indigo-600 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all">Simpan Libur</button>
                        </div>
                        <h4 class="font-black text-slate-800 uppercase text-[10px] mb-4 text-slate-400 tracking-widest">Daftar Libur Nasional / Cuti Bersama</h4>
                        <div id="holiday-list-tags" class="flex flex-wrap gap-2"></div>
                    </div>
                </div>
            </div>

            <div id="modal-cuti" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div class="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 relative animate-in zoom-in duration-300">
                     <button onclick="CutiModule.closeForm()" class="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors"><i class="fa-solid fa-circle-xmark text-2xl"></i></button>
                     <h3 class="text-2xl font-black italic uppercase text-slate-800 mb-6">Form Pengajuan</h3>
                     <form onsubmit="CutiModule.handleSave(event)" class="space-y-4">
                        <select id="cuti-jenis" required class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-r-8 border-transparent">
                            <option value="TAHUNAN">CUTI TAHUNAN</option>
                            <option value="SAKIT">CUTI SAKIT</option>
                            <option value="ALASAN PENTING">CUTI ALASAN PENTING</option>
                            <option value="BESAR">CUTI BESAR</option>
                            <option value="MELAHIRKAN">CUTI MELAHIRKAN</option>
                            <option value="DI LUAR TANGGUNGAN">CUTI DI LUAR TANGGUNGAN NEGARA</option>
                        </select>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-[9px] font-black text-slate-400 ml-2 uppercase">Mulai</label>
                                <input type="date" id="cuti-mulai" required class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none">
                            </div>
                            <div>
                                <label class="text-[9px] font-black text-slate-400 ml-2 uppercase">Selesai</label>
                                <input type="date" id="cuti-selesai" required class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none">
                            </div>
                        </div>
                        <input type="text" id="cuti-lokasi" placeholder="Lokasi Selama Cuti (Contoh: Serang, Banten)" required class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none">
                        <textarea id="cuti-alasan" placeholder="Alasan Cuti secara detail..." required class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none min-h-[100px]"></textarea>
                        <button type="submit" class="w-full bg-indigo-600 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-lg">Kirim Permohonan</button>
                     </form>
                </div>
            </div>
        `;
        this.renderList();
        this.renderHolidays();
        this.updateDisplaySaldo();
    },

    // Logika Pengurangan Saldo (Hanya jika Tahunan dan Disetujui)
    potongSaldo: function(durasi, jenis) {
        if (jenis !== 'TAHUNAN') return; // Poin 2: Sakit dll tidak potong saldo
        
        let saldo = JSON.parse(localStorage.getItem(this.saldoKey)) || { tahunan: 12 };
        saldo.tahunan = Math.max(0, saldo.tahunan - durasi);
        localStorage.setItem(this.saldoKey, JSON.stringify(saldo));
        this.updateDisplaySaldo();
    },

    handleSave: function(e) {
        e.preventDefault();
        const mulai = document.getElementById('cuti-mulai').value;
        const selesai = document.getElementById('cuti-selesai').value;
        const jenis = document.getElementById('cuti-jenis').value;
        const durasi = this.calculateWorkDays(mulai, selesai);

        if (durasi <= 0) {
            alert("Durasi 0 hari. Periksa kembali tanggal pilihan Anda.");
            return;
        }

        // Cek Saldo jika Cuti Tahunan
        if (jenis === 'TAHUNAN') {
            const saldo = JSON.parse(localStorage.getItem(this.saldoKey))?.tahunan || 0;
            if (durasi > saldo) {
                alert(`Saldo tidak mencukupi! Sisa saldo: ${saldo} hari.`);
                return;
            }
        }

        const data = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        data.unshift({
            id: 'CUTI-' + Date.now(),
            pemohon: 'User Admin',
            jabatan: 'Pramubakti',
            jenis: jenis,
            tanggalMulai: mulai,
            tanggalSelesai: selesai,
            durasi: durasi,
            lokasi: document.getElementById('cuti-lokasi').value,
            alasan: document.getElementById('cuti-alasan').value,
            status: 'DIAJUKAN',
            tanggalInput: new Date().toLocaleDateString('id-ID')
        });

        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.closeForm();
        this.renderList();
        alert(`Berhasil! Permohonan ${jenis} diajukan.`);
    },

    updateDisplaySaldo: function() {
        const saldo = JSON.parse(localStorage.getItem(this.saldoKey)) || { tahunan: 12 };
        const el = document.getElementById('display-saldo');
        if (el) el.innerText = `${saldo.tahunan} Hari`;
    },

    // Tab & Render Functions (Sama seperti sebelumnya)
    switchTab: function(tab) {
        const isRiwayat = tab === 'riwayat';
        document.getElementById('section-riwayat').classList.toggle('hidden', !isRiwayat);
        document.getElementById('section-pengaturan').classList.toggle('hidden', isRiwayat);
        const tRiwayat = document.getElementById('tab-riwayat');
        const tPengaturan = document.getElementById('tab-pengaturan');
        tRiwayat.className = isRiwayat ? "text-[10px] font-black uppercase tracking-widest border-b-2 border-indigo-600 text-indigo-600 pb-1" : "text-[10px] font-black uppercase tracking-widest text-slate-400 pb-1";
        tPengaturan.className = !isRiwayat ? "text-[10px] font-black uppercase tracking-widest border-b-2 border-indigo-600 text-indigo-600 pb-1" : "text-[10px] font-black uppercase tracking-widest text-slate-400 pb-1";
    },

    renderList: function() {
        const list = document.getElementById('section-riwayat');
        if (!list) return;
        const data = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        if (data.length === 0) {
            list.innerHTML = `<div class="p-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest border-4 border-dashed border-slate-100 rounded-[3rem]">Belum ada riwayat</div>`;
            return;
        }
        list.innerHTML = data.map(item => {
            const isApproved = item.status.includes('DISETUJUI');
            const statusColor = isApproved ? 'bg-emerald-100 text-emerald-600' : (item.status === 'DITOLAK' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600');
            return `
                <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center">
                    <div class="flex items-center gap-6">
                        <div class="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                            <i class="fa-solid fa-calendar-day text-xl"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <p class="font-black text-slate-800 uppercase text-sm">${item.jenis}</p>
                                <span class="text-[8px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">${item.durasi} HARI KERJA</span>
                            </div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase italic">${item.tanggalMulai} s/d ${item.tanggalSelesai}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${statusColor}">${item.status}</span>
                        ${isApproved ? `
                            <button onclick='window.Approval.generatePDF(${JSON.stringify(item)}, "Cuti")' class="bg-slate-900 text-white p-3 rounded-xl hover:bg-emerald-600 transition-all shadow-md">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>`;
        }).join('');
    },

    openForm: function() { document.getElementById('modal-cuti').classList.remove('hidden'); },
    closeForm: function() { document.getElementById('modal-cuti').classList.add('hidden'); },
    renderHolidays: function() { /* ... kode sama ... */ },
    addHoliday: function() { /* ... kode sama ... */ },
    removeHoliday: function(date) { /* ... kode sama ... */ }
};

window.CutiModule = CutiModule;