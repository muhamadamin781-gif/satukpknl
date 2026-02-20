const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

mongoose.connect('mongodb://127.0.0.1:27017/satu_serang')
    .then(() => console.log("Database SATU-SERANG Aktif"))
    .catch(err => console.error("Koneksi DB Gagal:", err));

// --- MODEL DATA TERPADU ---

// Tambahkan Model Pegawai di sini
const Pegawai = mongoose.model('Pegawai', new mongoose.Schema({
    id: String,
    nama: { type: String, uppercase: true },
    nip: { type: String, unique: true },
    password: { type: String, default: '123' }, // Password bawaan akun baru
    role: { type: String, default: 'PEGAWAI' }, // Default: PEGAWAI (bukan ADMIN)
    unit: String,
    penugasan: { type: String, default: '' }, // Untuk Penugasan Khusus (KSU)
    foto: String,
    riwayat: {
        jabatan: Array,
        pendidikan: Array,
        diklat: Array,
        mutasi: Array,
        penghargaan: Array,
        disiplin: Array
    }
}));

const Cuti = mongoose.model('Cuti', new mongoose.Schema({
    id: String, nama: String, jenisCuti: String, durasi: Number, 
    status: String, tte: Object, tanggalMulai: String, tanggalSelesai: String
}));

const Kendaraan = mongoose.model('Kendaraan', new mongoose.Schema({
    noPolisi: String, merek: String, jenis: String, foto: String, status: String
}));

// --- ENDPOINT API ---

// 1. API LOGIN (Cara akun pegawai masuk)
app.post('/api/login', async (req, res) => {
    const { nip, password } = req.body;
    const user = await Pegawai.findOne({ nip, password });
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: "NIP atau Password Salah" });
    }
});

// 2. API PEGAWAI (CRUD Akun)
app.get('/api/pegawai', async (req, res) => res.json(await Pegawai.find()));

app.post('/api/pegawai', async (req, res) => {
    try {
        const data = new Pegawai(req.body);
        res.json(await data.save());
    } catch (err) {
        res.status(400).json({ message: "Gagal buat akun, NIP mungkin sudah ada." });
    }
});

app.put('/api/pegawai/:id', async (req, res) => {
    res.json(await Pegawai.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }));
});

app.delete('/api/pegawai/:id', async (req, res) => {
    res.json(await Pegawai.findOneAndDelete({ id: req.params.id }));
});

// API Cuti & Kendaraan tetap sama...
app.get('/api/cuti', async (req, res) => res.json(await Cuti.find().sort({_id: -1})));
app.post('/api/cuti', async (req, res) => res.json(await new Cuti(req.body).save()));

app.get('/api/kendaraan', async (req, res) => res.json(await Kendaraan.find()));
app.post('/api/kendaraan', async (req, res) => res.json(await new Kendaraan(req.body).save()));

app.listen(3000, () => console.log("Server berjalan di port 3000"));