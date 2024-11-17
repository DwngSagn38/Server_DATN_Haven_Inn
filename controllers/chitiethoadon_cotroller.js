const ChiTietHoaDonModel = require('../model/chitiethoadons');

exports.getListorByIDHoaDon = async (req, res, next) => {
    try {
        const { id_HoaDon } = req.query;

        const filter = {};
        if (id_HoaDon) {
            filter.id_HoaDon = id_HoaDon
        }

        const chitiethoadons = await ChiTietHoaDonModel.find(filter).sort({ createdAt: -1 });

        if (chitiethoadons.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy' });
        }
        res.send(chitiethoadons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
};

exports.addChiTietHoaDon = async (req, res, next) => {
    try {
        const data = req.body;
        const id_HoaDon = data.id_HoaDon;
        if (id_HoaDon == null || id_HoaDon == undefined) {
            res.status(403).json({ msg: "Chưa tạo id hóa đơn" });
        }
        const chitiethoadon = new ChiTietHoaDonModel({
            id_Phong: data.id_Phong,
            id_HoaDon: data.id_HoaDon,
            giaPhong: data.giaPhong,
            buaSang: data.buaSang,
        })

        const result = await chitiethoadon.save();

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
};

exports.suaChiTietHoaDon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Sử dụng findByIdAndUpdate để tìm và cập nhật dữ liệu
        const result = await ChiTietHoaDonModel.findByIdAndUpdate(id, data, { new: true });

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
};

exports.xoaChiTietHoaDon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await ChiTietHoaDonModel.findByIdAndDelete({ _id: id });
        if (result) {
            res.json({
                "status": "200",
                "msg": "Đã xóa phòng khỏi hóa đơn",
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
};