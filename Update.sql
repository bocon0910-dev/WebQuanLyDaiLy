CREATE TRIGGER TRG_UpdateVoDangGiu
ON ChiTietHoaDon
AFTER INSERT
AS
BEGIN
    UPDATE KhachHang
    SET VoDangGiu = VoDangGiu + (SELECT SoLuong FROM inserted) - 
                    (SELECT SoVoKhachTra FROM HoaDon WHERE MaHD = (SELECT MaHD FROM inserted))
    WHERE MaKH = (SELECT MaKH FROM HoaDon WHERE MaHD = (SELECT MaHD FROM inserted))
END
GO

CREATE TRIGGER TRG_UpdateNoKhiMuaHang
ON ChiTietHoaDon
AFTER INSERT
AS
BEGIN
    UPDATE KhachHang
    SET NoHienTai = NoHienTai + (
        SELECT (i.SoLuong * s.GiaNuoc)
        FROM inserted i
        JOIN SanPham s ON i.MaSP = s.MaSP
    )
    WHERE MaKH = (
        SELECT h.MaKH 
        FROM HoaDon h 
        JOIN inserted i ON h.MaHD = i.MaHD
    )
END
GO

CREATE TRIGGER TRG_UpdateNoKhiThanhToan
ON ThanhToan
AFTER INSERT
AS
BEGIN
    UPDATE KhachHang
    SET NoHienTai = NoHienTai - (SELECT SoTien FROM inserted)
    WHERE MaKH = (SELECT MaKH FROM inserted)
END
GO