const PhongModel = require('../model/phongs');
const LoaiPhongModel = require('../model/loaiphongs');
const ChiTietHoaDonModel = require('../model/chitiethoadons')

exports.getListorByIdorIdPhong = async (req, res, next) => {
    try {
        const { id_LoaiPhong, id } = req.query;

        let filter = {};
        if (id) {
            filter._id = id
        }
        if (id_LoaiPhong) {
            filter.id_LoaiPhong = id_LoaiPhong
        } else {

        }
        const phongs = await PhongModel.find(filter).sort({ createdAt: -1 });

        if (phongs.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy' });
        }

        res.send(phongs);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
}

exports.addPhong = async (req, res, next) => {
    try {
        const data = req.body;
        const loaiphong = await LoaiPhongModel.findById(data.id_LoaiPhong);
        if(!loaiphong){
            return res.send({message : "Khong tim thay loai phong"})
        }

        const phong = new PhongModel({
            soPhong: data.soPhong,
            id_LoaiPhong: data.id_LoaiPhong,
            VIP: data.VIP,
            trangThai: data.trangThai,
        })

        const result = await phong.save();

        if (result) {
            res.json({
                status: 200,
                msg: "Add success",
                data: result
            })
        } else {
            res.json({
                status: 400,
                msg: "Add fail",
                data: []
            })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
}

exports.suaPhong = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Sử dụng findByIdAndUpdate để tìm và cập nhật dữ liệu
        const result = await PhongModel.findByIdAndUpdate(id, data, { new: true });

        if (result) {
            res.json({
                status: 200,
                msg: "Update success",
                data: result
            })
        } else {
            res.json({
                status: 400,
                msg: "Update fail",
                data: []
            })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
}

exports.xoaPhong = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await PhongModel.deleteOne({ _id: id });
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

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
}

exports.getCheck = async (req, res, next) => {
    try {
        const { id_LoaiPhong, ngayNhanPhong } = req.query;

        // Kiểm tra điều kiện ngày nhận phòng
        if (!ngayNhanPhong) {
            return res.status(400).json({ message: "Cần cung cấp ngày nhận phòng." });
        }

        // Đảm bảo ngày tháng đúng định dạng
        const ngayNhan = new Date(ngayNhanPhong);

        // Tạo bộ lọc cho loại phòng nếu có
        let filter = {};
        if (id_LoaiPhong) {
            filter.id_LoaiPhong = id_LoaiPhong;
        }

        // Lấy danh sách phòng dựa trên bộ lọc
        const phongs = await PhongModel.find(filter).sort({ createdAt: -1 });

        if (phongs.length === 0) {
            return res.status(404).send({ message: "Không tìm thấy phòng." });
        }

        // Kiểm tra trạng thái của từng phòng
        const updatedPhongs = await Promise.all(
            phongs.map(async (phong) => {
                // Kiểm tra nếu phòng này có trong chi tiết hóa đơn và ngày nhận phòng nằm trong khoảng ngày hóa đơn
                const isBooked = await ChiTietHoaDonModel.exists({
                    id_Phong: phong._id,
                    id_HoaDon: { 
                        $exists: true, 
                        $ne: null, // Đảm bảo hóa đơn tồn tại
                    },
                    $expr: {
                        $and: [
                            // Kiểm tra nếu ngày nhận phòng của hóa đơn nằm trong khoảng ngày nhận và ngày trả của hóa đơn
                            { $lte: ["$ngayNhanPhong", ngayNhan] }, // ngày nhận hóa đơn phải trước hoặc bằng ngày nhận phòng
                            { $gte: ["$ngayTraPhong", ngayNhan] },  // ngày trả hóa đơn phải sau hoặc bằng ngày nhận phòng
                        ],
                    },
                });

                return {
                    ...phong.toObject(),
                    trangThai: isBooked ? 1 : 0, // Trạng thái 1 nếu đã được đặt trong khoảng thời gian, ngược lại là 0
                };
            })
        );

        // Trả về kết quả
        res.send(updatedPhongs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách phòng.", error: error.message });
    }
};



