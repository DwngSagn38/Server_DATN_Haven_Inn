const fs = require('fs');
const DichVuModel = require('../model/dichvus');
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/common/uploads");

exports.getListorByID = async (req, res, next) => {
    try {
        const { id } = req.query;

        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};
        if (id) {
            filter._id = id;
        }

        const dichvus = await DichVuModel.find(filter);
        
        if (dichvus.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy' });
        }        

        res.send({ status: 200, data: dichvus, message : "Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Error fetching data", error: error.message });
    }
};

exports.addDichVu = async (req, res, next) => {
    console.log("Req Files :", req.file);

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

        const dichvu = new DichVuModel({
            ...req.body,
            hinhAnh : imageUrl || '',
            hinhAnhID : imageId || '',
        });

        const result = await dichvu.save();
        res.json({ status: 200, message: "Thêm thành công", data: result });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xử lý tạo tiện nghi', error });
    }
};

exports.suaDichVu = async (req, res, next) => {
    console.log("Files:", req.file);

    try {
        const data = req.body;
        const { id } = req.params;
        const file = req.file;

        const DichVu = await DichVuModel.findOne({ _id : id});

        if (DichVu == null) {
            return res.status(303).send({message : 'Dịch vụ không tồn tại'});
        }

        let imageUrl = DichVu.hinhAnh ;
        let imageId = DichVu.hinhAnhID; // Lưu public_id của ảnh chính

        if (imageId) {
            await deleteFromCloudinary(imageId)
        }
        if (file) {
            const result = await uploadToCloudinary(file.path); // Upload lên Cloudinary
            imageUrl = result.secure_url;
            imageId = result.public_id;
            await fs.promises.unlink(file.path); // Xóa file tạm sau khi upload
        }
        
        const result = await DichVuModel.findByIdAndUpdate(id, {
            ...req.body,
            hinhAnh : data.hinhAnh || imageUrl,
            hinhAnhID : data.hinhAnhID || imageId
        }, { new : true })
        res.json({ status: 200, message: "Cập nhật thông tin thành công", data: result });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xử lý sửa thông tin tiện nghi', error });
    }
};

exports.xoaDichVu = async (req, res, next) => {

    try {
        const { id } = req.params;

        const DichVu = await DichVuModel.findOne({ _id : id});

        if (DichVu == null) {
            return res.status(303).send({message : 'dịch vụ không tồn tại'});
        }

        let imageId = DichVu.hinhAnhID; // Lưu public_id của ảnh chính

        if (imageId) {
            await deleteFromCloudinary(imageId)
        }
        
        const result = await DichVuModel.findByIdAndDelete({_id : id})
        res.json({ status: 200, message: "Xóa dịch vụ thành công", data: result });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xử lý xóa dịch vụ', error });
    }
};