const TienNghiPhongModel = require('../model/tiennghiphongs')

exports.getListorByIDLoaiPhong = async (req, res, next) => {
    try {
        const { id_LoaiPhong } = req.query;

        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};
        if (id_LoaiPhong) {
            filter.id_LoaiPhong = id_LoaiPhong;
        }

        const tienNghiPhongs = await TienNghiPhongModel.find(filter);
        
        if (tienNghiPhongs.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy' });
        }        

        res.send(tienNghiPhongs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Error fetching data", error: error.message });
    }
};

exports.addTienNghiPhong = async ( req, res, next ) => {
    try {
        const data = req.body;
        
        const tiennghiphong = new TienNghiPhongModel({
            id_TienNghi: data.id_TienNghi,
            id_LoaiPhong: data.id_LoaiPhong,
            moTa : data.moTa
        });

        const result = await tiennghiphong.save();

        if (result) {
            res.json({
                status: 200,
                msg: "Thêm tiện nghi thành công",
                data: result
            });
        } else {
            res.status(400).json({
                status: 400,
                msg: "Thêm tiện nghi thất bại",
                data: []
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            msg: "Lỗi khi thêm tiện nghi phòng",
            error: error.message
        });
    }
}

exports.suaTienNghiPhong = async ( req, res, next ) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const result = await TienNghiPhongModel.findByIdAndUpdate(id, data, { new : true })

        if (result) {
            res.json({
                status: 200,
                msg: "Sua tiện nghi phong thành công",
                data: result
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            msg: "Lỗi khi sua tiện nghi phòng",
            error: error.message
        });
    }
}

exports.xoaTienNghiPhong = async ( req, res, next ) => {
    try {
        const { id } = req.params;
        const result = await TienNghiPhongModel.findByIdAndDelete(id);
        
        if (result) {
            res.json({
                status: 200,
                msg: "Đã xóa tiện nghi khỏi phòng",
                data: result
            });
        } else {
            res.status(404).json({
                status: 404,
                msg: "Không tìm thấy tiện nghi",
                data: []
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            msg: "Lỗi khi xóa tiện nghi",
            error: error.message
        });
    }
}