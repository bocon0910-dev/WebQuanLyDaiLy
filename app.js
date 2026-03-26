const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const config = {
    user: 'sa',
    password: '1234', 
    server: 'localhost',
    database: 'QLDLNGK',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Hỗ trợ đọc dữ liệu JSON

// 1. Gửi file HTML chính
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 2. API lấy dữ liệu khách hàng (Để HTML gọi fetch)
app.get('/api/data', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        const customers = await pool.request().query('SELECT * FROM KhachHang');
        res.json(customers.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CÁC ROUTE POST GIỮ NGUYÊN LOGIC ---
app.post('/add-customer', async (req, res) => {
    try {
        const { MaKH, TenKH, SDT, DiaChi } = req.body;
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaKH', sql.VarChar, MaKH).input('TenKH', sql.NVarChar, TenKH)
            .input('SDT', sql.VarChar, SDT).input('DiaChi', sql.NVarChar, DiaChi)
            .query('INSERT INTO KhachHang (MaKH, TenKH, SDT, DiaChi, NoHienTai, VoDangGiu) VALUES (@MaKH, @TenKH, @SDT, @DiaChi, 0, 0)');
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/add-product', async (req, res) => {
    try {
        const { MaSP, TenSP, GiaNuoc, GiaVo } = req.body;
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaSP', sql.VarChar, MaSP).input('TenSP', sql.NVarChar, TenSP)
            .input('GiaNuoc', sql.Decimal, GiaNuoc).input('GiaVo', sql.Decimal, GiaVo)
            .query('INSERT INTO SanPham (MaSP, TenSP, GiaNuoc, GiaVo) VALUES (@MaSP, @TenSP, @GiaNuoc, @GiaVo)');
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/add-invoice', async (req, res) => {
    try {
        const { MaHD, NgayLap, SoVoKhachTra, MaKH, MaSP, SoLuong } = req.body;
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaHD', sql.VarChar, MaHD).input('NgayLap', sql.Date, NgayLap)
            .input('SoVoKhachTra', sql.Int, SoVoKhachTra).input('MaKH', sql.VarChar, MaKH)
            .query('INSERT INTO HoaDon (MaHD, NgayLap, SoVoKhachTra, DaThanhToan, MaKH) VALUES (@MaHD, @NgayLap, @SoVoKhachTra, 0, @MaKH)');
        await pool.request()
            .input('MaHD', sql.VarChar, MaHD).input('MaSP', sql.VarChar, MaSP).input('SoLuong', sql.Int, SoLuong)
            .query('INSERT INTO ChiTietHoaDon (MaHD, MaSP, SoLuong) VALUES (@MaHD, @MaSP, @SoLuong)');
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/add-payment', async (req, res) => {
    try {
        const { MaTT, NgayThanhToan, MaKH, SoTien } = req.body;
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaTT', sql.VarChar, MaTT).input('NgayThanhToan', sql.Date, NgayThanhToan)
            .input('MaKH', sql.VarChar, MaKH).input('SoTien', sql.Decimal, SoTien)
            .query('INSERT INTO ThanhToan (MaTT, NgayThanhToan, SoTien, MaKH) VALUES (@MaTT, @NgayThanhToan, @SoTien, @MaKH)');
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

const PORT = 9101;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));