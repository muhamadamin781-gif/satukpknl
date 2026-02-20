/**
 * Modul Laporan Universal - SATU-SERANG
 * Fitur: Filter Periodik, Preview Tabel, Ekspor PDF/Excel & Fungsi Cetak
 */
const Laporan = {
    // Data Dummy (Simulasi data dari Database)
    dbPresensi: [
        { tgl: "2026-02-01", nip: "19920101...", nama: "Ahmad Dani", masuk: "07:25", pulang: "17:05", status: "HADIR", ket: "WFO" },
        { tgl: "2026-02-01", nip: "19950212...", nama: "Siti Aminah", masuk: "07:45", pulang: "17:15", status: "HADIR", ket: "WFO" },
        { tgl: "2026-02-02", nip: "19920101...", nama: "Ahmad Dani", masuk: "07:30", pulang: "17:00", status: "HADIR", ket: "WFO" },
        { tgl: "2026-02-03", nip: "19880520...", nama: "Budi Utomo", masuk: "--:--", pulang: "--:--", status: "CUTI", ket: "Cuti Tahunan" },
        { tgl: "2026-02-04", nip: "19950212...", nama: "Siti Aminah", masuk: "08:15", pulang: "17:30", status: "TERLAMBAT", ket: "WFO" },
        { tgl: "2026-02-05", nip: "19920101...", nama: "Ahmad Dani", masuk: "07:10", pulang: "17:10", status: "HADIR", ket: "WFO" }
    ],

    showModule: function() {
        const view = document.getElementById('main-view');
        if (!view) return;

        view.innerHTML = `
            <div class="max-w-6xl mx-auto animate-in fade-in duration-500">
                <header class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h2 class="text-3xl font-black italic text-[#0f172a] uppercase tracking-tighter">Pusat Laporan</h2>
                        <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">KPKNL Serang - Integritas Dalam Data</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="Laporan.exportExcel()" class="px-5 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 flex items-center gap-2">
                            <i class="fa-solid fa-file-excel"></i> Export Excel
                        </button>
                        <button onclick="Laporan.printReport()" class="px-5 py-3 bg-[#0f172a] text-white text-[10px] font-black uppercase rounded-2xl hover:bg-black transition shadow-lg flex items-center gap-2">
                            <i class="fa-solid fa-print"></i> Print / PDF
                        </button>
                    </div>
                </header>

                <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl mb-8">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div class="md:col-span-1">
                            <label class="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block">Cari Nama Pegawai</label>
                            <input type="text" id="filter-nama" placeholder="Ketik nama..." class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-500 transition">
                        </div>
                        <div class="md:col-span-2">
                            <label class="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block">Rentang Periode (Tanggal)</label>
                            <div class="flex items-center gap-3">
                                <input type="date" id="date-start" class="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none">
                                <span class="text-slate-300 font-bold">s/d</span>
                                <input type="date" id="date-end" class="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none">
                            </div>
                        </div>
                        <button onclick="Laporan.applyFilter()" class="bg-blue-600 text-white font-black uppercase text-[10px] py-4 rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                            <i class="fa-solid fa-filter mr-2"></i> Terapkan Filter
                        </button>
                    </div>
                </div>

                <div id="report-container" class="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                    <div class="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                        <div>
                            <h4 class="font-black uppercase text-sm tracking-tighter text-slate-800">Preview Laporan Presensi</h4>
                            <p id="label-periode" class="text-[9px] font-bold text-slate-400 uppercase mt-1">Data Seluruh Waktu</p>
                        </div>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Logo_Kementerian_Keuangan_Republik_Indonesia.png/600px-Logo_Kementerian_Keuangan_Republik_Indonesia.png" class="h-10 opacity-20 grayscale" alt="Logo Kemenkeu">
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                                    <th class="p-6">Tanggal</th>
                                    <th class="p-6">Nama Pegawai</th>
                                    <th class="p-6">Jam Masuk</th>
                                    <th class="p-6">Jam Pulang</th>
                                    <th class="p-6">Status</th>
                                    <th class="p-6">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody id="table-body" class="text-[11px] font-bold text-slate-600">
                                </tbody>
                        </table>
                    </div>
                    
                    <div id="empty-state" class="hidden p-20 text-center">
                        <i class="fa-solid fa-folder-open text-slate-200 text-5xl mb-4"></i>
                        <p class="text-slate-400 font-bold italic">Data tidak ditemukan untuk periode ini.</p>
                    </div>
                </div>
            </div>
        `;
        this.renderTable(this.dbPresensi);
    },

    renderTable: function(data) {
        const tbody = document.getElementById('table-body');
        const emptyState = document.getElementById('empty-state');
        
        if (data.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        tbody.innerHTML = data.map(row => `
            <tr class="border-b border-slate-50 hover:bg-blue-50/30 transition-all duration-200">
                <td class="p-6 text-slate-400 font-medium">${this.formatDate(row.tgl)}</td>
                <td class="p-6">
                    <div class="text-slate-800 uppercase tracking-tight">${row.nama}</div>
                    <div class="text-[8px] text-slate-300 font-black tracking-widest">${row.nip || ''}</div>
                </td>
                <td class="p-6 text-emerald-600 font-black">${row.masuk}</td>
                <td class="p-6 text-blue-600 font-black">${row.pulang}</td>
                <td class="p-6">
                    <span class="px-3 py-1 rounded-full text-[8px] font-black ${this.getStatusStyle(row.status)}">
                        ${row.status}
                    </span>
                </td>
                <td class="p-6 text-slate-400 italic font-medium">${row.ket}</td>
            </tr>
        `).join('');
    },

    getStatusStyle: function(status) {
        const styles = {
            'HADIR': 'bg-emerald-100 text-emerald-600',
            'TERLAMBAT': 'bg-orange-100 text-orange-600',
            'CUTI': 'bg-blue-100 text-blue-600',
            'ALPA': 'bg-red-100 text-red-600'
        };
        return styles[status] || 'bg-slate-100 text-slate-400';
    },

    applyFilter: function() {
        const nama = document.getElementById('filter-nama').value.toLowerCase();
        const start = document.getElementById('date-start').value;
        const end = document.getElementById('date-end').value;

        const filtered = this.dbPresensi.filter(item => {
            const matchNama = item.nama.toLowerCase().includes(nama);
            const matchDate = (!start || item.tgl >= start) && (!end || item.tgl <= end);
            return matchNama && matchDate;
        });

        document.getElementById('label-periode').innerText = start ? `Periode: ${this.formatDate(start)} - ${this.formatDate(end || '...')}` : "Data Seluruh Waktu";
        this.renderTable(filtered);
    },

    formatDate: function(dateStr) {
        if (!dateStr) return '';
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    },

    // FITUR: CETAK / PDF
    printReport: function() {
        const printContent = document.getElementById('report-container').innerHTML;
        const win = window.open('', '', 'height=700,width=900');
        win.document.write(`
            <html>
                <head>
                    <title>Laporan Presensi KPKNL Serang</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @media print { body { padding: 0; } .shadow-2xl { border: 1px solid #eee; box-shadow: none; } }
                        body { font-family: sans-serif; }
                    </style>
                </head>
                <body class="p-10">
                    <div class="flex items-center justify-between border-b-4 border-double border-slate-800 pb-4 mb-8">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Logo_Kementerian_Keuangan_Republik_Indonesia.png/600px-Logo_Kementerian_Keuangan_Republik_Indonesia.png" class="h-16">
                        <div class="text-right">
                            <h1 class="text-xl font-black uppercase">Kementerian Keuangan RI</h1>
                            <h2 class="text-lg font-bold uppercase">DJPKN - KPKNL SERANG</h2>
                            <p class="text-[10px] font-bold text-slate-500">Jl. Raya Serang No. 1, Kota Serang - Banten</p>
                        </div>
                    </div>
                    ${printContent}
                    <div class="mt-12 flex justify-end">
                        <div class="text-center border-t border-slate-200 pt-4 w-64">
                            <p class="text-[10px] font-bold text-slate-400 uppercase">Dicetak Pada: ${new Date().toLocaleString('id-ID')}</p>
                            <div class="h-20"></div>
                            <p class="font-black text-xs uppercase underline">Kepala Subbagian Umum</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        win.document.close();
        setTimeout(() => { win.print(); }, 500);
    },

    // FITUR: EKSPOR EXCEL (CSV Format)
    exportExcel: function() {
        let csv = 'Tanggal,NIP,Nama Pegawai,Jam Masuk,Jam Pulang,Status,Keterangan\n';
        this.dbPresensi.forEach(row => {
            csv += `${row.tgl},${row.nip},${row.nama},${row.masuk},${row.pulang},${row.status},${row.ket}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `Laporan_Presensi_KPKNL_Serang_${new Date().getTime()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};