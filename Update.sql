ALTER TRIGGER TRG_UpdateVoDangGiu
ON ChiTietHoaDon
AFTER INSERT
AS
BEGIN
    UPDATE KhachHang
    SET VoDangGiu = VoDangGiu + ISNULL(t.TongSoLuong,0) - ISNULL(h.SoVoKhachTra,0)
    FROM KhachHang k
    JOIN HoaDon h ON k.MaKH = h.MaKH
    JOIN (
        SELECT MaHD, SUM(SoLuong) AS TongSoLuong
        FROM inserted
        GROUP BY MaHD
    ) t ON h.MaHD = t.MaHD
END
GO

ALTER TRIGGER TRG_UpdateNoKhiMuaHang
ON ChiTietHoaDon
AFTER INSERT
AS
BEGIN
    UPDATE KhachHang
    SET NoHienTai = NoHienTai + t.TongTien
    FROM KhachHang k
    JOIN HoaDon h ON k.MaKH = h.MaKH
    JOIN (
        SELECT i.MaHD, SUM(i.SoLuong * s.GiaNuoc) AS TongTien
        FROM inserted i
        JOIN SanPham s ON i.MaSP = s.MaSP
        GROUP BY i.MaHD
    ) t ON h.MaHD = t.MaHD
END
GO

ALTER TRIGGER TRG_UpdateNoKhiThanhToan
ON ThanhToan
AFTER INSERT
AS
BEGIN
    UPDATE KhachHang
    SET NoHienTai = NoHienTai - t.TongTien
    FROM KhachHang k
    JOIN (
        SELECT MaKH, SUM(SoTien) AS TongTien
        FROM inserted
        GROUP BY MaKH
    ) t ON k.MaKH = t.MaKH
END
GO
