/**
 * Modul Approval Center - SATU-SERANG (V6.8)
 * Update: Integrasi Tiket ATK, Kendaraan, & Sinkronisasi ke Rumah Tangga
 */
const Approval = {
    tteKey: "123456",
    ticketKey: 'data_tiket_serang',
    cutiKey: 'data_cuti_serang',
    rtKey: 'data_rumahtangga_serang',

    showModule: function() {
        const container = document.getElementById('module-content');
        if (!container) return;

        container.innerHTML = `
            <div class="p-8 animate-in fade-in duration-500">
                <div class="mb-8 flex justify-between items-center">
                    <div>
                        <h2 class="text-3xl font-black italic text-slate-800 uppercase tracking-tighter leading-none">Approval Center</h2>
                        <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Panel Verifikasi & TTE (Tanda Tangan Elektronik)</p>
                    </div>
                    <div class="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                         <p class="text-[9px] font-black text-emerald-600 uppercase tracking-widest text-right">Keamanan Dokumen</p>
                         <p class="text-[10px] font-bold text-emerald-500 flex items-center gap-2">
                            <i class="fa-solid fa-shield-halved"></i> QR-VERIFIED & DOUBLE TTE
                         </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="space-y-4">
                        <div class="flex items-center gap-3 px-2">
                            <i class="fa-solid fa-calendar-check text-indigo-500"></i>
                            <h3 class="font-black uppercase text-xs tracking-widest text-slate-600">Verifikasi Cuti</h3>
                        </div>
                        <div id="list-approval-cuti" class="space-y-4"></div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center gap-3 px-2">
                            <i class="fa-solid fa-car text-emerald-500"></i>
                            <h3 class="font-black uppercase text-xs tracking-widest text-slate-600">Logistik Kendaraan</h3>
                        </div>
                        <div id="list-approval-kendaraan" class="space-y-4"></div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center gap-3 px-2">
                            <i class="fa-solid fa-box text-amber-500"></i>
                            <h3 class="font-black uppercase text-xs tracking-widest text-slate-600">Permintaan ATK</h3>
                        </div>
                        <div id="list-approval-barang" class="space-y-4"></div>
                    </div>
                </div>
            </div>
        `;
        this.loadRequests();
    },

    notify: function(msg) {
        if (window.App && typeof window.App.showSuccessFeedback === 'function') {
            window.App.showSuccessFeedback(msg);
        } else {
            alert(msg);
        }
    },

    loadRequests: function() {
        this.renderCutiList();
        this.renderATKList();
        this.renderKendaraanList();
    },

    // --- LOGIKA APPROVAL CUTI ---
    renderCutiList: function() {
        const listContainer = document.getElementById('list-approval-cuti');
        const data = JSON.parse(localStorage.getItem(this.cutiKey)) || [];
        const activeRequests = data.filter(item => item.status === 'DIAJUKAN');

        if (activeRequests.length === 0) {
            listContainer.innerHTML = this.emptyStateTemplate('Antrean Cuti Bersih');
            return;
        }

        listContainer.innerHTML = activeRequests.map(item => `
            <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="text-[8px] font-black bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded uppercase">${item.jenis}</span>
                        <p class="font-black text-slate-800 uppercase text-sm mt-1">${item.pemohon || 'Pegawai'}</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase italic">${item.durasi} Hari Kerja</p>
                    </div>
                    <span class="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[8px] font-black uppercase italic tracking-tighter">TTE PEMOHON: OK</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="Approval.handleActionCuti('${item.id}', 'APPROVE')" class="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg">
                        <i class="fa-solid fa-signature mr-1"></i> TTE & APPROVE
                    </button>
                    <button onclick="Approval.handleActionCuti('${item.id}', 'REJECT')" class="px-4 bg-slate-50 text-slate-400 py-3 rounded-2xl font-black text-[9px] uppercase hover:bg-rose-50 hover:text-rose-500 transition-all">
                        Tolak
                    </button>
                </div>
            </div>
        `).join('');
    },

    handleActionCuti: function(id, type) {
        if (type === 'REJECT') {
            if (!confirm("Tolak permohonan ini?")) return;
            this.updateDataStatus(this.cutiKey, id, 'DITOLAK');
            this.notify("Permohonan Cuti Ditolak");
            this.showModule();
            return;
        }

        const pin = prompt("Masukkan Passphrase TTE ATASAN (Default: 123456):");
        if (pin === this.tteKey) {
            let data = JSON.parse(localStorage.getItem(this.cutiKey)) || [];
            let idx = data.findIndex(i => i.id === id);
            if (idx !== -1) {
                data[idx].status = 'DISETUJUI HRD (TTE)';
                data[idx].tgl_tte_atasan = new Date().toISOString();
                localStorage.setItem(this.cutiKey, JSON.stringify(data));
                this.notify("Dokumen Berhasil Di-TTE & Disetujui");
                this.generatePDF(data[idx], 'Cuti');
                this.showModule();
            }
        } else if (pin !== null) alert("Passphrase TTE Salah!");
    },

    // --- LOGIKA APPROVAL ATK (SINKRON KE RUMAH TANGGA) ---
    renderATKList: function() {
        const listContainer = document.getElementById('list-approval-barang');
        const tickets = JSON.parse(localStorage.getItem(this.ticketKey)) || [];
        const activeTickets = tickets.filter(t => t.status === 'Diusulkan');

        if (activeTickets.length === 0) {
            listContainer.innerHTML = this.emptyStateTemplate('Antrean ATK Kosong');
            return;
        }

        listContainer.innerHTML = activeTickets.map(t => `
            <div class="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                        <i class="fa-solid fa-box-open"></i>
                    </div>
                    <div>
                        <p class="text-[9px] font-black text-amber-600 uppercase tracking-widest">Permohonan ATK</p>
                        <p class="font-black text-slate-800 text-xs uppercase">${t.perihal}</p>
                    </div>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl mb-4">
                    <p class="text-[8px] font-bold text-slate-400 uppercase">Pengaju: ${t.pengaju}</p>
                    <p class="text-[8px] font-black text-slate-600 uppercase">Jumlah: ${t.jumlah}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="Approval.handleActionATK(${t.id}, 'Disetujui')" class="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl font-black text-[9px] uppercase">Setujui</button>
                    <button onclick="Approval.handleActionATK(${t.id}, 'Ditolak')" class="flex-1 bg-slate-100 text-slate-400 py-2.5 rounded-xl font-black text-[9px] uppercase">Tolak</button>
                </div>
            </div>
        `).join('');
    },

    handleActionATK: function(id, status) {
        let tickets = JSON.parse(localStorage.getItem(this.ticketKey)) || [];
        let idx = tickets.findIndex(t => t.id === id);

        if (idx !== -1) {
            tickets[idx].status = status;
            localStorage.setItem(this.ticketKey, JSON.stringify(tickets));

            if (status === 'Disetujui') {
                this.forwardToRumahTangga(tickets[idx]);
                this.notify("Tiket Disetujui & Diteruskan ke RT");
            } else {
                this.notify("Tiket ATK Ditolak");
            }
            this.showModule();
        }
    },

    forwardToRumahTangga: function(tiket) {
        let dataRT = JSON.parse(localStorage.getItem(this.rtKey)) || [];
        dataRT.unshift({
            id: 'RT-' + tiket.id,
            perihal: tiket.perihal,
            jumlah: tiket.jumlah,
            status: 'DISETUJUI', // Status ini memicu tombol "Serahkan" di modul RT
            tanggal: tiket.tanggal,
            user: tiket.pengaju
        });
        localStorage.setItem(this.rtKey, JSON.stringify(dataRT));
    },

    // --- LOGIKA APPROVAL KENDARAAN (PLACEHOLDER) ---
    renderKendaraanList: function() {
        const container = document.getElementById('list-approval-kendaraan');
        container.innerHTML = this.emptyStateTemplate('Logistik Aman');
    },

    // --- UTILITIES ---
    updateDataStatus: function(key, id, status) {
        let data = JSON.parse(localStorage.getItem(key)) || [];
        data = data.map(item => item.id === id ? { ...item, status } : item);
        localStorage.setItem(key, JSON.stringify(data));
    },

    emptyStateTemplate: (msg) => `
        <div class="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest">${msg}</p>
        </div>
    `,

    generatePDF: function(item, jenis) {
        if (!window.jspdf || !window.QRCode) { 
            alert("Sistem Gagal: Library jsPDF atau QRCode tidak ditemukan."); 
            return; 
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            const dateToday = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

            doc.setFont("helvetica", "bold").setFontSize(11);
            doc.text(`Perihal: PERMOHONAN ${item.jenis ? item.jenis.toUpperCase() : 'ATK'}`, 20, 30);
            doc.setFont("helvetica", "normal").text("Yth. Kepala KPKNL Serang", 20, 40);
            doc.text("di Serang", 20, 45);

            doc.text("Identitas Pemohon:", 20, 60);
            doc.text(`Nama : ${item.pemohon || item.pengaju}`, 30, 70);
            doc.text(`Detail : ${item.durasi ? item.durasi + ' Hari Cuti' : item.perihal + ' ('+item.jumlah+')'}`, 30, 75);

            doc.text("Demikian disampaikan untuk dapat dipergunakan sebagaimana mestinya.", 20, 100);

            // Tanda Tangan Atasan
            doc.text(`Serang, ${dateToday}`, 135, 135);
            doc.text("Menyetujui,", 135, 140);
            
            const qrDiv = document.createElement('div');
            const verifyText = `VERIFIED_BY_SYSTEM\nDOC_ID: ${item.id}\nOFFICER: Gunawan Sulistyo\nTS: ${new Date().toISOString()}`;
            
            new QRCode(qrDiv, { text: verifyText, width: 100, height: 100 });

            setTimeout(() => {
                const canvas = qrDiv.querySelector('canvas');
                if (canvas) {
                    const qrData = canvas.toDataURL("image/png");
                    doc.addImage(qrData, 'PNG', 138, 145, 20, 20);
                    doc.setFontSize(8).setTextColor(34, 197, 94);
                    doc.text("SIGNED DIGITALLY", 135, 170);
                    doc.setTextColor(0).setFontSize(10).text("Gunawan Sulistyo", 135, 178);
                    doc.save(`Approval_${jenis}_${item.id}.pdf`);
                }
            }, 300);

        } catch (err) { console.error("PDF Error:", err); }
    }
};

window.Approval = Approval;