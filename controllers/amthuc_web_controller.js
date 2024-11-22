const fs = require('fs');
const AmThucModel = require('../model/amthucs');
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/common/uploads");

// Lấy danh sách hoặc chi tiết nhà hàng
exports.getListOrByID = async (req, res) => {
    try {
        const { id } = req.query; // Kiểm tra có tham số `id` trong query

        if (id) {
            // Nếu có id, tìm nhà hàng theo ID
            const amthuc = await AmThucModel.findById(id);

            if (!amthuc) {
                return res.status(404).render('error', { message: 'Nhà hàng không tìm thấy' });
            }

            return res.render('amthuc/amthucs.ejs', { amthucs: [amthuc], message: null });
        }

        // Nếu không có id, trả về danh sách nhà hàng
        const amthucs = await AmThucModel.find({}).sort({ createdAt: -1 });
        res.render('amthuc/amthucs.ejs', { amthucs, message: null }); // Trả về danh sách nhà hàng
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        res.status(500).render('error', { message: 'Lỗi khi lấy dữ liệu nhà hàng', error });
    }
};

// Thêm nhà hàng
// exports.addAmThuc = async (req, res) => {
//     console.log("Files received in addAmThuc:", req.files);

//     if (!req.files || Object.keys(req.files).length === 0) {
//         return res.status(400).render('error', { message: 'Không có file nào được tải lên' });
//     }

//     try {
//         const imageUrls = [];
//         const menuUrls = [];
//         const imageIds = [];
//         const menuIds = [];

//         if (req.files.images) {
//             const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
//             for (const file of files) {
//                 const filePath = file.path;
//                 const result = await uploadToCloudinary(filePath);
//                 imageUrls.push(result.secure_url);
//                 imageIds.push(result.public_id);
//                 await fs.promises.unlink(filePath); 
//             }
//         }

//         if (req.files.menu) {
//             const files = Array.isArray(req.files.menu) ? req.files.menu : [req.files.menu];
//             for (const file of files) {
//                 const filePath = file.path;
//                 const result = await uploadToCloudinary(filePath);
//                 menuUrls.push(result.secure_url);
//                 menuIds.push(result.public_id);
//                 await fs.promises.unlink(filePath);
//             }
//         }

//         const newAmThuc = {
//             ...req.body,
//             hinhAnh: imageUrls[0],
//             hinhAnhID: imageIds[0],
//             menu: menuUrls,
//             menuIDs: menuIds,
//         };

//         await AmThucModel.create(newAmThuc);
//         res.redirect('/web/amthucs'); // Điều hướng lại danh sách nhà hàng sau khi thêm
//     } catch (error) {
//         console.error('Lỗi khi tải lên file:', error);
//         res.status(500).render('error', { message: 'Lỗi khi tải lên file', error });
//     }
// };

exports.addAmThuc = async (req, res) => {
    try {
        const imageUrls = [];
        const menuUrls = [];
        const imageIds = [];
        const menuIds = [];

        // Kiểm tra và tải lên ảnh chính
        if (req.files && req.files.images) {
            const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            for (const file of files) {
                const filePath = file.path;
                const result = await uploadToCloudinary(filePath);
                imageUrls.push(result.secure_url);
                imageIds.push(result.public_id);
                await fs.promises.unlink(filePath);
            }
        }

        // Kiểm tra và tải lên ảnh menu
        if (req.files && req.files.menu) {
            const files = Array.isArray(req.files.menu) ? req.files.menu : [req.files.menu];
            for (const file of files) {
                const filePath = file.path;
                const result = await uploadToCloudinary(filePath);
                menuUrls.push(result.secure_url);
                menuIds.push(result.public_id);
                await fs.promises.unlink(filePath);
            }
        }

        // Tạo đối tượng mới cho nhà hàng
        const newAmThuc = {
            ...req.body,
            hinhAnh: imageUrls[0] || "",  // Đảm bảo có giá trị mặc định
            hinhAnhID: imageIds[0] || "",
            menu: menuUrls,
            menuIDs: menuIds,
        };

        await AmThucModel.create(newAmThuc);
        res.redirect('/web/amthucs');
    } catch (error) {
        console.error('Lỗi khi tải lên file:', error);
        res.status(500).render('error', { message: 'Lỗi khi tải lên file', error });
    }
};

// Xóa nhà hàng
// exports.deleteAmThuc = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const amThuc = await AmThucModel.findById(id);

//         if (amThuc) {
//             const imageId = amThuc.hinhAnhID;
//             const menuIds = amThuc.menuIDs;

//             if (imageId) {
//                 await deleteFromCloudinary(imageId);
//             }

//             if (menuIds && menuIds.length > 0) {
//                 for (const publicId of menuIds) {
//                     await deleteFromCloudinary(publicId);
//                 }
//             }
//         }

//         await AmThucModel.findByIdAndDelete(id);
//         res.redirect('/web/amthucs'); // Điều hướng lại danh sách nhà hàng sau khi xóa
//     } catch (error) {
//         console.error('Lỗi khi xóa nhà hàng:', error);
//         res.status(500).render('error', { message: 'Lỗi khi xóa nhà hàng', error });
//     }
// };

exports.deleteAmThuc = async (req, res) => {
    try {
        const { id } = req.params;
        const amthuc = await AmThucModel.findById(id);

        if (!amthuc) {
            return res.status(404).send('Không tìm thấy nhà hàng');
        }

        // Xóa ảnh cũ từ Cloudinary
        if (amthuc.hinhAnhID) {
            await deleteFromCloudinary(amthuc.hinhAnhID);
        }

        if (amthuc.menuIDs.length > 0) {
            await Promise.all(amthuc.menuIDs.map(id => deleteFromCloudinary(id)));
        }

        await AmThucModel.findByIdAndDelete(id);
        res.redirect('/web/amthucs');
    } catch (error) {
        console.error('Lỗi khi xóa nhà hàng:', error);
        res.status(500).render('error', { message: 'Lỗi khi xóa nhà hàng', error });
    }
};


// Sửa nhà hàng
// exports.suaAmThuc = async (req, res) => {
//     console.log("Files received in suaAmThuc:", req.files);

//     try {
//         const { id } = req.params;
//         const amThuc = await AmThucModel.findById(id);

//         if (!amThuc) {
//             return res.status(404).render('error', { message: 'Nhà hàng không tìm thấy' });
//         }

//         let imageUrls = amThuc.hinhAnh ? [amThuc.hinhAnh] : [];
//         let menuUrls = amThuc.menu || [];
//         let imageIds = amThuc.hinhAnhID ? [amThuc.hinhAnhID] : [];
//         let menuIds = amThuc.menuIDs || [];

//         if (req.files && req.files.images && req.files.images.length > 0) {
//             if (imageIds.length > 0) {
//                 await deleteFromCloudinary(imageIds[0]);
//             }
//             imageUrls = [];
//             imageIds = [];

//             for (const file of req.files.images) {
//                 const filePath = file.path;
//                 const result = await uploadToCloudinary(filePath);
//                 imageUrls.push(result.secure_url);
//                 imageIds.push(result.public_id);
//                 await fs.promises.unlink(filePath);
//             }
//         }

//         if (req.files && req.files.menu && req.files.menu.length > 0) {
//             for (const publicId of menuIds) {
//                 await deleteFromCloudinary(publicId);
//             }
//             menuUrls = [];
//             menuIds = [];

//             for (const file of req.files.menu) {
//                 const filePath = file.path;
//                 const result = await uploadToCloudinary(filePath);
//                 menuUrls.push(result.secure_url);
//                 menuIds.push(result.public_id);
//                 await fs.promises.unlink(filePath);
//             }
//         }

//         await AmThucModel.findByIdAndUpdate(
//             id,
//             {
//                 ...req.body,
//                 hinhAnh: imageUrls[0],
//                 hinhAnhID: imageIds[0],
//                 menu: menuUrls,
//                 menuIDs: menuIds,
//             },
//             { new: true }
//         );

//         res.redirect('/web/amthucs'); // Điều hướng lại danh sách nhà hàng sau khi cập nhật
//     } catch (error) {
//         console.error('Lỗi khi cập nhật nhà hàng:', error);
//         res.status(500).render('error', { message: 'Lỗi khi cập nhật nhà hàng', error });
//     }
// };

exports.suaAmThuc = async (req, res) => {
    try {
        const { id } = req.params;
        const amthuc = await AmThucModel.findById(id);

        if (!amthuc) {
            return res.status(404).send('Không tìm thấy nhà hàng');
        }

        const imageUrls = [];
        const menuUrls = [];
        const imageIds = [];
        const menuIds = [];

        // Kiểm tra và tải lên ảnh mới nếu có
        if (req.files && req.files.images) {
            if (amthuc.hinhAnhID) {
                await deleteFromCloudinary(amthuc.hinhAnhID); // Xóa ảnh cũ
            }

            const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            for (const file of files) {
                const filePath = file.path;
                const result = await uploadToCloudinary(filePath);
                imageUrls.push(result.secure_url);
                imageIds.push(result.public_id);
                await fs.promises.unlink(filePath);
            }
        } else {
            imageUrls.push(amthuc.hinhAnh);
            imageIds.push(amthuc.hinhAnhID);
        }

        // Kiểm tra và tải lên menu mới nếu có
        if (req.files && req.files.menu) {
            if (amthuc.menuIDs.length > 0) {
                await Promise.all(amthuc.menuIDs.map(id => deleteFromCloudinary(id))); // Xóa ảnh menu cũ
            }

            const files = Array.isArray(req.files.menu) ? req.files.menu : [req.files.menu];
            for (const file of files) {
                const filePath = file.path;
                const result = await uploadToCloudinary(filePath);
                menuUrls.push(result.secure_url);
                menuIds.push(result.public_id);
                await fs.promises.unlink(filePath);
            }
        } else {
            menuUrls.push(...amthuc.menu);
            menuIds.push(...amthuc.menuIDs);
        }

        // Cập nhật nhà hàng
        await AmThucModel.findByIdAndUpdate(id, {
            ...req.body,
            hinhAnh: imageUrls[0],
            hinhAnhID: imageIds[0],
            menu: menuUrls,
            menuIDs: menuIds,
        });

        res.redirect('/web/amthucs');
    } catch (error) {
        console.error('Lỗi khi sửa nhà hàng:', error);
        res.status(500).render('error', { message: 'Lỗi khi sửa nhà hàng', error });
    }
};

