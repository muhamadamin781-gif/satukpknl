(function() {
    // Mencegah inisialisasi ganda jika script dimuat ulang
    if (window.KepegawaianHandle) return;

    const HR_MODULE = {
        currentMode: 'list', 
        activePegawaiId: null,
        activeTab: 'jabatan',
        tempFoto: '', 
        editMode: false,
        editId: null,
        searchTerm: '',

        // Master Data Opsi Penugasan Khusus (KSU)
        opsiPenugasan: [
            "PENGELOLA KEPEGAWAIAN", 
            "ADMIN PRESENSI / PUSAKA", 
            "IT SUPPORT / ADMIN JARINGAN", 
            "BENDAHARA PENGELUARAN", 
            "BENDAHARA PENERIMAAN",
            "PENGELOLA BMN",
            "PETUGAS APT (LAYANAN)",
            "KEHUMASAN & MEDSOS",
            "ARSIPARIS / TATA USAHA",
            "PENGURUS BARANG PERSEDIAAN",
            "PETUGAS KEAMANAN SISTEM IT"
        ],

        // --- FUNGSI DATABASE (API MONGODB) ---
        async getData() { 
            try {
                const response = await fetch('http://localhost:3000/api/pegawai');
                const result = await response.json();
                return result.data || [];
            } catch (e) {
                console.error("Gagal mengambil data dari server:", e);
                return [];
            }
        },

        async saveDataToDb(payload, isEdit = false) {
            const url = isEdit ? `http://localhost:3000/api/pegawai/${this.editId}` : 'http://localhost:3000/api/pegawai';
            try {
                const response = await fetch(url, {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                return await response.json();
            } catch (e) {
                alert("Koneksi ke CMD/Server terputus!");
            }
        },

        // --- HANDLING UI & FOTO ---
        handleFotoUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.tempFoto = e.target.result;
                    const preview = document.getElementById('preview-foto-baru');
                    const icon = document.getElementById('icon-foto-placeholder');
                    if (preview) {
                        preview.src = e.target.result;
                        preview.classList.remove('hidden');
                        if(icon) icon.classList.add('hidden');
                    }
                };
                reader.readAsDataURL(file);
            }
        },

        async showModule() {
            const container = document.getElementById('module-content');
            if (!container) return;
            
            if (this.currentMode === 'list') {
                await this.renderListView(container);
            } else {
                await this.renderRiwayatView(container);
            }
        },

        async exportToCSV() {
            const data = await this.getData();
            let csv = 'NIP,Nama,Unit,Role,Penugasan\n';
            data.forEach(p => {
                const cleanPenugasan = p.penugasan ? p.penugasan.replace(/,/g, ';') : '-';
                csv += `${p.nip},${p.nama},${p.unit},${p.role},${cleanPenugasan}\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SDM_KPKNL_Serang_${Date.now()}.csv`;
            a.click();
        },

        // --- TAMPILAN UTAMA (DAFTAR PEGAWAI) ---
        async renderListView(container) {
            container.innerHTML = `
                <div class="p-8 bg-slate-50 min-h-screen">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h2 class="text-3xl font-black text-slate-800 tracking-tight uppercase italic">SDM KPKNL SERANG</h2>
                            <p class="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1">DATABASE MONGODB AKTIF</p>
                        </div>
                        <div class="flex flex-wrap gap-3">
                            <div class="relative">
                                <input type="text" id="hr-search" placeholder="Cari Nama/NIP..." 
                                    oninput="Kepegawaian.handleSearch(this.value)"
                                    class="bg-white border-2 border-slate-200 px-5 py-4 rounded-2xl text-[11px] font-bold uppercase outline-none focus:border-indigo-500 w-64 shadow-sm">
                                <i class="fas fa-search absolute right-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                            </div>
                            <button onclick="Kepegawaian.exportToCSV()" class="bg-white border-2 px-6 py-4 rounded-2xl font-black text-[11px] uppercase shadow-sm hover:bg-slate-50">EXPORT</button>
                            <button onclick="Kepegawaian.switchMode('riwayat')" class="bg-white border-2 px-6 py-4 rounded-2xl font-black text-[11px] uppercase shadow-sm">RIWAYAT</button>
                            <button onclick="Kepegawaian.openForm()" class="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase shadow-2xl transition-all">+ PEGAWAI</button>
                        </div>
                    </div>

                    <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="bg-slate-50/50">
                                    <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas</th>
                                    <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Penugasan</th>
                                    <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">NIP / Role</th>
                                    <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="table-pegawai-body" class="divide-y divide-slate-50"></tbody>
                        </table>
                    </div>
                </div>
                ${this.getModalHTML()}
                ${this.getPenugasanPopUpHTML()}
            `;
            await this.renderTableData();
        },

        handleSearch(val) {
            this.searchTerm = val.toLowerCase();
            this.renderTableData();
        },

        async renderTableData() {
            const body = document.getElementById('table-pegawai-body');
            if (!body) return;
            let data = await this.getData();
            
            if (this.searchTerm) {
                data = data.filter(p => 
                    p.nama.toLowerCase().includes(this.searchTerm) || 
                    p.nip.toLowerCase().includes(this.searchTerm)
                );
            }

            body.innerHTML = data.map(p => `
                <tr class="hover:bg-slate-50/80 transition-all">
                    <td class="p-6 flex items-center gap-4">
                        <div class="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border flex items-center justify-center">
                             ${p.foto ? `<img src="${p.foto}" class="w-full h-full object-cover">` : `<i class="fas fa-user text-slate-300"></i>`}
                        </div>
                        <div>
                             <div class="font-black text-slate-800 uppercase text-xs">${p.nama}</div>
                             <div class="text-[9px] font-bold text-slate-400 uppercase">${p.unit}</div>
                        </div>
                    </td>
                    <td class="p-6">
                        <div class="flex flex-wrap gap-1">
                            ${p.penugasan ? p.penugasan.split(',').map(tag => `<span class="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase italic">${tag.trim()}</span>`).join('') : '<span class="text-slate-300 text-[8px] uppercase">Staf Umum</span>'}
                        </div>
                    </td>
                    <td class="p-6 text-center">
                        <div class="font-mono font-bold text-slate-600 text-xs">${p.nip}</div>
                        <span class="text-[8px] font-black text-indigo-500 uppercase">${p.role}</span>
                    </td>
                    <td class="p-6 text-right">
                        <div class="flex justify-end gap-2">
                            <button onclick="Kepegawaian.openPenugasanPopUp('${p._id || p.id}')" class="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"><i class="fas fa-tasks text-[10px]"></i></button>
                            <button onclick="Kepegawaian.editPegawai('${p._id || p.id}')" class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all"><i class="fas fa-edit text-[10px]"></i></button>
                            <button onclick="Kepegawaian.deletePegawai('${p._id || p.id}')" class="w-8 h-8 rounded-lg bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white transition-all"><i class="fas fa-trash text-[10px]"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        },

        // --- MANAJEMEN RIWAYAT PEGAWAI ---
        async renderRiwayatView(container) {
            const listPegawai = await this.getData();
            container.innerHTML = `
                <div class="p-8 bg-slate-50 min-h-screen">
                    <button onclick="Kepegawaian.switchMode('list')" class="mb-8 text-indigo-600 font-black text-[10px] uppercase flex items-center gap-2">
                        <i class="fas fa-arrow-left"></i> Kembali ke Daftar
                    </button>
                    
                    <div class="bg-white p-6 rounded-[2.5rem] shadow-sm mb-8 border border-slate-100">
                        <select id="sel-riwayat" onchange="Kepegawaian.loadRiwayatDetail(this.value)" class="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none">
                            <option value="">-- Pilih Pegawai untuk Melihat Riwayat Lengkap --</option>
                            ${listPegawai.map(p => `<option value="${p._id || p.id}" ${this.activePegawaiId === (p._id || p.id) ? 'selected' : ''}>${p.nama} (${p.nip})</option>`).join('')}
                        </select>
                    </div>

                    <div id="riwayat-detail-area" class="${this.activePegawaiId ? '' : 'hidden'}">
                        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <div id="profil-identitas-card"></div>
                            <div class="lg:col-span-3 bg-white rounded-[3rem] shadow-sm border overflow-hidden">
                                <div class="flex overflow-x-auto bg-slate-50/50 p-2 gap-2" id="tab-headers">
                                    ${['Jabatan', 'Pendidikan', 'Diklat', 'Mutasi', 'Penghargaan', 'Disiplin'].map(tab => `
                                        <button onclick="Kepegawaian.switchTab('${tab.toLowerCase()}')" data-tab="${tab.toLowerCase()}" class="btn-tab-hr px-6 py-3 rounded-2xl font-black text-[9px] uppercase transition-all whitespace-nowrap">
                                            ${tab}
                                        </button>
                                    `).join('')}
                                </div>
                                <div id="tab-content-area" class="p-8 min-h-[400px]"></div>
                            </div>
                        </div>
                    </div>
                </div>
                ${this.getRiwayatModalHTML()}
            `;
            if (this.activePegawaiId) this.loadRiwayatDetail(this.activePegawaiId);
        },

        async loadRiwayatDetail(id) {
            this.activePegawaiId = id;
            if(!id) return;
            const data = await this.getData();
            const p = data.find(x => (x._id === id || x.id === id));
            
            document.getElementById('riwayat-detail-area').classList.remove('hidden');
            document.getElementById('profil-identitas-card').innerHTML = `
                <div class="bg-white p-8 rounded-[3rem] shadow-sm border text-center">
                    <div class="w-24 h-24 mx-auto mb-4 rounded-[2rem] border-4 border-white shadow-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                        ${p.foto ? `<img src="${p.foto}" class="w-full h-full object-cover">` : `<i class="fas fa-user-circle text-4xl text-slate-200"></i>`}
                    </div>
                    <h3 class="font-black text-slate-800 uppercase text-xs">${p.nama}</h3>
                    <p class="text-[9px] font-bold text-indigo-500 uppercase">${p.nip}</p>
                    <div class="mt-6 pt-6 border-t space-y-3 text-left">
                        ${this.infoRow('Role', p.role)}
                        ${this.infoRow('Unit', p.unit)}
                    </div>
                </div>
            `;
            this.switchTab(this.activeTab);
        },

        infoRow(l, v) { 
            return `<div><label class="text-[8px] font-black text-slate-400 uppercase block mb-1">${l}</label><p class="text-[10px] font-bold text-slate-700 uppercase">${v || '-'}</p></div>`; 
        },

        async switchTab(tabId) {
            this.activeTab = tabId;
            document.querySelectorAll('.btn-tab-hr').forEach(btn => {
                btn.className = `btn-tab-hr px-6 py-3 rounded-2xl font-black text-[9px] uppercase transition-all whitespace-nowrap ${btn.dataset.tab === tabId ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'}`;
            });

            const allData = await this.getData();
            const p = allData.find(x => (x._id === this.activePegawaiId || x.id === this.activePegawaiId));
            const dataRiwayat = (p.riwayat && p.riwayat[tabId]) || [];
            const contentArea = document.getElementById('tab-content-area');

            contentArea.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <h4 class="font-black text-slate-400 uppercase text-[9px]">Daftar ${tabId}</h4>
                    <button onclick="Kepegawaian.openRiwayatForm('${tabId}')" class="bg-slate-900 text-white px-5 py-2 rounded-xl font-black text-[9px] uppercase shadow-lg">+ Tambah</button>
                </div>
                <div class="space-y-3">
                    ${dataRiwayat.length === 0 ? '<div class="py-10 text-center text-slate-300 italic text-[10px]">Data Kosong</div>' : 
                    dataRiwayat.map((item, idx) => `
                        <div class="flex justify-between items-center p-5 bg-slate-50 border rounded-2xl">
                            <div>
                                <div class="font-black text-slate-800 uppercase text-[11px]">${item.col1}</div>
                                <div class="text-[9px] font-bold text-slate-400 uppercase">${item.col2} | <span class="text-indigo-600">${item.col3}</span></div>
                            </div>
                            <button onclick="Kepegawaian.deleteRiwayat(${idx})" class="text-rose-300 hover:text-rose-500"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    `).join('')}
                </div>`;
        },

        // --- CRUD LOGIC ---
        async handleSave(e) {
            e.preventDefault();
            const payload = {
                nama: document.getElementById('hr_nama').value.toUpperCase(),
                nip: document.getElementById('hr_nip').value,
                role: document.getElementById('hr_role').value,
                unit: document.getElementById('hr_unit').value,
                foto: this.tempFoto,
                password: '123'
            };

            if (!this.editMode) {
                payload.riwayat = { jabatan: [], pendidikan: [], diklat: [], mutasi: [], penghargaan: [], disiplin: [] };
                payload.penugasan = '';
            }

            await this.saveDataToDb(payload, this.editMode);
            this.closeModal();
            await this.showModule();
        },

        async editPegawai(id) {
            const data = await this.getData();
            const p = data.find(x => (x._id === id || x.id === id));
            if(!p) return;
            
            this.editMode = true;
            this.editId = id;
            this.tempFoto = p.foto || '';
            
            this.openForm();
            document.getElementById('modal-title').innerText = "Edit Profil Pegawai";
            document.getElementById('hr_nama').value = p.nama;
            document.getElementById('hr_nip').value = p.nip;
            document.getElementById('hr_role').value = p.role;
            document.getElementById('hr_unit').value = p.unit;
            
            if(p.foto) {
                const preview = document.getElementById('preview-foto-baru');
                preview.src = p.foto;
                preview.classList.remove('hidden');
                document.getElementById('icon-foto-placeholder').classList.add('hidden');
            }
        },

        async deletePegawai(id) {
            if(confirm('Hapus pegawai ini dari Database?')) {
                await fetch(`http://localhost:3000/api/pegawai/${id}`, { method: 'DELETE' });
                await this.showModule();
            }
        },

        // --- FUNGSI PENUGASAN KHUSUS (FITUR TAMBAHAN) ---
        async openPenugasanPopUp(id) {
            this.editId = id;
            const data = await this.getData();
            const p = data.find(x => (x._id === id || x.id === id));
            
            const modal = document.getElementById('modal-penugasan-multi');
            const container = document.getElementById('checklist-container');
            document.getElementById('target-pegawai-name').innerText = p.nama;
            
            const currentTags = p.penugasan ? p.penugasan.split(',').map(t => t.trim()) : [];
            
            container.innerHTML = this.opsiPenugasan.map(opsi => `
                <label class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input type="checkbox" value="${opsi}" ${currentTags.includes(opsi) ? 'checked' : ''} class="w-4 h-4 rounded border-slate-300">
                    <span class="text-[10px] font-bold text-slate-700 uppercase">${opsi}</span>
                </label>
            `).join('');
            
            modal.classList.remove('hidden');
        },

        async savePenugasanMulti() {
            const checks = document.querySelectorAll('#checklist-container input:checked');
            const selected = Array.from(checks).map(c => c.value).join(', ');
            
            const data = await this.getData();
            const pIdx = data.findIndex(x => (x._id === this.editId || x.id === this.editId));
            
            data[pIdx].penugasan = selected;
            await this.saveDataToDb(data[pIdx], true);
            
            this.closePenugasanPopUp();
            this.showModule();
        },

        // --- TEMPLATES HTML (MODALS) ---
        getModalHTML() {
            return `
                <div id="modal-hr" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                    <div class="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10">
                        <h3 id="modal-title" class="text-xl font-black uppercase italic mb-6">Profil Pegawai</h3>
                        <form onsubmit="Kepegawaian.handleSave(event)" class="space-y-4">
                            <div class="flex justify-center mb-4">
                                <div onclick="document.getElementById('hr_foto_input').click()" class="w-24 h-24 bg-slate-50 rounded-[2rem] border-4 border-white shadow-lg overflow-hidden flex items-center justify-center cursor-pointer">
                                    <img id="preview-foto-baru" src="" class="hidden w-full h-full object-cover">
                                    <i id="icon-foto-placeholder" class="fas fa-camera text-slate-300 text-xl"></i>
                                </div>
                                <input type="file" id="hr_foto_input" class="hidden" accept="image/*" onchange="Kepegawaian.handleFotoUpload(event)">
                            </div>
                            <input type="text" id="hr_nama" placeholder="NAMA LENGKAP" class="w-full p-4 bg-slate-50 rounded-2xl font-bold uppercase" required>
                            <input type="text" id="hr_nip" placeholder="NIP" class="w-full p-4 bg-slate-50 rounded-2xl font-bold" required>
                            <div class="grid grid-cols-2 gap-4">
                                <select id="hr_role" class="p-4 bg-slate-50 rounded-2xl font-bold"><option value="PEGAWAI">PEGAWAI</option><option value="KSBU">KSBU</option></select>
                                <select id="hr_unit" class="p-4 bg-slate-50 rounded-2xl font-bold"><option value="SUB BAGIAN UMUM">SUB BAGIAN UMUM</option><option value="SEKSI PKN">SEKSI PKN</option><option value="SEKSI LELANG">SEKSI LELANG</option><option value="SEKSI HI">SEKSI HI</option><option value="SEKSI PI">SEKSI PI</option></select>
                            </div>
                            <button type="submit" class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs">SIMPAN DATA</button>
                            <button type="button" onclick="Kepegawaian.closeModal()" class="w-full text-slate-400 font-bold text-[10px]">BATAL</button>
                        </form>
                    </div>
                </div>`;
        },

        getPenugasanPopUpHTML() { return `<div id="modal-penugasan-multi" class="hidden fixed inset-0 bg-slate-900/60 z-[1100] flex items-center justify-center p-4"><div class="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl"><h3 class="font-black italic mb-2 uppercase">Penugasan Khusus</h3><p id="target-pegawai-name" class="text-[10px] font-bold text-indigo-500 mb-6 uppercase"></p><div id="checklist-container" class="max-h-60 overflow-y-auto mb-6 space-y-2"></div><div class="flex gap-2"><button onclick="Kepegawaian.closePenugasanPopUp()" class="flex-1 p-4 bg-slate-100 rounded-2xl font-black text-[10px] uppercase">Batal</button><button onclick="Kepegawaian.savePenugasanMulti()" class="flex-[2] p-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase">Simpan</button></div></div></div>`; },

        getRiwayatModalHTML() { return `<div id="modal-riwayat" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1100] flex items-center justify-center p-4"><div class="bg-white w-full max-w-md rounded-[3rem] p-10"><h3 id="rw-modal-title" class="text-xl font-black uppercase italic mb-6">Input Riwayat</h3><form onsubmit="Kepegawaian.handleSaveRiwayat(event)" class="space-y-4"><div id="rw-fields-container" class="space-y-4"></div><button type="submit" class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] mt-4">Simpan Riwayat</button></form></div></div>`; },

        // --- HELPER LAINNYA ---
        openForm() { this.editMode = false; this.tempFoto = ''; document.getElementById('modal-hr').classList.remove('hidden'); },
        closeModal() { document.getElementById('modal-hr').classList.add('hidden'); },
        closePenugasanPopUp() { document.getElementById('modal-penugasan-multi').classList.add('hidden'); },
        closeRiwayatModal() { document.getElementById('modal-riwayat').classList.add('hidden'); },
        switchMode(m) { this.currentMode = m; this.showModule(); }
    };

    window.Kepegawaian = HR_MODULE;
    window.KepegawaianHandle = true;
})();