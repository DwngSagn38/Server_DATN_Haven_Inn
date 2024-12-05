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

                // Tính số đêm đặt phòng
                let soDem = Math.ceil(
                    (new Date(hoadon.ngayTraPhong) - new Date(hoadon.ngayNhanPhong)) /
                    (1000 * 60 * 60 * 24)
                );

                // Tìm chi tiết hóa đơn
                const chiTietHoaDons = await ChiTietHoaDonModel.find({ id_HoaDon: hoadon._id });

                if (!chiTietHoaDons.length) {
                    return { ...hoadon.toObject(), tongPhong: 0, tongKhach: 0, tongTien: 0 };
                }

                // Tính tổng số phòng, khách và tiền
                hoadon.tongPhong = chiTietHoaDons.length;
                hoadon.tongKhach = chiTietHoaDons.reduce((total, item) => total + item.soLuongKhach, 0);

                // Thêm mã hóa đơn từ 8 ký tự cuối của _id
                const maHoaDon = hoadon._id.toString().slice(-8);

                return {
                    ...hoadon.toObject(),
                    createdAt: formatDate(hoadon.createdAt),
                    ngayThanhToan: hoadon.ngayThanhToan ? formatDate(hoadon.ngayThanhToan) : '',
                    maHoaDon,
                    soDem,
                    tongTien: formatCurrencyVND(hoadon.tongTien),
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
            .populate('id_Coupon', 'maGiamGia')
            .lean();

        if (!hoadon) {
            return res.render({ error: true, message: 'Không tìm thấy hóa đơn.' });
        }

        const ngayNhanPhong = new Date(hoadon.ngayNhanPhong);
        const ngayTraPhong = new Date(hoadon.ngayTraPhong);

        if (isNaN(ngayNhanPhong.getTime()) || isNaN(ngayTraPhong.getTime())) {
            return res.status(400).json({
                error: true,
                message: "Ngày nhận hoặc ngày trả không hợp lệ.",
            });
        }

        const soDem = Math.ceil((ngayTraPhong - ngayNhanPhong) / (1000 * 60 * 60 * 24));
        if (soDem <= 0) {
            return res.status(400).json({
                error: true,
                message: "Ngày trả phòng phải sau ngày nhận phòng.",
            });
        }


        const chiTietHoaDons = await ChiTietHoaDonModel.find({ id_HoaDon: hoadon._id })
            .populate({
                path: 'id_Phong',
                select: 'soPhong id_LoaiPhong VIP',
                populate: { path: 'id_LoaiPhong', select: 'tenLoaiPhong giaTien' },
            })
            .lean();


        const ngayThanhToan = hoadon.trangThai === 1 ? formatDate(hoadon.ngayThanhToan) : ''
        console.log('ngay thanh toán : ', ngayThanhToan)
        hoadon.ngayNhanPhong = formatDate(hoadon.ngayNhanPhong);
        hoadon.ngayTraPhong = formatDate(hoadon.ngayTraPhong);
        hoadon.createdAt = formatDate(hoadon.createdAt);
        hoadon.ngayThanhToan = ngayThanhToan;

        

        console.log('====================================');
        console.log(hoadon.giamGia);
        console.log('====================================');

        // Định dạng dữ liệu trả về
        hoadon.chiTiet = chiTietHoaDons.map((ct) => ({
            soPhong: ct.id_Phong.soPhong,
            tenLoaiPhong: ct.id_Phong.id_LoaiPhong?.tenLoaiPhong || 'Không xác định',
            giaPhong: ct.giaPhong,
            VIP: ct.id_Phong.VIP,
            soLuongKhach: ct.soLuongKhach,
            tongTien: ct.tongTien,
            buaSang: ct.buaSang,
            soDem: soDem
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
