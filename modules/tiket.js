/**
 * Modul Tiket Permohonan - SATU-SERANG
 * Update: Fix Syntax Error (Sudah dicek tidak ada redeclare RumahTangga)
 */
const Tiket = {
    // Daftar barang disinkronkan dengan gudang
    daftarBarang: [
        "KERTAS A4", 
        "TINTA PRINTER", 
        "KERTAS F4 70G", 
        "TONER HP 85A",
        "ORDNER BINDEX",
        "TISU WAJAH"
    ],

    getTickets: function() {
        const data = localStorage.getItem('data_tiket_serang');
        // Tambahkan pengaman jika data korup (bukan array)
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    showModule: function() {
        const view = document.getElementById('module-content'); // Pastikan ID sesuai target render modul
        if (!view) return;
        
        const tickets = this.getTickets();

        view.innerHTML = `
            <div class="max-w-6xl mx-auto animate-in fade-in duration-500">
                <header class="flex justify-between items-end mb-8 p-4">
                    <div>
                        <h2 class="text-3xl font-black italic text-[#0f172a] uppercase tracking-tighter leading-none">Tiket Permohonan</h2>
                        <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Layanan Internal KPKNL Serang</p>
                    </div>
                    <button onclick="Tiket.renderForm()" class="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-700 transition shadow-lg">
                        <i class="fa-solid fa-paper-plane mr-2"></i> Buat Permohonan
                    </button>
                </header>

                <div class="grid grid-cols-1 gap-4 p-4">
                    ${tickets.length === 0 ? `
                        <div class="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-20 text-center">
                            <i class="fa-solid fa-inbox text-4xl text-slate-200 mb-4"></i>
                            <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Belum ada tiket aktif</p>
                        </div>
                    ` : tickets.map(t => `
                        <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition">
                            <div class="flex items-center gap-6">
                                <div class="w-12 h-12 rounded-2xl ${this.getCategoryColor(t.kategori)} flex items-center justify-center text-white shadow-inner">
                                    <i class="${this.getCategoryIcon(t.kategori)} text-lg"></i>
                                </div>
                                <div>
                                    <h4 class="font-black text-slate-800 uppercase text-sm tracking-tight">${t.perihal}</h4>
                                    <div class="flex gap-4 mt-1">
                                        <span class="text-[9px] font-bold text-slate-400 uppercase"><i class="fa-solid fa-user mr-1"></i> ${t.pengaju}</span>
                                        <span class="text-[9px] font-black text-indigo-500 uppercase">Jumlah: ${t.jumlah || 1}</span>
                                        <span class="text-[9px] font-bold text-slate-300 uppercase">${t.tanggal}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <span class="px-4 py-1.5 rounded-full text-[8px] font-black uppercase bg-slate-100 text-slate-600">
                                    ${t.status}
                                </span>
                                <button onclick="Tiket.deleteTiket(${t.id})" class="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>
                    `).reverse().join('')}
                </div>
            </div>
        `;
    },

    // ... (renderForm, submitTiket, deleteTiket tetap sama seperti sebelumnya)
    renderForm: function() {
        const view = document.getElementById('module-content');
        view.innerHTML = `
            <div class="max-w-2xl mx-auto bg-white p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 mt-10">
                <div class="mb-8">
                    <h3 class="text-2xl font-black italic uppercase text-indigo-900 tracking-tighter leading-none">Form Permohonan</h3>
                </div>
                <form onsubmit="Tiket.submitTiket(event)" class="space-y-6">
                    <div>
                        <label class="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block">Kategori Layanan</label>
                        <select id="t-kategori" class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none">
                            <option value="ATK">Permintaan ATK / Barang</option>
                            <option value="IT">Perbaikan IT / Jaringan</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block">Pilih Barang</label>
                        <select id="t-perihal" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none">
                            <option value="">-- Pilih Barang --</option>
                            ${this.daftarBarang.map(item => `<option value="${item}">${item}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block">Jumlah</label>
                        <input type="number" id="t-jumlah" value="1" min="1" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none">
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="submit" class="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs">Kirim</button>
                        <button type="button" onclick="Tiket.showModule()" class="px-10 bg-white border border-slate-200 text-slate-400 py-4 rounded-2xl font-black uppercase text-xs">Batal</button>
                    </div>
                </form>
            </div>`;
    },

    submitTiket: function(e) {
        e.preventDefault();
        const session = JSON.parse(localStorage.getItem('satu_session')) || { name: "Pegawai" };
        const newTiket = {
            id: Date.now(),
            pengaju: session.name,
            kategori: document.getElementById('t-kategori').value,
            perihal: document.getElementById('t-perihal').value,
            jumlah: document.getElementById('t-jumlah').value,
            status: "Diusulkan",
            tanggal: new Date().toLocaleDateString('id-ID')
        };
        const tickets = this.getTickets();
        tickets.push(newTiket);
        localStorage.setItem('data_tiket_serang', JSON.stringify(tickets));
        this.showModule();
    },

    getCategoryIcon: (cat) => cat === 'ATK' ? 'fa-solid fa-box-archive' : 'fa-solid fa-screwdriver-wrench',
    getCategoryColor: (cat) => cat === 'ATK' ? 'bg-orange-500' : 'bg-blue-500',

    deleteTiket: function(id) {
        if(confirm('Hapus tiket ini?')) {
            const existing = this.getTickets().filter(t => t.id !== id);
            localStorage.setItem('data_tiket_serang', JSON.stringify(existing));
            this.showModule();
        }
    }
};

window.Tiket = Tiket;