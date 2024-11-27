const HoadonModel = require('../model/hoadons');
const ChiTietHoaDonModel = require('../model/chitiethoadons');
const CouponModel = require('../model/coupons')
const { formatCurrencyVND, formatDate } = require('./utils');

exports.getListorByIdUserorStatus = async (req, res, next) => {
    try {
        const { id_NguoiDung, trangThai } = req.query;

        // Xây dựng điều kiện lọc
        let filter = {};
        if (id_NguoiDung) {
            filter.id_NguoiDung = id_NguoiDung;
        }
        // Lọc theo `trangThai` nếu có, nhưng kiểm tra trạng thái khác 3
        if (trangThai) {
            const trangThaiInt = parseInt(trangThai, 10); // Đảm bảo kiểu số
            if (trangThaiInt === 3) {
                req.session.message = "Không thể lọc trạng thái là 3.";
                return res.redirect("/web/hoadons");
            } else {
                filter.trangThai = trangThaiInt; // Lọc chính xác trạng thái được yêu cầu
            }
        } else {
            // Mặc định lấy tất cả hóa đơn có trạng thái khác 3
            filter.trangThai = { $ne: 3 }; // MongoDB operator để kiểm tra "khác"
        }

        // Lấy danh sách hóa đơn theo điều kiện
        const hoadons = await HoadonModel.find(filter)
            .populate('id_NguoiDung', 'tenNguoiDung')
            .sort({ createdAt: -1 });

        if (!hoadons.length) {
            req.session.message = "Không tìm thấy hóa đơn phù hợp.";
            return res.redirect("/web/hoadons");
        }

        // Lấy chi tiết hóa đơn song song
        const results = await Promise.all(
            hoadons.map(async (hoadon) => {
                // Tìm chi tiết hóa đơn
                const chiTietHoaDons = await ChiTietHoaDonModel.find({ id_HoaDon: hoadon._id });

                if (!chiTietHoaDons.length) {
                    return { ...hoadon.toObject(), tongPhong: 0, tongKhach: 0, tongTien: 0 };
                }

                // Tính tổng số phòng, khách và tiền
                const tongPhong = chiTietHoaDons.length;
                const tongKhach = chiTietHoaDons.reduce((total, item) => total + item.soLuongKhach, 0);
                let tongTien = chiTietHoaDons.reduce((total, item) => total + item.giaPhong, 0);
                const ngayThanhToan = hoadon.trangThai === 1 ? formatDate(hoadon.updatedAt) : ''

                // Kiểm tra mã giảm giá
                if (hoadon.id_Coupon) {
                    const coupon = await CouponModel.findById(hoadon.id_Coupon).lean();

                    // Tính giảm giá
                    let soTienGiam = tongTien * coupon.giamGia;
                    if (coupon.giamGiaToiDa) {
                        soTienGiam = Math.min(soTienGiam, coupon.giamGiaToiDa);
                    }

                    // Áp dụng giảm giá vào tổng tiền
                    tongTien -= soTienGiam;

                    // Cập nhật trạng thái mã giảm giá (nếu cần)
                    await CouponModel.findByIdAndUpdate(hoadon.id_Coupon, { trangThai: 1 }); // 1: đã sử dụng
                } else {
                    hoadon.giamGia = 0; // Không có mã giảm giá
                }

                // Thêm mã hóa đơn từ 8 ký tự cuối của _id
                const maHoaDon = hoadon._id.toString().slice(-8);

                return {
                    ...hoadon.toObject(),
                    createdAt: formatDate(hoadon.createdAt),
                    ngayThanhToan,
                    tongPhong,
                    tongKhach,
                    maHoaDon,
                    tongTien: formatCurrencyVND(tongTien),
                };
            })
        );

        // Render kết quả
        const message = req.session.message || null;
        delete req.session.message;

        res.render('../views/hoadon/hoadons', { hoadons: results, message });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.render('../views/hoadon/hoadons', {
            hoadons: [],
            message: 'Lỗi khi lấy dữ liệu.',
        });
    }
};

exports.getDetailAPI = async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm hóa đơn và chi tiết
        const hoadon = await HoadonModel.findById(id)
            .populate('id_NguoiDung', 'tenNguoiDung email')
            .lean();

        if (!hoadon) {
            return res.status(404).json({ error: true, message: 'Không tìm thấy hóa đơn.' });
        }

        const chiTietHoaDons = await ChiTietHoaDonModel.find({ id_HoaDon: hoadon._id })
            .populate({
                path: 'id_Phong',
                select: 'soPhong id_LoaiPhong VIP',
                populate: { path: 'id_LoaiPhong', select: 'tenLoaiPhong giaTien' },
            })
            .lean();

        // Tính tổng số phòng, khách và tổng tiền từ chi tiết hóa đơn
        hoadon.tongPhong = chiTietHoaDons.length;
        hoadon.tongKhach = chiTietHoaDons.reduce((total, item) => total + item.soLuongKhach, 0);
        hoadon.tongTien = chiTietHoaDons.reduce((total, item) => total + item.giaPhong, 0);

        // Kiểm tra mã giảm giá
        if (hoadon.id_Coupon) {
            const coupon = await CouponModel.findById(hoadon.id_Coupon).lean();

            // if (!coupon) {
            //     return res.status(404).json({ error: true, message: 'Không tìm thấy mã giảm giá.' });
            // }

            // const now = new Date();
            // const ngayBatDau = new Date(coupon.ngayBatDau);
            // const ngayHetHan = new Date(coupon.ngayHetHan);

            // // Kiểm tra trạng thái mã giảm giá
            // if (coupon.trangThai !== 0) { // 0: chưa sử dụng
            //     return res.status(400).json({ error: true, message: 'Mã giảm giá đã được sử dụng hoặc không hợp lệ.' });
            // }

            // // Kiểm tra thời gian hợp lệ
            // if (now < ngayBatDau || now > ngayHetHan) {
            //     return res.status(400).json({ error: true, message: 'Mã giảm giá đã hết hạn hoặc chưa có hiệu lực.' });
            // }

            // // Kiểm tra điều kiện tối thiểu
            // if (hoadon.tongTien < coupon.dieuKienToiThieu) {
            //     return res.status(400).json({ error: true, message: `Hóa đơn chưa đạt điều kiện tối thiểu (${coupon.dieuKienToiThieu.toLocaleString()} VNĐ).` });
            // }

            // Tính giảm giá
            let soTienGiam = hoadon.tongTien * coupon.giamGia;
            if (coupon.giamGiaToiDa) {
                soTienGiam = Math.min(soTienGiam, coupon.giamGiaToiDa);
            }

            // Áp dụng giảm giá vào tổng tiền
            hoadon.tongTien -= soTienGiam;
            hoadon.giamGia = soTienGiam;

            // Cập nhật trạng thái mã giảm giá (nếu cần)
            // await CouponModel.findByIdAndUpdate(hoadon.id_Coupon, { trangThai: 1 }); // 1: đã sử dụng
        } else {
            hoadon.giamGia = 0; // Không có mã giảm giá
        }

        const ngayThanhToan = hoadon.trangThai === 1 ? formatDate(hoadon.updatedAt) : ''
        console.log('ngay thanh toán : ', ngayThanhToan)
        hoadon.ngayNhanPhong = formatDate(hoadon.ngayNhanPhong);
        hoadon.ngayTraPhong = formatDate(hoadon.ngayTraPhong);
        hoadon.createdAt = formatDate(hoadon.createdAt);
        hoadon.ngayThanhToan = ngayThanhToan;

        // Định dạng dữ liệu trả về
        hoadon.chiTiet = chiTietHoaDons.map((ct) => ({
            soPhong: ct.id_Phong.soPhong,
            tenLoaiPhong: ct.id_Phong.id_LoaiPhong?.tenLoaiPhong || 'Không xác định',
            giaPhong: ct.id_Phong.id_LoaiPhong?.giaTien || 'Không xác định',
            VIP: ct.id_Phong.VIP,
            soLuongKhach: ct.soLuongKhach,
            tongTien: ct.giaPhong,
            buaSang: ct.buaSang,
        }));

        res.json({ error: false, hoadon });
    } catch (error) {
        console.error('Error fetching invoice details:', error);
        res.status(500).json({ error: true, message: 'Lỗi khi lấy chi tiết hóa đơn.' });
    }
};

exports.huyHoaDon = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Cập nhật trạng thái thành 2 (Hủy)
        const updatedHoaDon = await HoadonModel.findByIdAndUpdate(
            id,
            { trangThai: 2 },
            { new: true }
        );

        if (!updatedHoaDon) {
            req.session.message = 'Không tìm thấy hóa đơn để hủy.';
            return res.redirect('/web/hoadons');
        }

        req.session.message = 'Đã hủy hóa đơn thành công.';
        res.redirect('/web/hoadons');
    } catch (error) {
        console.error('Error updating invoice:', error);
        req.session.message = 'Lỗi khi hủy hóa đơn.';
        res.redirect('/web/hoadons');
    }
};
