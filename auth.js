const Auth = {
    sessionKey: 'pegawai_active_session',

    init: function() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }
    },

    handleLogin: async function() {
        const nipInput = document.getElementById('login_nip').value.trim();
        const passInput = document.getElementById('login_password').value;

        try {
            // Menghubungkan ke server port 3000 yang sudah aktif
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nip: nipInput, password: passInput })
            });

            const result = await response.json();

            if (result.success) {
                sessionStorage.setItem(this.sessionKey, JSON.stringify({
                    nip: result.user.nip,
                    nama: result.user.nama,
                    role: result.user.role || 'PEGAWAI', 
                    loginTime: new Date().getTime()
                }));
                alert('Selamat Datang, ' + result.user.nama + '!');
                window.location.reload();
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert("Koneksi ke server gagal. Pastikan CMD tetap terbuka!");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());