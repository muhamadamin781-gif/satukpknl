/**
 * APP.JS - Orchestrator Utama SATU SERANG (V6.8)
 * Update: Perbaikan Syntax Routing & Integrasi Settings
 */

const App = {
    isSidebarOpen: true,
    currentModule: 'kendaraan',
    isLoggedIn: false,
    clockInterval: null,

    init() {
        try {
            const sessionRaw = localStorage.getItem('satu_session');
            if (sessionRaw) {
                this.isLoggedIn = true;
                const user = JSON.parse(sessionRaw);
                this.renderLayout(user);
                const startMod = this.currentModule || 'dashboard';
                setTimeout(() => this.navigate(startMod), 50);
            } else {
                this.isLoggedIn = false;
                this.renderPublicLayout();
                setTimeout(() => this.navigate('kendaraan'), 50);
            }
        } catch (e) {
            console.error("Init error:", e);
            this.renderPublicLayout();
        }
    },

    // --- GLOBAL NOTIFICATION SYSTEM ---
    showSuccessFeedback(message) {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-10 left-1/2 -translate-x-1/2 z-[999] 
                           bg-slate-900 text-white px-8 py-4 rounded-[2rem] 
                           shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10`;
        toast.innerHTML = `
            <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <i class="fa-solid fa-check text-white"></i>
            </div>
            <div>
                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Sistem Berhasil</p>
                <p class="text-sm font-bold text-white">${message}</p>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('animate-out', 'fade-out', 'translate-y-10', 'duration-500');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    renderPublicLayout() {
        const container = document.getElementById('app-container');
        if (!container) return;
        container.innerHTML = `
            <div class="min-h-screen bg-slate-50 flex flex-col animate-in fade-in duration-500">
                <header class="bg-white border-b p-6 flex justify-between items-center px-8 md:px-12 shadow-sm sticky top-0 z-50">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <i class="fa-solid fa-bolt text-white"></i>
                        </div>
                        <div>
                            <h1 class="text-xl font-black italic text-slate-800 tracking-tighter uppercase leading-none">SATU SERANG</h1>
                            <p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1">Sistem Administrasi Terpadu Umum</p>
                        </div>
                    </div>
                    <button onclick="App.renderLoginPage()" class="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
                        <i class="fa-solid fa-user-lock mr-2"></i> Login Pegawai
                    </button>
                </header>
                <main id="main-view" class="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full"></main>
                <footer class="p-8 text-center text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">
                    &copy; 2026 KPKNL Serang - Integrated Core System
                </footer>
            </div>`;
    },

    renderLoginPage() {
        const container = document.getElementById('app-container');
        container.innerHTML = `
            <div class="h-screen w-full flex items-center justify-center bg-[#0f172a] px-4 animate-in fade-in duration-500">
                <div class="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md relative">
                    <button onclick="App.init()" class="absolute top-8 right-8 text-slate-300 hover:text-slate-800 transition">
                        <i class="fa-solid fa-xmark text-xl"></i>
                    </button>
                    <div class="text-center mb-10">
                        <div class="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto mb-6 flex items-center justify-center shadow-xl shadow-indigo-500/40">
                            <i class="fa-solid fa-shield-halved text-white text-3xl"></i>
                        </div>
                        <h1 class="text-3xl font-black italic text-slate-800 tracking-tighter uppercase leading-none">LOGIN PEGAWAI</h1>
                        <p class="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-3">Akses Sistem Internal</p>
                    </div>
                    <form onsubmit="event.preventDefault(); App.handleLogin();" class="space-y-5">
                        <div>
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Username</label>
                            <input type="text" id="login-user" placeholder="admin" required
                                class="w-full p-5 bg-slate-50 border-none rounded-3xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition">
                        </div>
                        <div>
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Password</label>
                            <input type="password" id="login-pass" placeholder="••••••••" required
                                class="w-full p-5 bg-slate-50 border-none rounded-3xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition">
                        </div>
                        <button type="submit" class="w-full bg-indigo-600 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 mt-4">
                            Masuk Sekarang
                        </button>
                        <p id="login-error" class="text-rose-500 text-[10px] font-black uppercase text-center hidden italic animate-pulse">Username atau password salah!</p>
                    </form>
                </div>
            </div>`;
    },

    handleLogin() {
        const user = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;
        const errorEl = document.getElementById('login-error');

        if (user === 'admin' && pass === 'admin') {
            const dummySession = { role: 'Super Admin', name: 'User Admin', avatar: 'A' };
            localStorage.setItem('satu_session', JSON.stringify(dummySession));
            this.currentModule = 'dashboard';
            this.isLoggedIn = true;
            this.init();
            setTimeout(() => this.showSuccessFeedback("Selamat Datang, Admin"), 600);
        } else {
            errorEl.classList.remove('hidden');
        }
    },

    logout() {
        if (confirm("Apakah anda yakin ingin keluar?")) {
            localStorage.removeItem('satu_session');
            if (this.clockInterval) clearInterval(this.clockInterval);
            this.isLoggedIn = false;
            this.currentModule = 'kendaraan';
            this.init();
        }
    },

    // --- SISTEM NAVIGASI ---
    navigate(moduleId) {
        this.currentModule = moduleId;
        const mainView = document.getElementById('main-view');
        if (!mainView) return;

        mainView.innerHTML = `<div id="module-content" class="animate-in fade-in slide-in-from-bottom-4 duration-500"></div>`;

        const routes = {
            kendaraan:   () => this.safeLoadModule('Kendaraan'),
            dashboard:   () => this.isLoggedIn ? this.safeLoadModule('Dashboard') : this.renderLoginPage(),
            presensi:    () => this.isLoggedIn ? this.safeLoadModule('Presensi') : this.renderLoginPage(),
            pegawai:     () => this.isLoggedIn ? this.safeLoadModule('Kepegawaian') : this.renderLoginPage(),
            rumahtangga: () => this.isLoggedIn ? this.safeLoadModule('RumahTangga') : this.renderLoginPage(),
            cuti:        () => this.isLoggedIn ? this.safeLoadModule('CutiModule') : this.renderLoginPage(),
            approval:    () => this.isLoggedIn ? this.safeLoadModule('Approval') : this.renderLoginPage(),
            tiket:       () => this.isLoggedIn ? this.safeLoadModule('Tiket') : this.renderLoginPage(),
            ekspedisi:   () => this.isLoggedIn ? this.safeLoadModule('ExpeditionManager') : this.renderLoginPage(),
            settings:    () => this.isLoggedIn ? this.safeLoadModule('Settings') : this.renderLoginPage()
        };

        if (routes[moduleId]) {
            routes[moduleId]();
            if (this.isLoggedIn) this.updateSidebarActiveState();
        } else {
            this.renderNotFound(`Modul "${moduleId}" tidak ditemukan.`);
        }
    },

    safeLoadModule(objectName) {
        const moduleObj = window[objectName];
        if (moduleObj && typeof moduleObj.showModule === 'function') {
            moduleObj.showModule();
        } else {
            this.renderNotFound(`
                <div class="flex flex-col items-center justify-center py-20 text-center">
                    <div class="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4">
                        <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
                    </div>
                    <p class="font-black text-slate-800 uppercase text-xs tracking-widest">Modul Gagal Dimuat</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mt-2">Objek "window.${objectName}" bermasalah</p>
                    <p class="text-[9px] text-slate-300 mt-1 uppercase italic px-10">
                        Pastikan file .js modul terkait sudah di-import di index.html sebelum app.js
                    </p>
                </div>`);
        }
    },

    renderLayout(user) {
        const container = document.getElementById('app-container');
        container.innerHTML = `
            <div class="flex h-screen bg-slate-50 overflow-hidden animate-in fade-in duration-500">
                <aside class="${this.isSidebarOpen ? 'w-64' : 'w-24'} bg-[#0f172a] transition-all duration-300 flex flex-col shadow-2xl relative z-20">
                    <div class="p-6 flex items-center justify-between">
                        ${this.isSidebarOpen ? '<h1 class="text-white font-black italic text-xl tracking-tighter uppercase">SATU SERANG</h1>' : '<i class="fa-solid fa-bolt text-white text-xl mx-auto"></i>'}
                        <button onclick="App.toggleSidebar()" class="text-slate-400 hover:text-white transition ${!this.isSidebarOpen ? 'hidden' : ''}">
                            <i class="fa-solid fa-bars-staggered"></i>
                        </button>
                    </div>
                    <nav class="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
                        ${this.createNavItem('dashboard', 'fa-gauge-high', 'Dashboard')}
                        ${this.createNavItem('presensi', 'fa-camera-retro', 'Presensi')}
                        ${this.createNavItem('pegawai', 'fa-users-gear', 'Kepegawaian')}
                        ${this.createNavItem('kendaraan', 'fa-car-side', 'Kendaraan')}
                        ${this.createNavItem('rumahtangga', 'fa-house-lock', 'Rumah Tangga')}
                        ${this.createNavItem('cuti', 'fa-calendar-check', 'Cuti')}
                        ${this.createNavItem('approval', 'fa-clipboard-check', 'Approval')}
                        ${this.createNavItem('tiket', 'fa-ticket-simple', 'Tiket')}
                        ${this.createNavItem('ekspedisi', 'fa-truck-fast', 'Ekspedisi')}
                        ${this.createNavItem('settings', 'fa-gear', 'Pengaturan')}
                    </nav>
                    <div class="p-4 border-t border-slate-800">
                        <button onclick="App.logout()" class="w-full flex items-center ${this.isSidebarOpen ? 'px-4' : 'justify-center'} py-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest">
                            <i class="fa-solid fa-power-off ${this.isSidebarOpen ? 'mr-4' : ''} text-lg"></i>
                            ${this.isSidebarOpen ? 'Logout' : ''}
                        </button>
                    </div>
                </aside>
                <main class="flex-1 flex flex-col overflow-hidden relative">
                    <header class="bg-white border-b p-4 flex justify-between items-center px-8 shadow-sm">
                        <div class="flex items-center gap-4">
                            ${!this.isSidebarOpen ? `<button onclick="App.toggleSidebar()" class="mr-2 text-slate-400"><i class="fa-solid fa-bars"></i></button>` : ''}
                            <div class="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-200">${user.avatar || 'A'}</div>
                            <div>
                                <p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">${user.role}</p>
                                <p class="text-sm font-black text-slate-800 tracking-tight">${user.name}</p>
                            </div>
                        </div>
                        <div id="clock" class="text-[10px] font-mono font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-4 py-2 rounded-full border border-slate-100"></div>
                    </header> 
                    <div id="main-view" class="flex-1 overflow-y-auto p-8 bg-slate-50/50"></div>
                </main>
            </div>`;
        this.startClock();
    },

    createNavItem(id, icon, label) {
        const isActive = this.currentModule === id;
        return `
            <button onclick="App.navigate('${id}')" id="nav-${id}"
                class="w-full flex items-center ${this.isSidebarOpen ? 'px-4' : 'justify-center'} py-3.5 rounded-2xl transition-all duration-300 group 
                ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}">
                <i class="fa-solid ${icon} ${this.isSidebarOpen ? 'mr-4' : ''} text-lg"></i>
                ${this.isSidebarOpen ? `<span class="font-black text-[10px] uppercase tracking-[0.15em]">${label}</span>` : ''}
            </button>`;
    },

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        const session = localStorage.getItem('satu_session');
        if (session) {
            this.renderLayout(JSON.parse(session));
            this.navigate(this.currentModule);
        }
    },

    updateSidebarActiveState() {
        document.querySelectorAll('nav button').forEach(btn => {
            btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-xl', 'shadow-indigo-900/40');
            btn.classList.add('text-slate-400', 'hover:bg-white/5', 'hover:text-white');
        });
        const active = document.getElementById(`nav-${this.currentModule}`);
        if (active) {
            active.classList.add('bg-indigo-600', 'text-white', 'shadow-xl', 'shadow-indigo-900/40');
            active.classList.remove('text-slate-400', 'hover:bg-white/5');
        }
    },

    startClock() {
        const update = () => {
            const clockEl = document.getElementById('clock');
            if (clockEl) {
                clockEl.innerText = new Date().toLocaleString('id-ID', { 
                    dateStyle: 'medium', 
                    timeStyle: 'medium' 
                }).replace(/\./g, ':');
            }
        };
        if (this.clockInterval) clearInterval(this.clockInterval);
        this.clockInterval = setInterval(update, 1000);
        update();
    },

    renderNotFound(msg) {
        const content = document.getElementById('main-view');
        if (content) {
            content.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center animate-in zoom-in duration-300">
                    <div class="text-slate-200 text-8xl mb-4"><i class="fa-solid fa-folder-open"></i></div>
                    <p class="font-black text-slate-400 uppercase tracking-widest text-sm">${msg}</p>
                </div>`;
        }
    }
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());