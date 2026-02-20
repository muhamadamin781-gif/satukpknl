function presensiMasuk(idKaryawan, latUser, lonUser, wajahValid) {
  const jarak = hitungJarak(kantorLat, kantorLon, latUser, lonUser);

  if (jarak <= 100 && wajahValid) {
    catatPresensi(idKaryawan, "Masuk", "Valid");
  } else {
    tampilkanTombolIzin(idKaryawan);
  }
}

function ajukanIzin(idKaryawan, alasan) {
  simpanIzin(idKaryawan, alasan, "Menunggu Persetujuan");
}

function prosesPersetujuan(idKaryawan, disetujui) {
  if (disetujui) {
    updateIzin(idKaryawan, "Disetujui");
    aktifkanTombolPresensiPulang(idKaryawan);
  } else {
    updateIzin(idKaryawan, "Ditolak");
  }
}

function presensiPulang(idKaryawan) {
  if (izinDisetujui(idKaryawan)) {
    catatPresensi(idKaryawan, "Pulang", "Valid dengan Izin");
  } else {
    console.log("Presensi pulang gagal: izin belum disetujui");
  }
}