CREATE TRIGGER TRG_UpdateHoaDon
ON ChiTietHoaDon
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE k
    SET VoDangGiu = k.VoDangGiu
                    + ISNULL(agg.TongSoLuong, 0)
                    - ISNULL(agg.SoVo, 0)
    FROM KhachHang k
    JOIN (
        SELECT
            h.MaKH,
            SUM(i.SoLuong)          AS TongSoLuong,
            MAX(h.SoVoKhachTra)     AS SoVo
            -- MAX vì mỗi MaHD chỉ có 1 giá trị SoVoKhachTra,
            -- dùng MAX để collapse sau GROUP BY MaKH
        FROM inserted i
        JOIN HoaDon h ON i.MaHD = h.MaHD
        GROUP BY h.MaKH
    ) agg ON k.MaKH = agg.MaKH;
    UPDATE k
    SET NoHienTai = CASE
        WHEN k.NoHienTai + ISNULL(agg.TongNo, 0) < 0
            THEN 0
        ELSE k.NoHienTai + ISNULL(agg.TongNo, 0)
    END
    FROM KhachHang k
    JOIN (
        SELECT
            h.MaKH,
            SUM(i.SoLuong * s.GiaNuoc)
            + CASE
                WHEN SUM(i.SoLuong) > MAX(h.SoVoKhachTra)
                THEN (SUM(i.SoLuong) - MAX(h.SoVoKhachTra)) * MAX(s.GiaVo)
                ELSE 0
              END
            - MAX(h.DaThanhToan)                            AS TongNo
        FROM inserted i
        JOIN HoaDon h  ON i.MaHD  = h.MaHD
        JOIN SanPham s ON i.MaSP  = s.MaSP
        GROUP BY h.MaKH
    ) agg ON k.MaKH = agg.MaKH;
END
GO

CREATE TRIGGER TRG_UpdateThanhToan
ON ThanhToan
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE k
    SET NoHienTai = CASE
        WHEN k.NoHienTai - ISNULL(t.TongTien, 0) < 0
            THEN 0
        ELSE k.NoHienTai - ISNULL(t.TongTien, 0)
    END
    FROM KhachHang k
    JOIN (
        SELECT MaKH, SUM(SoTien) AS TongTien
        FROM inserted
        GROUP BY MaKH
    ) t ON k.MaKH = t.MaKH;
END
GO
