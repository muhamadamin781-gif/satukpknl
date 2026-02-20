(function() {
    if (window.RumahTanggaHandle) return;

    const RT_MODULE = {
        storageKey: 'data_rumahtangga_serang',
        asetKey: 'data_aset_serang',
        persediaanKey: 'data_stok_serang',
        tempDelete: null,
        tempTicket: null,

        listBarang: ["KERTAS A4 80GR", "KERTAS F4 80GR", "PULPEN BOX", "TINTA PRINTER HITAM", "TINTA PRINTER WARNA", "MAP SNELHECTER", "STAPLES", "LAKBAN", "BATERE AA"],

        getData(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; } },

        init() {
            if (!localStorage.getItem(this.storageKey)) localStorage.setItem(this.storageKey, JSON.stringify([]));
            if (!localStorage.getItem(this.asetKey)) localStorage.setItem(this.asetKey, JSON.stringify([]));
            if (!localStorage.getItem(this.persediaanKey)) localStorage.setItem(this.persediaanKey, JSON.stringify([]));
        },

        showModule() {
            this.init();
            const container = document.getElementById('module-content');
            if (!container) return;

            container.innerHTML = `
            <div class="p-8 space-y-8 animate-in fade-in duration-500">
                <div class="flex justify-between items-end">
                    <div>
                        <h2 class="text-3xl font-black italic text-slate-800 uppercase tracking-tighter text-indigo-900">Rumah Tangga</h2>
                        <div class="flex gap-4 mt-2">
                            <button onclick="RumahTangga.switchTab('logistik')" id="tab-logistik" class="pb-1 text-[10px] font-black uppercase">Permohonan</button>
                            <button onclick="RumahTangga.switchTab('aset')" id="tab-aset" class="pb-1 text-[10px] font-black uppercase">Daftar Aset</button>
                            <button onclick="RumahTangga.switchTab('stok')" id="tab-stok" class="pb-1 text-[10px] font-black uppercase">Stok Opname</button>
                        </div>
                    </div>
                    <div id="btn-action-container"></div>
                </div>

                <div id="section-logistik" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 hidden"></div>
                
                <div id="section-aset" class="hidden bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead><tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b"><th class="pb-4 pr-2">No.</th><th class="pb-4">Kode</th><th class="pb-4">Nama Barang</th><th class="pb-4 text-center">Kondisi</th><th class="pb-4 text-right">Aksi</th></tr></thead>
                        <tbody id="table-aset-body"></tbody>
                    </table>
                </div>

                <div id="section-stok" class="hidden bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead><tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b"><th class="pb-4">Barang</th><th class="pb-4 text-center">Stok Gudang</th><th class="pb-4 text-right">Aksi</th></tr></thead>
                        <tbody id="table-stok-body"></tbody>
                    </table>
                </div>
            </div>

            <div id="modal-serah" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                <div class="bg-white w-full max-w-sm rounded-[3rem] p-10 animate-in zoom-in shadow-2xl">
                    <h3 class="text-xl font-black italic uppercase text-slate-800 mb-2">Proses Pengeluaran</h3>
                    <p id="info-serah" class="text-[10px] font-bold text-indigo-500 uppercase mb-6"></p>
                    <div class="space-y-4">
                        <button onclick="RumahTangga.prosesSerah('LENGKAP')" class="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-emerald-100">Serahkan Sesuai Permintaan</button>
                        <div class="relative py-2 text-center text-[10px] font-black text-slate-300">--- ATAU SEBAGIAN ---</div>
                        <div class="flex gap-2">
                            <input type="number" id="qty-parsial" placeholder="Jml" class="w-20 p-4 bg-slate-100 rounded-2xl font-black text-center outline-none">
                            <button onclick="RumahTangga.prosesSerah('PARSIAL')" class="flex-1 bg-amber-500 text-white py-4 rounded-2xl font-black uppercase text-xs">Kirim Sesuai Ada</button>
                        </div>
                        <button onclick="RumahTangga.closeSerah()" class="w-full text-slate-400 font-black uppercase text-[10px] mt-4">Batal</button>
                    </div>
                </div>
            </div>

            <div id="modal-rt" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div class="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10">
                    <h3 id="modal-title" class="text-2xl font-black italic uppercase text-slate-800 mb-6 tracking-tighter">Form</h3>
                    <form onsubmit="RumahTangga.handleSave(event)" class="space-y-4">
                        <input type="hidden" id="form-mode"><input type="hidden" id="edit-id-stok"><div id="form-fields" class="space-y-4"></div>
                        <div class="flex gap-3 pt-4"><button type="submit" class="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs">Simpan</button><button type="button" onclick="RumahTangga.closeModal()" class="px-6 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase text-xs">Batal</button></div>
                    </form>
                </div>
            </div>

            <div id="popup-confirm" class="hidden fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                <div class="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center animate-in zoom-in"><h3 class="text-lg font-black text-slate-800 uppercase italic">Hapus Data?</h3><div class="flex gap-2 mt-6"><button onclick="RumahTangga.confirmDelete()" class="flex-1 bg-rose-600 text-white py-3 rounded-xl font-black uppercase text-[10px]">YA</button><button onclick="RumahTangga.hidePopup()" class="flex-1 bg-slate-100 text-slate-400 py-3 rounded-xl font-black uppercase text-[10px]">TIDAK</button></div></div>
            </div>
            `;
            this.switchTab('logistik');
        },

        switchTab(tab) {
            ['logistik', 'aset', 'stok'].forEach(t => {
                document.getElementById(`section-${t}`)?.classList.toggle('hidden', t !== tab);
                const btn = document.getElementById(`tab-${t}`);
                if (btn) btn.className = t === tab ? "pb-1 text-[10px] font-black uppercase border-b-2 border-indigo-600 text-indigo-600" : "pb-1 text-[10px] font-black uppercase text-slate-400";
            });
            const btnBox = document.getElementById('btn-action-container');
            if (tab === 'logistik') { btnBox.innerHTML = `<button onclick="RumahTangga.openForm('logistik')" class="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg">Buat Permohonan</button>`; this.renderTiket(); }
            else if (tab === 'aset') { btnBox.innerHTML = `<button onclick="RumahTangga.openForm('aset')" class="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg">Tambah Aset</button>`; this.renderAset(); }
            else if (tab === 'stok') { btnBox.innerHTML = `<button onclick="RumahTangga.openForm('stok')" class="bg-amber-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg">Update Stok</button>`; this.renderStok(); }
        },

        // FUNGSI INTI: POTONG STOK GUDANG
        potongStokGudang(namaBarang, qtyKeluar) {
            let stokData = this.getData(this.persediaanKey);
            const idx = stokData.findIndex(s => s.nama.toUpperCase() === namaBarang.toUpperCase());
            
            if (idx !== -1) {
                stokData[idx].stok = Math.max(0, parseInt(stokData[idx].stok) - qtyKeluar);
                localStorage.setItem(this.persediaanKey, JSON.stringify(stokData));
                return true;
            }
            return false;
        },

        prosesSerah(tipe) {
            let data = this.getData(this.storageKey);
            const idx = data.findIndex(i => i.id === this.tempTicket.id);
            if (idx === -1) return;

            let qtyAkanDipotong = 0;

            if (tipe === 'LENGKAP') {
                // Serahkan semua sisa permintaan tiket ini
                qtyAkanDipotong = data[idx].jumlah_sisa;
                data[idx].jumlah_sisa = 0;
                data[idx].status = 'SELESAI';
            } else {
                // Serahkan hanya sebagian (angka dari input)
                qtyAkanDipotong = parseInt(document.getElementById('qty-parsial').value) || 0;
                if (qtyAkanDipotong >= data[idx].jumlah_sisa) {
                    qtyAkanDipotong = data[idx].jumlah_sisa;
                    data[idx].jumlah_sisa = 0;
                    data[idx].status = 'SELESAI';
                } else {
                    data[idx].jumlah_sisa -= qtyAkanDipotong;
                    data[idx].status = 'KURANG';
                }
            }

            // Eksekusi potong stok di gudang
            const suksesPotong = this.potongStokGudang(data[idx].perihal, qtyAkanDipotong);
            if (!suksesPotong) {
                alert(`Barang "${data[idx].perihal}" tidak ada di Stok Opname. Stok gudang tidak terpotong, tapi status tiket diperbarui.`);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.renderTiket();
            this.closeSerah();
        },

        renderTiket() {
            const data = this.getData(this.storageKey);
            const container = document.getElementById('section-logistik');
            if (!container) return;
            container.innerHTML = data.map(item => `
                <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-1.5 h-full ${item.status==='SELESAI'?'bg-emerald-500':'bg-amber-400'}"></div>
                    <div class="flex justify-between items-start">
                        <div><p class="text-[9px] font-black text-slate-400 mb-1">${item.tanggal}</p><h4 class="font-black text-slate-800 uppercase text-sm">${item.perihal}</h4></div>
                        <span class="${item.status==='SELESAI'?'bg-emerald-100 text-emerald-600':'bg-amber-50 text-amber-600'} px-3 py-1 rounded-full text-[9px] font-black italic uppercase">${item.status}</span>
                    </div>
                    <div class="bg-slate-50 p-3 rounded-2xl text-[10px] font-bold flex justify-between">
                         <span class="text-slate-400 uppercase tracking-tighter">Permintaan: ${item.jumlah_awal}</span>
                         <span class="text-indigo-600 uppercase font-black">Sisa Tagihan: ${item.jumlah_sisa}</span>
                    </div>
                    <div class="flex gap-2 pt-2">
                        ${item.status !== 'SELESAI' ? `<button onclick="RumahTangga.openSerah('${item.id}')" class="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-[9px]">SERAHKAN</button>` : `<div class="flex-1 text-center py-3 text-emerald-500 font-black text-[9px]">PERMOHONAN SELESAI</div>`}
                        <button onclick="RumahTangga.showPopup('${this.storageKey}','${item.id}','renderTiket')" class="px-3 text-slate-200 hover:text-rose-500"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>`).join('');
        },

        renderStok() {
            const data = this.getData(this.persediaanKey);
            document.getElementById('table-stok-body').innerHTML = data.map(item => `
                <tr class="border-b border-slate-50 hover:bg-slate-50">
                    <td class="py-4 font-black uppercase text-slate-700">${item.nama}</td>
                    <td class="py-4 text-center font-black text-indigo-600 text-lg">${item.stok} <span class="text-[8px] text-slate-400 font-bold">${item.satuan}</span></td>
                    <td class="py-4 text-right space-x-3">
                        <button onclick='RumahTangga.editStok(${JSON.stringify(item)})' class="text-indigo-400 hover:text-indigo-600"><i class="fas fa-edit"></i></button>
                        <button onclick="RumahTangga.showPopup('${this.persediaanKey}','${item.id}','renderStok')" class="text-slate-200 hover:text-rose-500"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>`).join('');
        },

        // FUNGSI STANDAR LAINNYA
        openSerah(id) { this.tempTicket = this.getData(this.storageKey).find(i => i.id === id); document.getElementById('info-serah').innerText = `${this.tempTicket.perihal} (SISA: ${this.tempTicket.jumlah_sisa})`; document.getElementById('qty-parsial').value = this.tempTicket.jumlah_sisa; document.getElementById('modal-serah').classList.remove('hidden'); },
        closeSerah() { document.getElementById('modal-serah').classList.add('hidden'); },
        openForm(mode, editData = null) {
            const fields = document.getElementById('form-fields');
            document.getElementById('form-mode').value = mode;
            document.getElementById('edit-id-stok').value = editData ? editData.id : '';
            if (mode === 'stok') {
                document.getElementById('modal-title').innerText = editData ? "Edit Stok" : "Update Stok";
                const isCustom = editData && !this.listBarang.includes(editData.nama);
                fields.innerHTML = `<select id="f_stok_nama" onchange="RumahTangga.handleBarangChange(this.value)" class="w-full p-4 bg-slate-100 rounded-2xl font-black text-sm uppercase outline-none"><option value="">-- PILIH BARANG --</option>${this.listBarang.map(b => `<option value="${b}" ${editData?.nama === b ? 'selected' : ''}>${b}</option>`).join('')}<option value="CUSTOM" ${isCustom ? 'selected' : ''}>+ ISI NAMA SENDIRI</option></select><div id="custom-name-box" class="${isCustom ? '' : 'hidden'} mt-2"><input type="text" id="f_stok_nama_custom" placeholder="KETIK NAMA BARANG" class="w-full p-4 bg-indigo-50 rounded-2xl font-black text-sm uppercase outline-none" value="${isCustom ? editData.nama : ''}"></div><div class="grid grid-cols-2 gap-3 mt-2"><input type="number" id="f_stok_qty" placeholder="JUMLAH" required class="w-full p-4 bg-slate-100 rounded-2xl font-black text-sm outline-none" value="${editData ? editData.stok : ''}"><select id="f_stok_sat" class="w-full p-4 bg-slate-100 rounded-2xl font-black text-sm uppercase outline-none"><option value="RIM" ${editData?.satuan === 'RIM' ? 'selected' : ''}>RIM</option><option value="PCS" ${editData?.satuan === 'PCS' ? 'selected' : ''}>PCS</option><option value="BOX" ${editData?.satuan === 'BOX' ? 'selected' : ''}>BOX</option></select></div>`;
            } else if (mode === 'logistik') {
                document.getElementById('modal-title').innerText = "Buat Tiket";
                fields.innerHTML = `<select id="f_log_perihal" class="w-full p-4 bg-slate-100 rounded-2xl font-black text-sm uppercase outline-none"><option value="">-- PILIH BARANG --</option>${this.listBarang.map(b => `<option value="${b}">${b}</option>`).join('')}</select><input type="number" id="f_log_qty" placeholder="JUMLAH UNIT" required class="w-full p-4 bg-slate-100 rounded-2xl font-black text-sm outline-none">`;
            } else if (mode === 'aset') {
                document.getElementById('modal-title').innerText = "Input Aset";
                fields.innerHTML = `<input type="text" id="f_kode" placeholder="KODE" class="w-full p-4 bg-slate-100 rounded-2xl font-black text-sm uppercase outline-none"><input type="text" id="f_nama" placeholder="NAMA BARANG" required class="w-full p-4 bg-slate-100 rounded-2xl font-black text-sm uppercase outline-none"><input type="text" id="f_lokasi" placeholder="LOKASI" required class="w-full p-4 bg-slate-100 rounded-2xl font-black text-sm uppercase outline-none"><select id="f_kondisi" class="w-full p-4 bg-slate-100 rounded-2xl font-black text-sm uppercase outline-none"><option value="BAIK">BAIK</option><option value="RUSAK">RUSAK</option></select>`;
            }
            document.getElementById('modal-rt').classList.remove('hidden');
        },
        handleSave(e) {
            e.preventDefault();
            const mode = document.getElementById('form-mode').value;
            if (mode === 'stok') {
                let d = this.getData(this.persediaanKey);
                let n = document.getElementById('f_stok_nama').value;
                if(n === 'CUSTOM') n = document.getElementById('f_stok_nama_custom').value.toUpperCase();
                const editId = document.getElementById('edit-id-stok').value;
                const obj = { id: editId || 'STK-'+Date.now(), nama: n, stok: parseInt(document.getElementById('f_stok_qty').value), satuan: document.getElementById('f_stok_sat').value };
                if(editId) { let i = d.findIndex(x=>x.id===editId); d[i]=obj; } else { d.unshift(obj); }
                localStorage.setItem(this.persediaanKey, JSON.stringify(d)); this.renderStok();
            } else if (mode === 'logistik') {
                let d = this.getData(this.storageKey);
                const q = parseInt(document.getElementById('f_log_qty').value);
                d.unshift({ id: 'LOG-'+Date.now(), perihal: document.getElementById('f_log_perihal').value, jumlah_awal: q, jumlah_sisa: q, tanggal: new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'short'}), status: 'PROSES' });
                localStorage.setItem(this.storageKey, JSON.stringify(d)); this.renderTiket();
            } else if (mode === 'aset') {
                let d = this.getData(this.asetKey);
                d.unshift({ id: 'AST-'+Date.now(), kode: document.getElementById('f_kode').value.toUpperCase(), nama: document.getElementById('f_nama').value.toUpperCase(), lokasi: document.getElementById('f_lokasi').value.toUpperCase(), kondisi: document.getElementById('f_kondisi').value });
                localStorage.setItem(this.asetKey, JSON.stringify(d)); this.renderAset();
            }
            this.closeModal();
        },
        handleBarangChange(v) { document.getElementById('custom-name-box')?.classList.toggle('hidden', v !== 'CUSTOM'); },
        renderAset() { const d = this.getData(this.asetKey); document.getElementById('table-aset-body').innerHTML = d.map((x,i)=>`<tr class="border-b border-slate-50"><td class="py-4 font-bold text-slate-300">${i+1}</td><td class="py-4 font-mono font-bold text-indigo-600">${x.kode}</td><td class="py-4 font-black uppercase text-slate-700">${x.nama}</td><td class="py-4 text-center"><span class="${x.kondisi==='BAIK'?'bg-emerald-100 text-emerald-600':'bg-rose-100 text-rose-600'} px-2 py-1 rounded-full font-black text-[9px] uppercase">${x.kondisi}</span></td><td class="py-4 text-right"><button onclick="RumahTangga.showPopup('${this.asetKey}','${x.id}','renderAset')" class="text-slate-200 hover:text-rose-500"><i class="fas fa-trash-alt"></i></button></td></tr>`).join(''); },
        editStok(item) { this.openForm('stok', item); },
        showPopup(k, id, c) { this.tempDelete = { k, id, c }; document.getElementById('popup-confirm').classList.remove('hidden'); },
        hidePopup() { document.getElementById('popup-confirm').classList.add('hidden'); },
        confirmDelete() { if (this.tempDelete) { let d = this.getData(this.tempDelete.k).filter(i => i.id !== this.tempDelete.id); localStorage.setItem(this.tempDelete.k, JSON.stringify(d)); this[this.tempDelete.c](); this.hidePopup(); } },
        closeModal() { document.getElementById('modal-rt').classList.add('hidden'); }
    };

    window.RumahTangga = RT_MODULE;
    window.RumahTanggaHandle = true;
    RT_MODULE.showModule();
})();