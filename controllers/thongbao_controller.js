const ThongBaoModel = require('../model/thongbaos')

exports.getListorByidNguoiDung = async (req, res, next) => {
    try {
        const { id_NguoiDung } = req.query;

        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};
        if (id_NguoiDung) {
            filter.id_NguoiDung = id_NguoiDung;
        }
        const thongbaos = await ThongBaoModel.find(filter).sort({ createdAt: -1 });

        if (thongbaos.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy' });
        }

        res.send(thongbaos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
}

exports.addThongBao = async (req, res, next) => {
    try {
        const data = req.body;
        const thongbao = new ThongBaoModel({
            id_NguoiDung: data.id_NguoiDung,
            tieuDe: data.tieuDe,
            noiDung: data.noiDung,
            ngayGui: data.ngayGui,
            trangThai: true,
        })

        const result = await thongbao.save();

        if (result) {
            res.json({
                status: 200,
                msg: "Thêm thông báo thàn công",
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

exports.suaThongBao = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Sử dụng findByIdAndUpdate để tìm và cập nhật dữ liệu
        const result = await ThongBaoModel.findByIdAndUpdate(id, data, { new: true });

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

exports.xoaThongBao = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await ThongBaoModel.findByIdAndDelete({ _id: id });
        if (result) {
            res.json({
                "status": "200",
                "msg": "Đã xóa thông báo",
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