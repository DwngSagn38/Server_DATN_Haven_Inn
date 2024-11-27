const HoTroModel = require('../model/hotros');

exports.getListorByIdUser = async (req, res, next) => {
    try {
        const { id_NguoiDung } = req.query;

        // Build filter based on query parameters
        let filter = {};
        if (id_NguoiDung) {
            filter.id_NguoiDung = id_NguoiDung;
        }

        const hotros = await HoTroModel.find(filter).sort({ createdAt: -1 });

        if (hotros.length === 0) {
            return res.render('notfound', { message: 'Không tìm thấy' }); // Render "notfound" view with message
        }

        res.render('hoTroList', { hotros }); // Render 'hoTroList' view and pass the hotros data

    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: "Error fetching data", error: error.message }); // Render error page
    }
}

exports.addHoTro = async (req, res, next) => {
    try {
        const data = req.body;
        const hotro = new HoTroModel({
            id_NguoiDung: data.id_NguoiDung,
            vanDe: data.vanDe,
            trangThai: 0,
        });

        const result = await hotro.save();

        if (result) {
            res.render('addSuccess', { status: 200, msg: "Add success", data: result }); // Render success page
        } else {
            res.render('addFail', { status: 400, msg: "Add fail", data: [] }); // Render failure page
        }

    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: "Error fetching data", error: error.message }); // Render error page
    }
}

exports.suaHoTro = async (req, res, next) => {
    const { id } = req.params;
    const { trangThai } = req.body;

    // Check if 'trangThai' is provided in the body
    if (trangThai == null) {
        return res.render('error', { status: 400, msg: "Trạng thái không được cung cấp" }); // Render error page
    }

    try {
        // Only update the 'trangThai' field
        const result = await HoTroModel.findByIdAndUpdate(id, { trangThai: trangThai }, { new: true });

        if (result) {
            res.render('updateSuccess', { status: 200, msg: "Cập nhật trạng thái thành công", data: result });
        } else {
            res.render('error', { status: 404, msg: "Không tìm thấy hỗ trợ để cập nhật" }); // Render error page if not found
        }

    } catch (error) {
        res.render('error', { status: 500, msg: "Có lỗi xảy ra trong quá trình cập nhật", error: error.message }); // Render error page
    }
}

exports.xoaHoTro = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await HoTroModel.findByIdAndDelete({ _id: id });

        if (result) {
            res.render('deleteSuccess', { status: 200, msg: "Đã xóa hỗ trợ", data: result }); // Render success page
        } else {
            res.render('deleteFail', { status: 400, msg: "Delete fail", data: [] }); // Render failure page
        }

    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: "Error fetching data", error: error.message }); // Render error page
    }
}
