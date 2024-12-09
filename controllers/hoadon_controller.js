const HoadonModel = require('../model/hoadons');
const ChiTietHoaDonModel = require('../model/chitiethoadons')
const CouponModel = require('../model/coupons');
const NguoiDungCouponModel = require('../model/nguoidungcoupons');
const { formatDate } = require('./utils');
const ThongBaoModel = require('../model/thongbaos');
const socket = require('../socket');
const { default: mongoose } = require('mongoose');
const moment = require('moment');

exports.getListorByIdUserorStatus = async (req, res, next) => {
    try {
        const { id, id_NguoiDung, trangThai } = req.query;

        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};

        if (id) {
            filter._id = id;
        }
        if (id_NguoiDung) {
            filter.id_NguoiDung = id_NguoiDung;
        }
        // Lọc theo `trangThai` nếu có, nhưng kiểm tra trạng thái khác 3
        if (trangThai) {
            const trangThaiInt = parseInt(trangThai, 10); // Đảm bảo kiểu số
            if (trangThaiInt === 3) {
                return res.status(404).send({ message: 'Lỗi' });
            } else {
                filter.trangThai = trangThaiInt; // Lọc chính xác trạng thái được yêu cầu
            }
        } else {
            // Mặc định lấy tất cả hóa đơn có trạng thái khác 3
            filter.trangThai = { $ne: 3 }; // MongoDB operator để kiểm tra "khác"
        }

        // Tìm hóa đơn theo điều kiện lọc
        const hoadons = await HoadonModel.find(filter).sort({ createdAt: -1 });

        if (hoadons.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy hóa đơn' });
        }

        // Lặp qua từng hóa đơn và lấy chi tiết
        const results = [];
        for (let hoadon of hoadons) {
            // Lấy chi tiết hóa đơn liên quan đến id_HoaDon
            const chiTietHoaDons = await ChiTietHoaDonModel.find({ id_HoaDon: hoadon._id });

            if (chiTietHoaDons.length > 0) {
                // Tổng số phòng là số lượng phòng trong chi tiết hóa đơn
                hoadon.tongPhong = chiTietHoaDons.length;

                // Tổng số khách là tổng soLuongKhach trong chi tiết hóa đơn
                hoadon.tongKhach = chiTietHoaDons.reduce((total, item) => total + item.soLuongKhach, 0);

                hoadon.ngayThanhToan = hoadon.trangThai === 1 ? formatDate(hoadon.updatedAt) : ''

                // Cập nhật vào hóa đơn
                results.push({
                    ...hoadon.toObject(),
                    chitiet: chiTietHoaDons
                });
            }
        }

        // Trả về kết quả
        res.send(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};


exports.addHoaDon = async (req, res, next) => {
    try {
        // Lấy các thông tin cần thiết từ body
        const { ...hoaDonData } = req.body;

        if (!hoaDonData.chiTiet || !Array.isArray(hoaDonData.chiTiet) || hoaDonData.chiTiet.length === 0) {
            return res.status(400).json({
                message: "Dữ liệu chi tiết hóa đơn không hợp lệ.",
            });
        }

        // Định dạng ngày
        const ngayNhanPhong = moment(hoaDonData.ngayNhanPhong, "DD/MM/YYYY").format("YYYY-MM-DD");
        const ngayTraPhong = moment(hoaDonData.ngayTraPhong, "DD/MM/YYYY").format("YYYY-MM-DD");

        // Chuyển đổi ngày thành đối tượng Date nếu cần tính toán
        const ngayNhanPhongDate = new Date(ngayNhanPhong);
        const ngayTraPhongDate = new Date(ngayTraPhong);

        // Tính số đêm
        const soDem = Math.max(1, (ngayTraPhongDate - ngayNhanPhongDate) / (1000 * 60 * 60 * 24));

        // Tính tổng tiền từ chi tiết hóa đơn
        const chiTietHoaDon = hoaDonData.chiTiet.map(item => ({
            id_Phong: item.id_Phong,
            id_HoaDon: null,
            soLuongKhach: item.soLuongKhach,
            giaPhong: item.giaPhong,
            buaSang: item.buaSang,
        }));

        // Kiểm tra mã giảm giá
        // let soTienGiam = 0; // Biến lưu số tiền được giảm
        // if (hoaDonData.id_Coupon !== "" && mongoose.Types.ObjectId.isValid(hoaDonData.id_Coupon)) {
        //     const couponData = await NguoiDungCouponModel.findOne({
        //         id_Coupon: hoaDonData.id_Coupon,
        //         id_NguoiDung: hoaDonData.id_NguoiDung,
        //         trangThai: true,
        //     })
        //         .populate('id_Coupon', 'giamGia giamGiaToiDa dieuKienToiThieu')
        //         .lean();

        //     if (couponData && couponData.id_Coupon) {
        //         const coupon = couponData.id_Coupon;
        //         if (hoaDonData.tongTien >= coupon.dieuKienToiThieu) {
        //             soTienGiam = hoaDonData.tongTien * coupon.giamGia;
        //             if (coupon.giamGiaToiDa) {
        //                 soTienGiam = Math.min(soTienGiam, coupon.giamGiaToiDa);
        //             }
        //             hoaDonData.tongTien -= soTienGiam;

        //             // Cập nhật trạng thái mã giảm giá
        //             await NguoiDungCouponModel.updateOne(
        //                 { _id: couponData._id },
        //                 { trangThai: false }
        //             );
        //         }
        //     }
        // }

        let id_Coupon = hoaDonData.id_Coupon;
        console.log('idcoupon :', id_Coupon)
        
        if(id_Coupon !== ""){

            await NguoiDungCouponModel.updateOne(
                { _id: id_Coupon },
                { trangThai: false }
            );
        }else{
            id_Coupon = null
        }


        // Tạo hóa đơn
        const hoadon = new HoadonModel({
            ...hoaDonData,
            id_Coupon : id_Coupon,
            ngayNhanPhong, // Lưu ngày định dạng yyyy/MM/dd vào DB
            ngayTraPhong,
        });

        const result = await hoadon.save();

        // Gắn ID hóa đơn vào chi tiết hóa đơn và lưu chi tiết
        chiTietHoaDon.forEach(item => (item.id_HoaDon = hoadon._id));
        await ChiTietHoaDonModel.insertMany(chiTietHoaDon);

        if (result) {
            const thongBaoData = new ThongBaoModel({
                id_NguoiDung: hoaDonData.id_NguoiDung,
                tieuDe: "Bạn vừa đặt phòng thành công!",
                noiDung: `Thông tin :
  - Mã hóa đơn : ${hoadon._id},
  - Số phòng : ${hoaDonData.chiTiet?.id_Phong?.soPhong}
  - Tổng tiền : ${hoadon.tongTien}`,
                ngayGui: new Date(),
            });

            await thongBaoData.save();

            const io = socket.getIO(); // Lấy đối tượng io từ socket.js

            // Gửi thông báo đến phòng của người dùng
            io.to(hoaDonData.id_NguoiDung).emit('new-notification', {
                id_NguoiDung: hoaDonData.id_NguoiDung,
                message: "Bạn vừa đặt phòng thành công!",
                type: "success",
                thongBaoData,
            });

            res.json({
                status: 200,
                message: "Tạo hóa đơn thành công.",
                data: {
                    hoaDonId: hoadon._id,
                },
            });
        } else {
            res.json({
                status: 400,
                message: "Thêm hóa đơn thất bại.",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi tạo hóa đơn.", error: error.message });
    }
};


exports.suaHoaDon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { trangThai, id_Coupon } = req.body;

        const hoadon = await HoadonModel.findById(id);

        if (!hoadon) {
            return res.status(404).json({
                status: 404,
                msg: "Không tìm thấy hóa đơn!",
                data: []
            });
        }

        const chiTietHoaDons = await ChiTietHoaDonModel.find({ id_HoaDon: id });

        const ngayThanhToan = trangThai === 1 ? formatDate(new Date()) : '';

        if (chiTietHoaDons.length > 0) {
            // Tính toán các giá trị cần cập nhật
            const tongPhong = chiTietHoaDons.length;
            const tongKhach = chiTietHoaDons.reduce((total, item) => total + item.soLuongKhach, 0);
            let tongTien = chiTietHoaDons.reduce((total, item) => total + item.tongTien, 0);

            // Nếu có mã giảm giá
            let giamGia = 0;
            if (id_Coupon) {
                const coupon = await CouponModel.findById(id_Coupon).lean();
                if (coupon) {
                    let soTienGiam = tongTien * coupon.giamGia;
                    if (coupon.giamGiaToiDa) {
                        soTienGiam = Math.min(soTienGiam, coupon.giamGiaToiDa);
                    }
                    tongTien -= soTienGiam;
                    giamGia = soTienGiam;

                    // Cập nhật trạng thái mã giảm giá
                    await CouponModel.findByIdAndUpdate(id_Coupon, { trangThai: 1 }); // 1: đã sử dụng
                }
            }

            // Cập nhật hóa đơn
            const updatedHoadon = await HoadonModel.findByIdAndUpdate(
                id,
                {
                    ...req.body,
                    trangThai,
                    tongPhong,
                    tongKhach,
                    tongTien,
                    id_Coupon,
                    giamGia,
                },
                { new: true }
            );

            return res.json({
                status: 200,
                msg: "Update success",
                data: updatedHoadon,
            });
        } else {
            return res.status(400).json({
                status: 400,
                msg: "Không có chi tiết hóa đơn để cập nhật!",
                data: [],
            });
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật hóa đơn:", error);
        res.status(500).json({ message: "Error updating data", error: error.message });
    }
};


exports.xoaHoaDon = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (id != null && id != undefined) {
            const result = await HoadonModel.findByIdAndDelete(id);
            if (result) {
                res.json({
                    "status": "200",
                    "msg": "Delete success",
                    "data": result
                })
            } else {
                res.json({
                    "status": "400",
                    "msg": "Delete fail",
                    "data": []
                })
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
}

exports.getLichSuDatPhong = async (req, res, next) => {
    try {
        const { id, id_NguoiDung, trangThai } = req.query;

        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};

        if (id) {
            filter._id = id;
        }
        if (id_NguoiDung) {
            filter.id_NguoiDung = id_NguoiDung;
        }
        // Lọc theo `trangThai` nếu có, nhưng kiểm tra trạng thái khác 3
        if (trangThai) {
            const trangThaiInt = parseInt(trangThai, 10); // Đảm bảo kiểu số
            if (trangThaiInt === 3) {
                return res.status(404).send({ message: 'Lỗi' });
            } else {
                filter.trangThai = trangThaiInt; // Lọc chính xác trạng thái được yêu cầu
            }
        } else {
            // Mặc định lấy tất cả hóa đơn có trạng thái khác 3
            filter.trangThai = { $ne: 3 }; // MongoDB operator để kiểm tra "khác"
        }

        // Tìm hóa đơn theo điều kiện lọc
        const hoadons = await HoadonModel.find(filter).sort({ createdAt: -1 });

        if (hoadons.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy hóa đơn' });
        }

        // Lặp qua từng hóa đơn và lấy chi tiết
        const results = [];
        for (let hoadon of hoadons) {
            // Lấy chi tiết hóa đơn liên quan đến id_HoaDon
            const chiTietHoaDons = await ChiTietHoaDonModel.find({ id_HoaDon: hoadon._id })
                .populate({
                    path: 'id_Phong',
                    select: 'soPhong id_LoaiPhong', // Lấy số phòng và loại phòng
                    populate: {
                        path: 'id_LoaiPhong',
                        select: 'tenLoaiPhong hinhAnh', // Lấy tên loại phòng
                    },
                })
                .lean();

            if (chiTietHoaDons.length > 0) {
                // Thêm chi tiết hóa đơn đã liên kết loại phòng và số phòng vào kết quả
                results.push({
                    ...hoadon.toObject(),
                    chitiet: chiTietHoaDons.map((chitiet) => ({
                        ...chitiet,
                        soPhong: chitiet.id_Phong?.soPhong || null,
                        tenLoaiPhong: chitiet.id_Phong?.id_LoaiPhong?.tenLoaiPhong || null,
                        hinhAnh: chitiet.id_Phong?.id_LoaiPhong?.hinhAnh || null,
                    })),
                });
            }
        }

        // Trả về kết quả
        res.send(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};
