const fs = require('fs');
const TienNghiModel = require('../model/tiennghis');
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/common/uploads");

exports.getListorByID = async (req, res, next) => {
    try {
        const { id } = req.query;

        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};
        if (id) {
            filter._id = id;
        }

        const tiennghis = await TienNghiModel.find(filter);
        
        if (tiennghis.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy' });
        }        

        res.send({ status: 200, data: tiennghis, message : "Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Error fetching data", error: error.message });
    }
};

exports.addTienNghi = async (req, res, next) => {
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

        const tiennghi = new TienNghiModel({
            ...req.body,
            image : imageUrl || '',
            imageId : imageId || '',
        });

        const result = await tiennghi.save(); // Lưu vào cơ sở dữ liệu
        res.json({ status: 200, message: "Đăng ký thành công", data: result });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xử lý tạo tiện nghi', error });
    }
};

exports.suaTienNghi = async (req, res, next) => {
    console.log("Files:", req.file);

    try {
        const data = req.body;
        const { id } = req.params;
        const file = req.file;

        const TienNghi = await TienNghiModel.findOne({ _id : id});

        if (TienNghi == null) {
            return res.status(303).send({message : 'Tiện nghi không tồn tại'});
        }

        let imageUrl = TienNghi.image ;
        let imageId = TienNghi.imageId; // Lưu public_id của ảnh chính

        if (imageId) {
            await deleteFromCloudinary(imageId)
        }
        if (file) {
            const result = await uploadToCloudinary(file.path); // Upload lên Cloudinary
            imageUrl = result.secure_url;
            imageId = result.public_id;
            await fs.promises.unlink(file.path); // Xóa file tạm sau khi upload
        }
        
        const result = await TienNghiModel.findByIdAndUpdate(id, {
            ...req.body,
            image : data.image || imageUrl,
            imageId : data.imageId || imageId
        }, { new : true })
        res.json({ status: 200, message: "Cập nhật thông tin thành công", data: result });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xử lý sửa thông tin tiện nghi', error });
    }
};

exports.xoaTienNghi = async (req, res, next) => {

    try {
        const { id } = req.params;

        const TienNghi = await TienNghiModel.findOne({ _id : id});

        if (TienNghi == null) {
            return res.status(303).send({message : 'Tiện nghi không tồn tại'});
        }

        let imageId = TienNghi.imageId; // Lưu public_id của ảnh chính

        if (imageId) {
            await deleteFromCloudinary(imageId)
        }
        
        const result = await TienNghiModel.findByIdAndDelete({_id : id})
        res.json({ status: 200, message: "Xóa tiện nghi thành công", data: result });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xử lý xóa tiện nghi', error });
    }
};