const HoTroModel = require('../model/hotros');

exports.getListorByIdUser = async (req, res, next) => {
    try {
        const { id_NguoiDung } = req.query;

        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};
        if (id_NguoiDung) {
            filter.id_NguoiDung = id_NguoiDung;
        }

        const hotros = await HoTroModel.find(filter).sort({ createdAt: -1 });

        if (hotros.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy' });
        }

        res.send(hotros);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
}

exports.addHoTro = async (req, res, next) => {
    try {
        const data = req.body;
        const hotro = new HoTroModel({
            id_NguoiDung: data.id_NguoiDung,
            vanDe: data.vanDe,
            trangThai: 0,
        })

        const result = await hotro.save();

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

exports.suaHoTro = async (req, res, next) => {
    const { id } = req.params;
    const { trangThai } = req.body;

    // Kiểm tra xem trangThai có được cung cấp trong body không
    if (trangThai == null) {
        return res.json({
            status: 400,
            msg: "Trạng thái không được cung cấp"
        });
    }

    try {
        // Chỉ cập nhật trường trangThai
        const result = await HoTroModel.findByIdAndUpdate(id, { trangThai: trangThai }, { new: true });

        if (result) {
            res.json({
                status: 200,
                msg: "Cập nhật trạng thái thành công",
                data: result
            });
        } else {
            res.json({
                status: 404,
                msg: "Không tìm thấy hỗ trợ để cập nhật"
            });
        }
    } catch (error) {
        res.json({
            status: 500,
            msg: "Có lỗi xảy ra trong quá trình cập nhật",
            error: error.message
        });
    }
}

exports.xoaHoTro = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await HoTroModel.findByIdAndDelete({ _id: id });
        if (result) {
            res.json({
                "status": "200",
                "msg": "Đã xóa hỗ trợ",
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