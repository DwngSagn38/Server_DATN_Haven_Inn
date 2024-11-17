const fs = require('fs');
const AmThucModel = require('../model/amthucs');
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/common/uploads");

exports.getList = async (req, res, next) => {
    try {
        let amthucs = await AmThucModel.find({}).sort({ createdAt: -1 });
        res.send(amthucs);
    } catch (error) {
        res.json({ status: 400, result: error });
    }
};

exports.getById = async (req, res, next) => {
    try {
        const { id } = req.query;

        let amthuc = await AmThucModel.findOne({ _id: id });

        if (!amthuc) {
            return res.status(404).json({ message: "Am Thuc not found" });
        }

        res.json(amthuc );
    } catch (error) {
        res.status(500).json({ message: "Error fetching Am Thuc", error });
    }
};

exports.addAmThuc = async (req, res) => {
    console.log("Files received in addAmThuc:", req.files);

    // Kiểm tra xem có file hay không
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    try {
        const imageUrls = [];
        const menuUrls = [];
        const imageIds = []; // Mảng lưu public_id của ảnh chính
        const menuIds = [];  // Mảng lưu public_id của ảnh menu

        // Kiểm tra và xử lý từng trường file
        if (req.files.images) {  // Kiểm tra xem có file hình ảnh chính không
            const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];  // Đảm bảo là mảng
            for (const file of files) {
                const filePath = file.path;
                const result = await uploadToCloudinary(filePath); // Upload ảnh
                imageUrls.push(result.secure_url);  // Lưu URL ảnh
                imageIds.push(result.public_id);    // Lưu public_id của ảnh chính
                await fs.promises.unlink(filePath);  // Xóa file đã upload
            }
        }

        if (req.files.menu) {  // Kiểm tra xem có file menu không
            const files = Array.isArray(req.files.menu) ? req.files.menu : [req.files.menu];  // Đảm bảo là mảng
            for (const file of files) {
                const filePath = file.path;
                const result = await uploadToCloudinary(filePath);  // Upload ảnh menu
                menuUrls.push(result.secure_url);  // Lưu URL ảnh menu
                menuIds.push(result.public_id);    // Lưu public_id của ảnh menu
                await fs.promises.unlink(filePath);  // Xóa file đã upload
            }
        }

        // Tạo đối tượng mới cho AmThuc
        const newAmThuc = {
            ...req.body,
            hinhAnh: imageUrls[0],  // Lưu URL ảnh chính
            hinhAnhID: imageIds[0], // Lưu public_id ảnh chính
            menu: menuUrls,       // Lưu URL ảnh menu
            menuIDs: menuIds,     // Lưu public_ids ảnh menu
        };

        // Lưu món ăn vào cơ sở dữ liệu
        await AmThucModel.create(newAmThuc);

        res.json({status : 200, success: true, data: newAmThuc , message : 'add successfully'});
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ success: false, message: 'Error uploading files', error });
    }
};


exports.deleteAmThuc = async (req, res) => {
    try {
        const id = req.params.id;
        const amThuc = await AmThucModel.findById(id);

        // Kiểm tra xem món ăn có ảnh hay không
        if (amThuc) {
            const imageId = amThuc.hinhAnhID;  // Lấy public_id ảnh chính
            const menuIds = amThuc.menuIDs;  // Lấy mảng public_id ảnh menu

            // Xóa ảnh chính khỏi Cloudinary
            if (imageId) {
                await deleteFromCloudinary(imageId);
            }

            // Xóa các ảnh menu khỏi Cloudinary
            if (menuIds && menuIds.length > 0) {
                for (const publicId of menuIds) {
                    await deleteFromCloudinary(publicId);
                }
            }
        }

        // Xóa món ăn trong cơ sở dữ liệu
        const result = await AmThucModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Delete successfully", result: result });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", result: error });
    }
};


exports.suaAmThuc = async (req, res) => {
    console.log("Files received in suaAmThuc:", req.files);

    try {
        const { id } = req.params;
        const amThuc = await AmThucModel.findById(id);

        if (!amThuc) {
            return res.status(404).json({ success: false, message: 'AmThuc not found' });
        }

        // Lấy dữ liệu cũ
        let imageUrls = amThuc.hinhAnh ? [amThuc.hinhAnh] : [];
        let menuUrls = amThuc.menu || [];
        let imageIds = amThuc.hinhAnhID ? [amThuc.hinhAnhID] : [];
        let menuIds = amThuc.menuIDs || [];

        // 1. Xử lý file "image" (1 ảnh)
        if (req.files && req.files.images && req.files.images.length > 0) {
            // Xóa ảnh cũ nếu có
            if (imageIds.length > 0) {
                await deleteFromCloudinary(imageIds[0]);
            }
            imageUrls = []; // Reset giá trị URL ảnh
            imageIds = [];  // Reset giá trị public_id ảnh

            for (const file of req.files.images) {
                const filePath = file.path;
                const result = await uploadToCloudinary(filePath); // Upload ảnh mới
                imageUrls.push(result.secure_url);
                imageIds.push(result.public_id);
                await fs.promises.unlink(filePath); // Xóa file đã upload
            }
        }

        // 2. Xử lý file "menu" (nhiều ảnh)
        if (req.files && req.files.menu && req.files.menu.length > 0) {
            // Xóa các ảnh menu cũ nếu có
            for (const publicId of menuIds) {
                await deleteFromCloudinary(publicId);
            }
            menuUrls = []; // Reset giá trị URL menu
            menuIds = [];  // Reset giá trị public_id menu

            for (const file of req.files.menu) {
                const filePath = file.path;
                const result = await uploadToCloudinary(filePath); // Upload menu mới
                menuUrls.push(result.secure_url);
                menuIds.push(result.public_id);
                await fs.promises.unlink(filePath); // Xóa file đã upload
            }
        }

        // 3. Cập nhật món ăn trong cơ sở dữ liệu
        const updatedAmThuc = await AmThucModel.findByIdAndUpdate(
            id,
            {
                ...req.body, // Cập nhật thông tin từ body
                hinhAnh: imageUrls[0], // Cập nhật URL ảnh chính
                hinhAnhID: imageIds[0], // Cập nhật public_id ảnh chính
                menu: menuUrls, // Cập nhật URL menu
                menuIDs: menuIds, // Cập nhật public_ids menu
            },
            { new: true } // Trả về bản ghi đã được cập nhật
        );

        res.status(200).json({ success: true, data: updatedAmThuc });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ success: false, message: 'Error uploading files', error });
    }
};
