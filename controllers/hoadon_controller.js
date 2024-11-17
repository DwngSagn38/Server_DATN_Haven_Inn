const HoadonModel = require('../model/hoadons');

exports.getListorByIdUserorStatus = async (req, res, next) => {
    try {
        const { id_NguoiDung, trangThai } = req.query;

        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};
        if (id_NguoiDung) {
            filter.id_NguoiDung = id_NguoiDung;
        }
        if (trangThai) {
            filter.trangThai = trangThai;
        }

        const hoadons = await HoadonModel.find(filter).sort({ createdAt: -1 });

        if (hoadons.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy' });
        }
        res.send(hoadons)

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
}

exports.addHoaDon = async (req, res, next) => {
    try {
        const hoadon = new HoadonModel({
            ...req.body
        })

        const result = await hoadon.save();

        if (result) {
            res.json({
                status: 200,
                message: "Add success",
                data: result
            })
        } else {
            res.json({
                status: 400,
                message: "Add fail",
                data: []
            })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
}

exports.suaHoaDon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Sử dụng findByIdAndUpdate để tìm và cập nhật dữ liệu
        const result = await HoadonModel.findByIdAndUpdate(id, data, { new: true });

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