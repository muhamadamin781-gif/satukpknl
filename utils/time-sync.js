/**
 * Utils: Time Sync - SATU-SERANG
 * Konsistensi waktu sistem dan formatting tanggal
 */
const TimeSync = {
    // Mendapatkan tanggal hari ini format YYYY-MM-DD
    getToday: function() {
        return new Date().toISOString().split('T')[0];
    },

    // Format ISO ke format Indonesia (DD Mon YYYY)
    formatIndo: function(dateStr) {
        if (!dateStr) return "-";
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    },

    // Cek apakah waktu saat ini masuk dalam rentang terlambat (contoh: > 07:30)
    isLate: function(timeStr, limit = "07:30") {
        return timeStr > limit;
    },

    // Update Label Periode di UI
    updatePeriodLabel: function(labelId, start, end) {
        const label = document.getElementById(labelId);
        if (label) {
            label.innerText = start ? `${this.formatIndo(start)} - ${this.formatIndo(end || '...')}` : "Seluruh Periode";
        }
    }
};