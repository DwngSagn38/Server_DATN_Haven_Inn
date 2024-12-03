const HoadonModel = require('../model/hoadons');
const ChiTietHoaDonModel = require('../model/chitiethoadons')
const CouponModel = require('../model/coupons');
const { formatDate } = require('./utils');

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

                hoadon.tongTien = chiTietHoaDons.reduce((total, item) => total + item.giaPhong, 0);
                hoadon.ngayThanhToan = hoadon.trangThai === 1 ? formatDate(hoadon.updatedAt) : ''

                // Kiểm tra mã giảm giá
                if (hoadon.id_Coupon) {
                    const coupon = await CouponModel.findById(hoadon.id_Coupon).lean();

                    // Tính giảm giá
                    let soTienGiam = hoadon.tongTien * coupon.giamGia;
                    if (coupon.giamGiaToiDa) {
                        soTienGiam = Math.min(soTienGiam, coupon.giamGiaToiDa);
                    }

                    // Áp dụng giảm giá vào tổng tiền
                    hoadon.tongTien -= soTienGiam;


                    // Cập nhật trạng thái mã giảm giá (nếu cần)
                    await CouponModel.findByIdAndUpdate(hoadon.id_Coupon, { trangThai: 1 }); // 1: đã sử dụng
                } else {
                    hoadon.giamGia = 0; // Không có mã giảm giá
                }
                // Cập nhật vào hóa đơn
                results.push({
                    ...hoadon.toObject(),
                    ngayThanhToan: hoadon.ngayThanhToan
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
        const { chiTiet, ...hoaDonData } = req.body;

        console.log("Chi tiết hóa đơn : ",req.body)
        // Kiểm tra chi tiết hóa đơn
        if (!chiTiet || !Array.isArray(chiTiet) || chiTiet.length === 0) {
            return res.status(400).json({
                message: "Dữ liệu chi tiết hóa đơn không hợp lệ.",
            });
        }

        // Tính tổng tiền dựa trên chi tiết hóa đơn
        let tongTien = 0;
        const ngayNhanPhong = new Date(hoaDonData.ngayNhanPhong);
        const ngayTraPhong = new Date(hoaDonData.ngayTraPhong);

        const soDem = Math.max(1, (ngayTraPhong - ngayNhanPhong) / (1000 * 60 * 60 * 24)); // Ít nhất là 1 đêm

        // Tính tổng tiền từ chi tiết hóa đơn
        const chiTietHoaDon = chiTiet.map(item => {
            const tienPhong = item.giaPhong * soDem;
            tongTien += tienPhong; // Cộng dồn vào tổng tiền
            return {
                id_Phong: item.idPhong,
                id_HoaDon: null, // Sẽ gán sau khi hóa đơn được tạo
                soLuongKhach: item.soLuongKhach,
                giaPhong: item.giaPhong,
                buaSang: item.buaSang,
                tongTien: tienPhong // Lưu tổng tiền của từng phòng
            };
        });

        // Tạo hóa đơn với tổng tiền
        const hoadon = new HoadonModel({
            ...hoaDonData,
            tongTien // Lưu tổng tiền vào hóa đơn
        });

        const result = await hoadon.save();

        // Gắn ID của hóa đơn vào chi tiết hóa đơn và lưu chi tiết
        chiTietHoaDon.forEach(item => (item.id_HoaDon = hoadon._id));
        await ChiTietHoaDonModel.insertMany(chiTietHoaDon);

        if (result) {
            res.json({
                status: 200,
                message: "Tạo hóa đơn thành công",
                data: hoadon._id
            });
        } else {
            res.json({
                status: 400,
                message: "Thêm hóa đơn thất bại",
                data: []
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi tạo hóa đơn", error: error.message });
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