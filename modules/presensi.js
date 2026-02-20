/**
 * MODUL PRESENSI PEGAWAI - SATU KPKNL SERANG (V6.9)
 * Update: Fix Koordinat KPKNL Serang, Radius 500m, & Map Preview
 */

const Presensi = (() => {
    // --- KONFIGURASI TITIK KPKNL SERANG ---
    const CONFIG = {
        OFFICE_LAT: -6.118012, // Titik presisi gedung KPKNL Serang
        OFFICE_LNG: 106.138402,
        RADIUS_METER: 500,     // Radius maksimal sesuai permintaan
    };

    let state = {
        location: null,
        watchId: null
    };

    // Fungsi Hitung Jarak (Haversine Formula)
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; 
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
    };

    const showModule = () => {
        const mainView = document.getElementById('main-view');

        mainView.innerHTML = `
            <div class="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h2 class="text-3xl font-black italic text-slate-800 tracking-tighter uppercase leading-none">Presensi Digital</h2>
                        <p class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-2">KPKNL Serang Legok - Integrated Core</p>
                    </div>
                    <div class="bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div id="status-icon" class="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center transition-colors">
                            <i class="fa-solid fa-location-dot"></i>
                        </div>
                        <div>
                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Lokasi</p>
                            <p id="geo-status" class="text-xs font-bold text-slate-700 uppercase">Menghitung Jarak...</p>
                        </div>
                    </div>
                </div>

                <div class="mb-8 relative bg-slate-100 h-64 rounded-[3rem] border-4 border-white shadow-xl overflow-hidden group">
                    <img id="map-preview" src="https://maps.googleapis.com/maps/api/staticmap?center=${CONFIG.OFFICE_LAT},${CONFIG.OFFICE_LNG}&zoom=16&size=800x400&markers=color:red%7C${CONFIG.OFFICE_LAT},${CONFIG.OFFICE_LNG}&key=YOUR_API_KEY" 
                         alt="Peta Lokasi KPKNL Serang" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                    <div id="map-label" class="absolute bottom-6 left-6 text-[10px] font-black uppercase tracking-widest text-white z-10 bg-indigo-600/90 px-5 py-3 rounded-2xl shadow-lg">
                        <i class="fa-solid fa-crosshairs animate-pulse mr-2"></i> Melacak Koordinat...
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onclick="Presensi.handlePresensi('MASUK')" 
                        class="group relative bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-transparent hover:border-indigo-500 transition-all text-left overflow-hidden">
                        <div class="relative z-10">
                            <div class="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                                <i class="fa-solid fa-right-to-bracket text-xl"></i>
                            </div>
                            <h3 class="text-xl font-black text-slate-800 uppercase tracking-tight">Presensi Masuk</h3>
                            <p class="text-xs text-slate-400 font-medium mt-1">Gedung KPKNL Serang Legok.</p>
                        </div>
                        <div class="absolute -right-4 -bottom-4 text-slate-50 text-8xl font-black italic">IN</div>
                    </button>

                    <button onclick="Presensi.handlePresensi('PULANG')" 
                        class="group relative bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-transparent hover:border-rose-500 transition-all text-left overflow-hidden">
                        <div class="relative z-10">
                            <div class="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-rose-200">
                                <i class="fa-solid fa-right-from-bracket text-xl"></i>
                            </div>
                            <h3 class="text-xl font-black text-slate-800 uppercase tracking-tight">Presensi Pulang</h3>
                            <p class="text-xs text-slate-400 font-medium mt-1">Pastikan pekerjaan selesai.</p>
                        </div>
                        <div class="absolute -right-4 -bottom-4 text-slate-50 text-8xl font-black italic">OUT</div>
                    </button>
                </div>
            </div>
        `;
        startTracking();
    };

    function startTracking() {
        if (!navigator.geolocation) return updateStatus("GPS Tak Support", false);

        state.watchId = navigator.geolocation.watchPosition(
            pos => {
                const { latitude, longitude } = pos.coords;
                state.location = { latitude, longitude };
                
                const dist = getDistance(latitude, longitude, CONFIG.OFFICE_LAT, CONFIG.OFFICE_LNG);
                const isValid = dist <= CONFIG.RADIUS_METER;
                
                updateStatus(isValid ? "Dalam Radius" : `${Math.round(dist)}m Di Luar`, isValid);
            },
            err => updateStatus("GPS Off / Blocked", false),
            { enableHighAccuracy: true }
        );
    }

    function updateStatus(text, ok) {
        const el = document.getElementById('geo-status');
        const label = document.getElementById('map-label');
        const icon = document.getElementById('status-icon');

        if (el) {
            el.innerText = text;
            el.className = `text-xs font-bold uppercase ${ok ? 'text-emerald-500' : 'text-rose-500'}`;
        }
        if (icon) {
            icon.className = `w-10 h-10 rounded-full flex items-center justify-center transition-all ${ok ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`;
        }
        if (label) {
            label.innerHTML = ok ? `<i class="fa-solid fa-circle-check mr-2"></i> Area Kantor Terdeteksi` : `<i class="fa-solid fa-circle-exclamation mr-2"></i> ${text}`;
            label.className = `absolute bottom-6 left-6 text-[10px] font-black uppercase tracking-widest text-white z-10 px-5 py-3 rounded-2xl shadow-lg transition-all ${ok ? 'bg-emerald-600' : 'bg-rose-600'}`;
        }
    }

    const handlePresensi = async (tipe) => {
        if (!state.location) return alert("Menunggu koordinat GPS...");

        // AMBIL DATA DARI SETTING (Jika tidak ada, pakai default KPKNL Serang)
        const activelat = window.App?.config?.office_lat || -6.118012;
        const activelng = window.App?.config?.office_lng || 106.138402;
        const radius = window.App?.config?.radius_meter || 500; 

        const dist = getDistance(state.location.latitude, state.location.longitude, activelat, activelng);
        
        if (dist > activeRad) {
            alert(`Gagal! Anda berada ${Math.round(dist)} meter dari KPKNL Serang.`);
            return;
        }
        // Jika lolos jarak, lanjut ke SWA-FOTO
        const fotoDataUrl = await window.App.capturePhotoFromCamera();
        if (!fotoDataUrl) return alert("Gagal mengambil foto. Presensi dibatalkan.");   

        if (window.App) {
            App.showSuccessFeedback(`Berhasil Presensi ${tipe}! Jarak: ${Math.round(dist)}m`);
        }
    };

    return { showModule, handlePresensi };
})();

window.Presensi = Presensi;