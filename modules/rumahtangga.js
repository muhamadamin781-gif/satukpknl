/**
 * ============================================
 *  SATU KPKNL SERANG - System Settings Module
 * ============================================
 * File     : settings.js
 * Type     : Central Configuration Loader
 * Author   : SATU SERANG AI System
 * Function : Dynamic System Configuration Manager
 * Security : RBAC + Audit + Dynamic Reload
 * ============================================
 */

const Settings = {
  // =========================
  // CORE APP CONFIG
  // =========================
  app: {
    name: "SATU KPKNL SERANG",
    version: "1.0.0",
    institution: "KPKNL Serang",
    year: 2026,
    logo: "/assets/logo.png",
    theme: {
      mode: "light", // light | dark
      primary: "#1E40AF",
      secondary: "#F59E0B",
    }
  },

  // =========================
  // SYSTEM CONFIG
  // =========================
  system: {
    timezone: "Asia/Jakarta",
    language: "id",
    maintenance: false,
    environment: "production", // dev | staging | production
  },

  // =========================
  // PRESENSI CONFIG
  // =========================
  presensi: {
    jamKerja: {
      masuk: "07:30",
      pulang: "16:00",
      toleransiTelat: 15, // menit
    },

    mode: {
      gps: true,
      selfie: true,
      fingerprint: true,
      manual: false,
      wfh: true,
      dinasLuar: true,
      dalamKota: true
    },

    lokasi: {
      center: {
        lat: -6.120000,
        lng: 106.150000
      },
      radius: 150 // meter
    }
  },

  // =========================
  // SECURITY CONFIG
  // =========================
  security: {
    auth: {
      jwt: true,
      jwtExpired: "12h",
      otpLogin: false,
      captcha: false,
    },

    password: {
      minLength: 8,
      bcryptSalt: 10,
      forceStrong: true,
      expiredDay: 90
    },

    login: {
      maxAttempt: 5,
      lockTime: 30, // menit
      autoLogout: 20 // menit idle
    }
  },

  // =========================
  // ROLE & ACCESS
  // =========================
  roles: {
    super_admin: ["*"],
    admin: [
      "dashboard", "pegawai", "presensi", "pengaturan", "laporan", "log"
    ],
    kepala_kantor: [
      "dashboard", "laporan", "monitoring"
    ],
    kepala_seksi: [
      "dashboard", "presensi", "pegawai", "laporan"
    ],
    kasubag_umum: [
      "dashboard", "pegawai", "logistik", "laporan"
    ],
    pegawai: [
      "dashboard", "presensi", "profil"
    ]
  },

  // =========================
  // INTEGRATION CONFIG
  // =========================
  integration: {
    whatsapp: {
      enabled: true,
      provider: "WA-Gateway",
      apiUrl: "",
      apiKey: ""
    },

    email: {
      enabled: false,
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPass: ""
    },

    fingerprint: {
      enabled: true,
      deviceIP: "10.49.1.86",
      port: 4370
    }
  },

  // =========================
  // BACKUP & LOGGING
  // =========================
  backup: {
    auto: true,
    interval: "daily", // daily | weekly | monthly
    time: "02:00",
    location: "/backup/db"
  },

  logging: {
    audit: true,
    activity: true,
    login: true,
    ipTracking: true
  },

  // =========================
  // METHODS
  // =========================
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this);
  },

  set(path, value) {
    const keys = path.split('.');
    let obj = this;
    keys.slice(0, -1).forEach(k => obj = obj[k]);
    obj[keys[keys.length - 1]] = value;
    this.audit(path, value);
  },

  audit(path, value) {
    console.log(`[SETTINGS AUDIT] ${path} updated =>`, value);
    // TODO: save to DB log_pengaturan
  },

  reload(newConfig) {
    Object.assign(this, newConfig);
    console.log("[SETTINGS] Config reloaded dynamically");
  }
};

// =========================
// EXPORT
// =========================
if (typeof module !== "undefined") {
  module.exports = Settings;
}
export default Settings;