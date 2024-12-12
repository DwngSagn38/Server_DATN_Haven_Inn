const HoadonModel = require('../model/hoadons');
const ChiTietHoaDonModel = require('../model/chitiethoadons');
const CouponModel = require('../model/coupons')
const PhongModel = require('../model/phongs')
const User = require('../model/nguoidungs')
const { formatCurrencyVND, formatDate } = require('./utils');
const socket = require('../socket');
const ThongBaoModel = require('../model/thongbaos');
const { sendFirebaseNotification } = require('./utils');

exports.getListorByIdUserorStatus = async (req, res, next) => {
    try {
        const { id_NguoiDung, trangThai } = req.query;

        // Xây dựng điều kiện lọc
        let filter = {};
        if (id_NguoiDung) {
            filter.id_NguoiDung = id_NguoiDung;
        }

        // Lọc theo trạng thái hóa đơn nếu có
        if (trangThai !== undefined && trangThai !== '') {
            filter.trangThai = parseInt(trangThai, 10); // Đảm bảo giá trị là số
        }

        // Lấy danh sách hóa đơn theo điều kiện
        const hoadons = await HoadonModel.find(filter)
            .populate('id_NguoiDung', 'tenNguoiDung')
            .sort({ createdAt: -1 });

        if (hoadons.length === 0) {
            res.render('../views/hoadon/hoadons', {
                hoadons: [],
                trangThai: trangThai || '', // Truyền trạng thái vào view
                message: 'Không tìm thấy hóa đơn nào.',
            });
            return;
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

        res.render('../views/hoadon/hoadons', {
            hoadons: results,
            trangThai: trangThai || '', // Duy trì trạng thái lọc
            message,
        });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.render('../views/hoadon/hoadons', {
            hoadons: [],
            trangThai: trangThai || '', // Truyền trạng thái vào view ngay cả khi lỗi
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


        const ngayThanhToan = hoadon.ngayThanhToan ? formatDate(hoadon.ngayThanhToan) : ''
        console.log('ngay thanh toán : ', ngayThanhToan)
        hoadon.ngayNhanPhong = formatDate(hoadon.ngayNhanPhong);
        hoadon.ngayTraPhong = formatDate(hoadon.ngayTraPhong);
        hoadon.createdAt = formatDate(hoadon.createdAt);
        hoadon.ngayThanhToan = ngayThanhToan;


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

// Hàm cập nhật trạng thái hóa đơn và đồng bộ trạng thái phòng
exports.updateTrangThai = async (req, res) => {
    try {
        const { id } = req.params;
        const { trangThai } = req.body;

        // Ép kiểu để đảm bảo `trangThai` là số
        const newTrangThai = parseInt(trangThai, 10);
        if (isNaN(newTrangThai)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
        }

        const hoadon = await HoadonModel.findById(id);

        // Lấy hóa đơn hiện tại
        const chiTiets = await ChiTietHoaDonModel.find({ id_HoaDon: id }).populate('id_Phong', 'trangThai');
        if (!chiTiets) {
            return res.status(404).json({ success: false, message: 'Chi tiết hóa đơn không tồn tại.' });
        }

        // Kiểm tra logic trạng thái hợp lệ
        const validTransitions = {
            1: [0, 2], // "Đã thanh toán" -> "Nhận phòng" hoặc "Hủy"
            0: [3],    // "Đã nhận phòng" -> "Đã trả phòng"
        };

        if (
            validTransitions[hoadon.trangThai] &&
            !validTransitions[hoadon.trangThai].includes(newTrangThai)
        ) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ để cập nhật.' });
        }

        // Cập nhật trạng thái hóa đơn
        hoadon.trangThai = newTrangThai;
        await hoadon.save();

        // Cập nhật trạng thái phòng dựa trên trạng thái hóa đơn mới
        const updatePhongStatus = async (status) => {
            await Promise.all(
                chiTiets.map(async (item) => {
                    await PhongModel.updateOne(
                        { _id: item.id_Phong },
                        { trangThai: status }
                    );
                })
            );
        };

        if (newTrangThai === 0) {
            // "Nhận phòng" -> Cập nhật trạng thái phòng thành 1 (khách đã nhận)
            await updatePhongStatus(1);
        } else if (newTrangThai === 2) {
            // "Hủy" -> Cập nhật trạng thái phòng thành 0 (còn trống)
            await updatePhongStatus(0);
        } else if (newTrangThai === 3) {
            // "Trả phòng" -> Cập nhật trạng thái phòng thành 3 (đang dọn dẹp)
            await updatePhongStatus(3);

            // Sau 15 phút, cập nhật trạng thái phòng thành 0 (còn trống)
            setTimeout(async () => {
                try {
                    await updatePhongStatus(0);
                } catch (error) {
                    console.error('Lỗi khi cập nhật trạng thái sau 15 phút:', error.message);
                }
            }, 1 * 60 * 1000); // 15 phút
        }

        // Thêm mã hóa đơn từ 8 ký tự cuối của _id
        const maHoaDon = hoadon._id.toString().slice(-8);

        const io = socket.getIO();
        const sockets = await io.in(hoadon.id_NguoiDung).fetchSockets();

        if (newTrangThai === 2) {
            // Tạo thông báo mới
            const thongBaoData = new ThongBaoModel({
                id_NguoiDung: hoadon.id_NguoiDung,
                tieuDe: 'Đơn đặt phòng của bạn đã bị hủy!',
                noiDung: `Mã hóa đơn : ${maHoaDon} - Tổng tiền : ${formatCurrencyVND(hoadon.tongTien)} VND,
Bạn vui lòng liên hệ với chúng tôi qua hotline 0367.974.725 để được hỗ trợ hoàn trả lại tiền đặt phòng!`,
                ngayGui: new Date(),
            });

            await thongBaoData.save();

            if (sockets.length > 0) {
                // Gửi thông báo qua Socket.IO nếu người dùng online
                io.to(hoadon.id_NguoiDung).emit('new-notification', {
                    id_NguoiDung: hoadon.id_NguoiDung,
                    message: `Đơn đặt phòng ${maHoaDon} của bạn đã bị hủy!`,
                    type: 'success',
                    thongBaoData,
                });
            } else {
                // Gửi thông báo qua Firebase nếu người dùng offline
                const user = await User.findById(hoadon.id_NguoiDung);
                if (user && user.deviceToken) {
                    await sendFirebaseNotification(
                        user.deviceToken,
                        'Đơn đặt phòng của bạn đã bị hủy!',
                        `Mã hóa đơn : ${maHoaDon} - Tổng tiền : ${formatCurrencyVND(hoadon.tongTien)} VND,
Bạn vui lòng liên hệ với chúng tôi qua hotline 0367.974.725 để được hỗ trợ hoàn trả lại tiền đặt phòng!`,
                        { voucherId: id }
                    );
                }
            }
        }

        if (newTrangThai === 0) {
            // Tạo thông báo mới
            const thongBaoData = new ThongBaoModel({
                id_NguoiDung: hoadon.id_NguoiDung,
                tieuDe: 'Nhận phòng thành công!',
                noiDung: `Bạn vừa nhận phòng tại Haven Inn.`,
                ngayGui: new Date(),
            });

            await thongBaoData.save();

            if (sockets.length > 0) {
                // Gửi thông báo qua Socket.IO nếu người dùng online
                io.to(hoadon.id_NguoiDung).emit('new-notification', {
                    id_NguoiDung: hoadon.id_NguoiDung,
                    message: `Nhận phòng thành công!`,
                    type: 'success',
                    thongBaoData,
                });
            } else {
                // Gửi thông báo qua Firebase nếu người dùng offline
                const user = await User.findById(hoadon.id_NguoiDung);
                if (user && user.deviceToken) {
                    await sendFirebaseNotification(
                        user.deviceToken,
                        'Nhận phòng thành công!',
                        `Bạn vừa nhận phòng tại Haven Inn.`,
                        { voucherId: id }
                    );
                }
            }
        }

        if (newTrangThai === 3) {
            // Tạo thông báo mới
            const thongBaoData = new ThongBaoModel({
                id_NguoiDung: hoadon.id_NguoiDung,
                tieuDe: 'Trả phòng thành công!',
                noiDung: `Bạn vừa trả phòng tại Haven Inn.`,
                ngayGui: new Date(),
            });

            await thongBaoData.save();

            if (sockets.length > 0) {
                // Gửi thông báo qua Socket.IO nếu người dùng online
                io.to(hoadon.id_NguoiDung).emit('new-notification', {
                    id_NguoiDung: hoadon.id_NguoiDung,
                    message: `Trả phòng thành công!`,
                    type: 'success',
                    thongBaoData,
                });
            } else {
                // Gửi thông báo qua Firebase nếu người dùng offline
                const user = await User.findById(hoadon.id_NguoiDung);
                if (user && user.deviceToken) {
                    await sendFirebaseNotification(
                        user.deviceToken,
                        'Trả phòng thành công!',
                        `Bạn vừa trả phòng tại Haven Inn.`,
                        { voucherId: id }
                    );
                }
            }
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công.',
            hoadon,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống.', error: error.message });
    }
};


