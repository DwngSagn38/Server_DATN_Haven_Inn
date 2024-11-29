const AmThucModel = require('../model/amthucs');
const TienNghiModel = require('../model/tiennghis');
const PhongModel = require('../model/phongs');
const LoaiPhongModel = require('../model/loaiphongs');
const ChiTietHoaDonModel = require('../model/chitiethoadons');
const NguoiDungModel = require('../model/nguoidungs');
const HoTroModel = require('../model/hotros');
const HoadonModel = require('../model/hoadons');
const CouponModel = require('../model/coupons');
const DichVuModel = require('../model/dichvus');
const DanhGiaModel = require('../model/danhgias');
const { formatCurrencyVND } = require('./utils');

exports.getDashboardData = async (req, res, next) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Tính toán tổng số và doanh thu
        const [
            totalAmThuc,
            totalTienNghi,
            totalPhong,
            totalPhongTrong,
            totalLoaiPhong,
            totalChiTietHoaDon,
            totalNguoiDung,
            totalHoTro,
            totalHoaDon,
            totalCoupon,
            totalDichVu,
            totalDanhGia,
            hoTroChuaXuLy,
            hoaDonChuaXuLy,
            tongDoanhThuHoaDon,
            doanhThuThang
        ] = await Promise.all([
            AmThucModel.countDocuments(),
            TienNghiModel.countDocuments(),
            PhongModel.countDocuments(),
            PhongModel.countDocuments({ trangThai: 0 }),
            LoaiPhongModel.countDocuments(),
            ChiTietHoaDonModel.countDocuments(),
            NguoiDungModel.countDocuments({ chucVu: { $ne: 2 } }),
            HoTroModel.countDocuments(),
            HoadonModel.countDocuments({ trangThai: { $ne: 3 } }),
            CouponModel.countDocuments(),
            DichVuModel.countDocuments(),
            DanhGiaModel.countDocuments(),
            HoTroModel.countDocuments({ trangThai: 0 }),
            HoadonModel.countDocuments({ trangThai: 0 }),
            HoadonModel.aggregate([
                { $match: { trangThai: 1 } },
                { $group: { _id: null, total: { $sum: "$tongTien" } } }
            ]),
            HoadonModel.aggregate([
                {
                    $match: {
                        trangThai: 1,
                        ngayThanhToan: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
                    }
                },
                { $group: { _id: null, total: { $sum: "$tongTien" } } }
            ])
        ]);

        const tongDoanhThuHoaDons = tongDoanhThuHoaDon.length > 0 ? tongDoanhThuHoaDon[0].total : 0;
        const doanhThuThangs = doanhThuThang.length > 0 ? doanhThuThang[0].total : 0;

        console.log("doanh thu : ", tongDoanhThuHoaDons);
        console.log("doanh thu tháng : ", doanhThuThangs)

        const results = {
            totalAmThuc,
            totalTienNghi,
            totalPhong,
            totalPhongTrong,
            totalLoaiPhong,
            totalChiTietHoaDon,
            totalNguoiDung,
            totalHoTro,
            totalHoaDon,
            totalCoupon,
            totalDichVu,
            totalDanhGia,
            hoTroChuaXuLy,
            hoaDonChuaXuLy,
            tongDoanhThuHoaDon: formatCurrencyVND(tongDoanhThuHoaDons),
            doanhThuThang: formatCurrencyVND(doanhThuThangs)
        };

        const rawData = await getBieuDoData();
        console.log("Dữ liệu gốc từ MongoDB:", JSON.stringify(rawData, null, 2));

        const bieuDoData = processBieuDoData(rawData);

        console.log('====================================');
        console.log(bieuDoData);
        console.log('====================================');

        res.render('home', { results, bieuDoData, getTopData, message: req.flash('message') });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
        res.render('home', {
            results: {}, // Trả về object rỗng khi có lỗi
            message: 'Lỗi khi lấy dữ liệu.'
        });
    }
};


const getBieuDoData = async () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // Ngày đầu tiên của năm
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1); // Ngày đầu tiên của năm tiếp theo

    const bieuDoData = await HoadonModel.aggregate([
        {
            $match: {
                trangThai: 1, // Chỉ lấy hóa đơn đã hoàn thành
                ngayThanhToan: { $gte: startOfYear, $lt: endOfYear }, // Lọc theo năm hiện tại
            },
        },
        {
            $lookup: {
                from: "chitiethoadons", // Tên collection chi tiết hóa đơn
                localField: "_id",
                foreignField: "id_HoaDon",
                as: "chiTietHoaDon",
            },
        },
        { $unwind: "$chiTietHoaDon" }, // Tách chi tiết hóa đơn thành từng dòng
        {
            $lookup: {
                from: "phongs", // Tên collection phòng
                localField: "chiTietHoaDon.id_Phong",
                foreignField: "_id",
                as: "phong",
            },
        },
        { $unwind: "$phong" }, // Tách thông tin phòng
        {
            $lookup: {
                from: "loaiphongs", // Tên collection loại phòng
                localField: "phong.id_LoaiPhong",
                foreignField: "_id",
                as: "loaiPhong",
            },
        },
        { $unwind: "$loaiPhong" }, // Tách thông tin loại phòng
        {
            $group: {
                _id: {
                    month: { $month: "$ngayThanhToan" }, // Gom nhóm theo tháng
                    loaiPhong: "$loaiPhong.tenLoaiPhong", // Gom nhóm theo tên loại phòng
                },
                doanhThu: { $sum: "$chiTietHoaDon.giaPhong" }, // Tính tổng doanh thu
                soLuotDat: { $sum: 1 }, // Tính tổng lượt đặt
            },
        },
        {
            $sort: { "_id.month": 1 }, // Sắp xếp theo tháng tăng dần
        },
    ]);

    console.log("Kết quả sau $group:", JSON.stringify(bieuDoData, null, 2));

    return bieuDoData;
};

const processBieuDoData = (bieuDoData) => {
    const processedData = {};

    bieuDoData.forEach((item) => {
        const { month, loaiPhong } = item._id;
        if (!processedData[loaiPhong]) {
            processedData[loaiPhong] = Array(12).fill(0); // Mỗi loại phòng có 12 tháng
        }
        processedData[loaiPhong][month - 1] = item.doanhThu; // Lưu doanh thu vào đúng tháng
    });

    return processedData;
};





// Ví dụ phương thức lấy dữ liệu top sản phẩm
async function getTopData() {
    // Lấy top dữ liệu (ví dụ top 5 sản phẩm)
    const topData = await PhongModel.find().limit(5).sort({ sales: -1 });
    return topData;
}
