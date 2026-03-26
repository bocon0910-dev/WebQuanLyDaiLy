CREATE TRIGGER TRG_UpdateHoaDon
ON ChiTietHoaDon
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE k
    SET VoDangGiu = k.VoDangGiu 
                    + ISNULL(t.TongSoLuong,0) 
                    - ISNULL(h.SoVoKhachTra,0)
    FROM KhachHang k
    JOIN HoaDon h ON k.MaKH = h.MaKH
    JOIN (
        SELECT MaHD, SUM(SoLuong) AS TongSoLuong
        FROM inserted
        GROUP BY MaHD
    ) t ON h.MaHD = t.MaHD;

    UPDATE k
    SET NoHienTai = k.NoHienTai 
                    + ISNULL(t.TongTien,0) 
                    - ISNULL(h.DaThanhToan,0)
    FROM KhachHang k
    JOIN HoaDon h ON k.MaKH = h.MaKH
    JOIN (
        SELECT i.MaHD, SUM(i.SoLuong * s.GiaNuoc) AS TongTien
        FROM inserted i
        JOIN SanPham s ON i.MaSP = s.MaSP
        GROUP BY i.MaHD
    ) t ON h.MaHD = t.MaHD;

END
GO

CREATE TRIGGER TRG_UpdateThanhToan
ON ThanhToan
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE k
    SET NoHienTai = k.NoHienTai - t.TongTien
    FROM KhachHang k
    JOIN (
        SELECT MaKH, SUM(SoTien) AS TongTien
        FROM inserted
        GROUP BY MaKH
    ) t ON k.MaKH = t.MaKH;

END
GO