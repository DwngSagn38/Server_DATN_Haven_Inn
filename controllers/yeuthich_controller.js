const YeuThichModel = require('../model/yeuthichs')

exports.getListorByidNguoiDung = async (req, res, next) => {
    try {
        const { id_NguoiDung } = req.query;

        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};
        if (id_NguoiDung) {
            filter.id_NguoiDung = id_NguoiDung;
        }
        const yeuthichs = await YeuThichModel.find(filter).sort({ createdAt: -1 });

        if (yeuthichs.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy' });
        }

        res.send(yeuthichs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
}

exports.addYeuThich = async (req, res, next) => {
    try {
        const data = req.body;

        // Kiểm tra sự tồn tại của đánh giá trùng lặp
        const existingReview = await YeuThichModel.findOne({
            id_NguoiDung: data.id_NguoiDung,
            id_LoaiPhong: data.id_LoaiPhong
        });

        if (existingReview) {
            return res.json({
                status: 303,
                msg: "Loại phòng này bạn đã thêm vào yêu thích",
            });
        }

        const yeuthich = new YeuThichModel({
            id_LoaiPhong: data.id_LoaiPhong,
            id_NguoiDung: data.id_NguoiDung,
        })

        const result = await yeuthich.save();

        if (result) {
            res.json({
                status: 200,
                msg: "Đã thêm loại phòng vào yêu thích",
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

exports.suaYeuThich = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Sử dụng findByIdAndUpdate để tìm và cập nhật dữ liệu
        const result = await YeuThichModel.findByIdAndUpdate(id, data, { new: true });

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

exports.xoaYeuThich = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await YeuThichModel.findByIdAndDelete({ _id: id });
        if (result) {
            res.json({
                "status": "200",
                "msg": "Đã xóa yêu thích khỏi danh sách",
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