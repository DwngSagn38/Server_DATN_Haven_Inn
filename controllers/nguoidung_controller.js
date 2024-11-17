const nguoiDungModel = require('../model/nguoidungs');
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/common/uploads");
const fs = require('fs');

exports.getListorByID = async (req, res, next) => {
    try {
        const { id } = req.query;

        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};
        if (id) {
            filter._id = id;
        }

        const nguoidungs = await nguoiDungModel.find(filter);

        if (nguoidungs.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy' });
        }

        res.send(nguoidungs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Error fetching data", error: error.message });
    }
};

exports.addNguoiDung = async (req, res, next) => {
    console.log("Files received in addNguoiDung:", req.file);

    try {
        let imageUrl = '';
        let imageId = ''; // Lưu public_id của ảnh chính

        const file = req.file; // Xử lý file upload
        if (file) {
            const result = await uploadToCloudinary(file.path); // Upload lên Cloudinary
            imageUrl = result.secure_url;
            imageId = result.public_id;
            await fs.promises.unlink(file.path); // Xóa file tạm sau khi upload
        }

        const data = req.body;

        // Kiểm tra số điện thoại
        if (!data.soDienThoai || data.soDienThoai.length !== 10 || isNaN(data.soDienThoai)) {
            return res.status(400).json({ message: "Số điện thoại chưa hợp lệ (10 số)" });
        }

        // Kiểm tra số điện thoại đã tồn tại chưa
        const existingUser = await nguoiDungModel.findOne({ soDienThoai: data.soDienThoai });
        if (existingUser) {
            return res.status(400).json({ message: "Số điện thoại đã được đăng ký tài khoản khác" });
        }

        // Tạo tài khoản người dùng mới
        const nguoidung = new nguoiDungModel({
            ...req.body,
            hinhAnh: imageUrl || '',
            hinhAnhID: imageId || '',
        });

        const result = await nguoidung.save(); // Lưu vào cơ sở dữ liệu
        res.json({ status: 200, message: "Đăng ký thành công", data: result });

    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xử lý đăng ký người dùng', error });
    }
};

exports.suaNguoiDung = async (req, res, next) => {
    console.log("Files received in addNguoiDung:", req.file);

    try {
        const data = req.body;
        const { id } = req.params;
        const file = req.file;

        const nguoidung = await nguoiDungModel.findOne({ _id : id});

        if (nguoidung == null) {
            return res.status(303).send({message : 'Người dùng không tồn tại'});
        }

        let imageUrl = nguoidung.hinhAnh ;
        let imageId = nguoidung.hinhAnhID; // Lưu public_id của ảnh chính

        if (imageId) {
            await deleteFromCloudinary(imageId)
        }
        if (file) {
            const result = await uploadToCloudinary(file.path); // Upload lên Cloudinary
            imageUrl = result.secure_url;
            imageId = result.public_id;
            await fs.promises.unlink(file.path); // Xóa file tạm sau khi upload
        }
        
        const result = await nguoiDungModel.findByIdAndUpdate(id, {
            ...req.body,
            hinhAnh : data.hinhAnh || imageUrl,
            hinhAnhID : data.hinhAnhID || imageId
        }, { new : true })
        res.json({ status: 200, message: "Cập nhật thông tin thành công", data: result });

    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xử lý sửa thông tin người dùng', error });
    }
};

exports.xoaNguoiDung = async (req, res, next) => {

    try {
        const { id } = req.params;

        const nguoidung = await nguoiDungModel.findOne({ _id : id});

        if (nguoidung == null) {
            return res.status(303).send({message : 'Người dùng không tồn tại'});
        }

        let imageId = nguoidung.hinhAnhID; // Lưu public_id của ảnh chính

        if (imageId) {
            await deleteFromCloudinary(imageId)
        }
        
        const result = await nguoiDungModel.findByIdAndDelete({_id : id})
        res.json({ status: 200, message: "Xóa người dùng thành công", data: result });

    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xử lý xóa người dùng', error });
    }
};