/**
 * MODUL SETTINGS & CONFIGURATION (V1.6)
 * Update: Auto-Calibration GPS, Radius 500m & Fix KPKNL Serang
 */

const Settings = (() => {
    // Sinkronisasi data awal dengan koordinat presisi KPKNL Serang
    const initDefaultConfig = () => {
        if (!window.App.config) {
            window.App.config = {
                radius_meter: 500,
                office_lat: -6.118012, 
                office_lng: 106.138402
            };
        }
    };

    const showModule = () => {
        initDefaultConfig();
        const mainView = document.getElementById('main-view');
        
        mainView.innerHTML = `
            <div class="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div class="mb-10 flex justify-between items-center">
                    <div>
                        <h2 class="text-3xl font-black italic text-slate-800 tracking-tighter uppercase leading-none">System Control</h2>
                        <p class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-2">Pengaturan Lokasi KPKNL Serang</p>
                    </div>
                    <div class="text-right">
                        <span class="text-[9px] font-black text-slate-400 uppercase">Tahun Anggaran</span>
                        <p class="text-sm font-black text-slate-800">${new Date().getFullYear()}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="space-y-2">
                        ${createTabItem('config', 'fa-gear', 'Konfigurasi Sistem', true)}
                        ${createTabItem('security', 'fa-shield-halved', 'Keamanan', false)}
                        ${createTabItem('database', 'fa-database', 'Backup', false)}
                    </div>

                    <div id="settings-content" class="md:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                        ${renderConfigPage()}
                    </div>
                </div>
            </div>
        `;
    };

    function createTabItem(id, icon, label, active) {
        return `
            <button onclick="Settings.switchTab('${id}')" id="tab-${id}" 
                class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest
                ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-slate-800'}">
                <i class="fa-solid ${icon} text-lg"></i>
                ${label}
            </button>
        `;
    }

    function renderConfigPage() {
        const config = window.App.config;

        return `
            <div class="animate-in fade-in duration-300">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-black text-slate-800 uppercase flex items-center gap-3">
                        <i class="fa-solid fa-location-dot text-rose-500"></i> Titik Pusat Presensi
                    </h3>
                    <button onclick="Settings.getCurrentLocation()" class="text-[9px] font-black uppercase bg-rose-50 text-rose-600 px-3 py-2 rounded-lg hover:bg-rose-600 hover:text-white transition-all">
                        <i class="fa-solid fa-crosshairs mr-1"></i> Ambil Lokasi Saya
                    </button>
                </div>

                <div class="space-y-6">
                    <div class="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Radius Maksimal (Meter)</label>
                        <input type="number" id="input-radius" value="${config.radius_meter}" class="w-full p-4 bg-white border-none rounded-2xl font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                        <p class="text-[9px] text-slate-400 mt-2 ml-1 font-bold italic">* Direkomendasikan 500 meter untuk area KPKNL Serang.</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                            <label class="block text-[10px] font-black text-slate-400 uppercase mb-2">Latitude</label>
                            <input type="text" id="input-lat" value="${config.office_lat}" class="w-full p-4 bg-white border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                        </div>
                        <div class="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                            <label class="block text-[10px] font-black text-slate-400 uppercase mb-2">Longitude</label>
                            <input type="text" id="input-lng" value="${config.office_lng}" class="w-full p-4 bg-white border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                        </div>
                    </div>

                    <button onclick="Settings.saveData()" 
                        class="w-full bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
                        Simpan & Sinkronkan Jarak
                    </button>
                </div>
            </div>
        `;
    }

    // FITUR BARU: Ambil lokasi saat ini untuk kalibrasi
    const getCurrentLocation = () => {
        if (!navigator.geolocation) return alert("GPS tidak didukung browser ini.");
        
        const btn = event.currentTarget;
        btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-1"></i> Mencari...';

        navigator.geolocation.getCurrentPosition((pos) => {
            document.getElementById('input-lat').value = pos.coords.latitude.toFixed(6);
            document.getElementById('input-lng').value = pos.coords.longitude.toFixed(6);
            btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Lokasi Didapat';
            setTimeout(() => { 
                btn.innerHTML = '<i class="fa-solid fa-crosshairs mr-1"></i> Ambil Lokasi Saya';
            }, 2000);
        }, (err) => {
            alert("Gagal mengambil lokasi. Pastikan GPS aktif.");
            btn.innerHTML = '<i class="fa-solid fa-crosshairs mr-1"></i> Ambil Lokasi Saya';
        }, { enableHighAccuracy: true });
    };

    const saveData = () => {
        const rad = document.getElementById('input-radius').value;
        const lat = document.getElementById('input-lat').value;
        const lng = document.getElementById('input-lng').value;
        
        // simpan ke objek global agar bisa diakses oleh presensi.js
        window.App.config = {
            radius_meter: parseInt(rad),
            office_lat: parseFloat(lat),
            office_lng: parseFloat(lng)
        }

        if (window.App && window.App.updateConfig) {
            window.App.updateConfig(rad, lat, lng);
            window.App.showSuccessFeedback(`Konfigurasi Terkunci! Jarak kini dihitung dari titik baru.`);
        } else {
            window.App.config = { radius_meter: parseInt(rad), office_lat: parseFloat(lat), office_lng: parseFloat(lng) };
            alert("Data tersimpan di sistem global.");
        }
    };

    const switchTab = (tabId) => {
        const content = document.getElementById('settings-content');
        document.querySelectorAll('[id^="tab-"]').forEach(btn => {
            btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-lg');
            btn.classList.add('text-slate-400', 'hover:bg-white');
        });
        document.getElementById(`tab-${tabId}`).classList.add('bg-indigo-600', 'text-white', 'shadow-lg');

        if (tabId === 'config') content.innerHTML = renderConfigPage();
        else content.innerHTML = `<div class="p-20 text-center text-slate-200 uppercase font-black tracking-widest text-xs"><i class="fa-solid fa-lock text-4xl mb-4 block"></i>Fitur Segera Hadir</div>`;
    };

    return { showModule, switchTab, saveData, getCurrentLocation };
})();

window.Settings = Settings;