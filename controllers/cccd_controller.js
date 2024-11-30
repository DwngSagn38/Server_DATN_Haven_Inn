const CccdModel = require('../model/cccds');
const fs = require('fs');
const NguoiDungModel = require('../model/nguoidungs');
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/common/uploads");

// Phương thức lấy thông tin CCCD theo userId
exports.getCccdByUserId = async (req, res) => {
    const { id_NguoiDung } = req.params;  // Lấy userId từ tham số URL

    try {
        // Tìm CCCD theo userId
        const cccd = await CccdModel.findOne({ id_NguoiDung })// Liên kết với bảng NguoiDung và lấy thông tin như tên, email

        // Kiểm tra xem có tìm thấy CCCD không
        if (!cccd) {
            return res.status(404).json({ message: "Không tìm thấy CCCD cho người dùng này" });
        }

        res.status(200).json({
            message: "Lấy CCCD thành công",
            cccd
        });
    } catch (error) {
        console.error("Lỗi khi lấy CCCD:", error);
        res.status(500).json({ message: "Lỗi khi lấy CCCD", error: error.message });
    }
};

exports.addCccd = async (req, res) => {
    console.log("Req Files :", req.files);  // Đảm bảo req.files được in ra

    const { id_NguoiDung, soCCCD, hoTen, ngaySinh, gioiTinh, ngayCap, queQuan } = req.body;

    // Kiểm tra thông tin đầu vào
    if (!id_NguoiDung || !soCCCD || !ngayCap || !queQuan || !hoTen || !ngaySinh || !gioiTinh) {
        return res.status(404).json({ message: "Vui lòng cung cấp đầy đủ thông tin!" });
    }

    if (soCCCD.length !== 12 || isNaN(soCCCD)) {
        return res.status(404).json({ message: "CCCD không hợp lệ!" });
    }

    const existingSoCCCD = await CccdModel.findOne({ soCCCD : soCCCD });
    if (existingSoCCCD) {
        return res.status(404).json({ message: "CCCD đã được liên kết tài khoản khác!" });
    }

    // Kiểm tra xem người dùng có tồn tại không
    const user = await NguoiDungModel.findById(id_NguoiDung);
    if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    const existingCCCD = await CccdModel.findOne({id_NguoiDung : user._id})
    if(existingCCCD){
        return res.status(404).json({ message: "Người dùng đã có cccd!" });
    }

    try {
        let matTruocUrl = '';
        let matTruocId = '';
        let matSauUrl = '';
        let matSauId = '';

        // Kiểm tra xem file mặt trước và mặt sau có tồn tại trong req.files không
        if (req.files) {
            const matTruocFile = req.files.matTruoc ? req.files.matTruoc[0] : null;
            const matSauFile = req.files.matSau ? req.files.matSau[0] : null;

            if (matTruocFile) {
                const result = await uploadToCloudinary(matTruocFile.path);  // Upload lên Cloudinary
                matTruocUrl = result.secure_url;
                matTruocId = result.public_id;
                await fs.promises.unlink(matTruocFile.path);  // Xóa file tạm sau khi upload
            }

            if (matSauFile) {
                const result = await uploadToCloudinary(matSauFile.path);  // Upload lên Cloudinary
                matSauUrl = result.secure_url;
                matSauId = result.public_id;
                await fs.promises.unlink(matSauFile.path);  // Xóa file tạm sau khi upload
            }
        }

        // Tạo đối tượng CCCD và lưu vào cơ sở dữ liệu
        const cccd = new CccdModel({
            id_NguoiDung, // Truyền userId vào trường nguoiDung
            soCCCD,
            hoTen,
            ngaySinh,
            gioiTinh,
            ngayCap,
            noiThuongTru,
            anhMatTruoc: matTruocUrl || '',
            anhMatTruocId: matTruocId || '',
            anhMatSau: matSauUrl || '',
            anhMatSauId: matSauId || '',
        });

        const result = await cccd.save();
        res.json({ status: 200, message: "Thêm thành công", data: result });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xử lý tạo CCCD', error });
    }
};
