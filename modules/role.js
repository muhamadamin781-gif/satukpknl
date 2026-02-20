const RoleManager = {
    // Definisi hak akses
    permissions: {
        'Admin': ['dashboard', 'pegawai', 'presensi', 'kendaraan', 'tiket', 'rt', 'laporan', 'approval'],
        'Kasubag Umum': ['dashboard', 'presensi', 'kendaraan', 'tiket', 'rt', 'approval'],
        'Kepala Seksi': ['dashboard', 'presensi', 'tiket', 'approval'],
        'Staf': ['dashboard', 'presensi', 'tiket', 'kendaraan_view'],
        'Anak Magang': ['dashboard', 'presensi']
    },

    // Fungsi untuk mengecek akses menu
    canAccess: function(moduleName) {
        const user = JSON.parse(localStorage.getItem('satu_session'));
        if (!user) return false;
        
        const userRole = user.role || 'Staf';
        return this.permissions[userRole].includes(moduleName);
    },

    // Fungsi untuk menyembunyikan menu di Sidebar
    applySidebarProtection: function() {
        const user = JSON.parse(localStorage.getItem('satu_session'));
        const role = user.role || 'Staf';
        
        console.log(`🛡️ Applying protection for: ${role}`);
        
        // Contoh: Jika bukan Admin, sembunyikan tombol Pegawai
        if (role !== 'Admin') {
            const btnPegawai = document.querySelector('button[onclick*="Kepegawaian"]');
            if (btnPegawai) btnPegawai.remove();
        }
    }
};