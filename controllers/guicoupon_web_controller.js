const Coupon = require('../model/coupons'); // Mô hình Coupon
const User = require('../model/nguoidungs'); // Mô hình Người dùng
const NguoiDungCoupon = require('../model/nguoidungcoupons'); // Mô hình Liên kết Người dùng và Coupon

// Hiển thị danh sách voucher
const listVouchers = async (req, res) => {
    try {
        const vouchers = await Coupon.find(); // Lấy tất cả voucher
        res.render('guivoucher/danhsachvouchers.ejs', { vouchers, message: 'Có lỗi xảy ra' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
};

// Hiển thị trang gửi voucher cho người dùng

const sendVoucherPage = async (req, res) => {
    try {
        const voucherId = req.params.id; // Lấy ID voucher từ URL
        const voucher = await Coupon.findById(voucherId); // Tìm voucher theo ID

        if (!voucher) {
            return res.status(404).send('Voucher không tồn tại');
        }

        // Lấy danh sách ID người dùng đã có voucher này
        const userIdsWithVoucher = await NguoiDungCoupon.find({ id_Coupon: voucherId }).select('id_NguoiDung');

        // Lấy danh sách người dùng chưa nhận voucher
        const users = await User.find({
            _id: { $nin: userIdsWithVoucher.map(record => record.id_NguoiDung) },
            trangThai: true, // Chỉ lấy người dùng đang hoạt động
            chucVu: 0 // Chỉ lấy người dùng thường (không phải admin)
        });

        res.render('guivoucher/guivouchers', { voucher, users, message: null });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi lấy thông tin voucher và người dùng');
    }
};


const sendVoucherToUsers = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID voucher từ URL
        const userIds = Array.isArray(req.body.userIds) ? req.body.userIds : [req.body.userIds];

        // Kiểm tra danh sách người dùng
        if (!userIds || userIds.length === 0 || userIds[0] === '') {
            return res.status(400).send('Chưa chọn người dùng nào.');
        }

        // Kiểm tra voucher
        const voucher = await Coupon.findById(id);
        if (!voucher) {
            return res.status(404).send('Voucher không tồn tại.');
        }

        // Gửi voucher cho từng người dùng
        const sendPromises = userIds.map(async (userId) => {
            // Kiểm tra xem người dùng đã được gửi voucher này chưa
            const existingRecord = await NguoiDungCoupon.findOne({
                id_NguoiDung: userId,
                id_Coupon: id,
            });

            if (!existingRecord) {
                // Tạo bản ghi mới nếu chưa tồn tại
                return NguoiDungCoupon.create({
                    id_NguoiDung: userId,
                    id_Coupon: id,
                    trangThai: true, // Chưa sử dụng
                });
            }
        });

        await Promise.all(sendPromises);

        res.redirect('/web/guivouchers'); // Quay lại danh sách voucher
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi server.');
    }
};

const searchUsersForVoucher = async (req, res) => {
    try {
        const voucherId = req.params.id;
        const searchQuery = req.query.q || ''; // Lấy từ khóa tìm kiếm

        const voucher = await Coupon.findById(voucherId);
        if (!voucher) {
            return res.status(404).send('Voucher không tồn tại');
        }

        // Lấy danh sách ID người dùng đã có voucher
        const userIdsWithVoucher = await NguoiDungCoupon.find({ id_Coupon: voucherId }).select('id_NguoiDung');

        // Tìm kiếm người dùng chưa có voucher và phù hợp với từ khóa
        const users = await User.find({
            _id: { $nin: userIdsWithVoucher.map(record => record.id_NguoiDung) },
            trangThai: true,
            chucVu: 0,
            $or: [
                { tenNguoiDung: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ]
        });

        res.render('guivoucher/guivouchers', { voucher, users, message: null });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi tìm kiếm người dùng');
    }
};


module.exports = { listVouchers, sendVoucherPage, sendVoucherToUsers, searchUsersForVoucher };
