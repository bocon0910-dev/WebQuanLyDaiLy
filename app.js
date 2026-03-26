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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// 1. Trang chủ: Lấy cả Khách hàng và Sản phẩm
app.get('/', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        const customers = await pool.request().query('SELECT * FROM KhachHang');
        const products = await pool.request().query('SELECT * FROM SanPham');
        
        res.render('index', { 
            customers: customers.recordset,
            products: products.recordset 
        });
    } catch (err) {
        res.status(500).send("Lỗi kết nối: " + err.message);
    }
});

// 2. Route: Thêm khách hàng
app.post('/add-customer', async (req, res) => {
    try {
        const { MaKH, TenKH, SDT, DiaChi } = req.body;
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaKH', sql.VarChar, MaKH)
            .input('TenKH', sql.NVarChar, TenKH)
            .input('SDT', sql.VarChar, SDT)
            .input('DiaChi', sql.NVarChar, DiaChi)
            .query('INSERT INTO KhachHang (MaKH, TenKH, SDT, DiaChi, NoHienTai, VoDangGiu) VALUES (@MaKH, @TenKH, @SDT, @DiaChi, 0, 0)');
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

// 3. Route: Thêm Sản phẩm (Mới)
app.post('/add-product', async (req, res) => {
    try {
        const { MaSP, TenSP, GiaNuoc, GiaVo } = req.body;
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaSP', sql.VarChar, MaSP)
            .input('TenSP', sql.NVarChar, TenSP)
            .input('GiaNuoc', sql.Decimal, GiaNuoc)
            .input('GiaVo', sql.Decimal, GiaVo)
            .query('INSERT INTO SanPham (MaSP, TenSP, GiaNuoc, GiaVo) VALUES (@MaSP, @TenSP, @GiaNuoc, @GiaVo)');
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

// 4. Route: Nhập hóa đơn
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

// 5. Route: Thanh toán (Mới)
app.post('/add-payment', async (req, res) => {
    try {
        const { MaTT, NgayThanhToan, MaKH, SoTien, GhiChu } = req.body;
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaTT', sql.VarChar, MaTT).input('NgayThanhToan', sql.Date, NgayThanhToan)
            .input('MaKH', sql.VarChar, MaKH).input('SoTien', sql.Decimal, SoTien).input('GhiChu', sql.NVarChar, GhiChu)
            .query('INSERT INTO ThanhToan (MaTT, NgayThanhToan, SoTien, GhiChu, MaKH) VALUES (@MaTT, @NgayThanhToan, @SoTien, @GhiChu, @MaKH)');
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

const PORT = 9101;
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});