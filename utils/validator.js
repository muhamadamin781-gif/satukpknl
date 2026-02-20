/**
 * Utils: Validator - SATU-SERANG
 * Validasi input form untuk mencegah data korup
 */
const Validator = {
    // Validasi NIP (Minimal 18 digit untuk standar ASN)
    isValidNIP: function(nip) {
        return /^\d{18}$/.test(nip);
    },

    // Pastikan input tidak kosong
    isNotEmpty: function(value) {
        return value && value.trim().length > 0;
    },

    // Validasi Stok (Hanya angka positif)
    isValidStock: function(num) {
        return !isNaN(num) && parseInt(num) >= 0;
    },

    // Feedback visual jika error
    markError: function(elementId, isValid) {
        const el = document.getElementById(elementId);
        if (el) {
            el.style.borderColor = isValid ? '#e2e8f0' : '#ef4444'; // slate-200 atau red-500
        }
    }
};