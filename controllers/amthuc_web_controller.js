const fs = require('fs');
const AmThucModel = require('../model/amthucs'); // Đổi model tương ứng với 'amthuc'
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/common/uploads");

exports.getListOrByID = async (req, res, next) => {
    try {
        const { id } = req.query;

        let filter = {};
        if (id) {
            filter._id = id;
        }

        const amthucs = await AmThucModel.find(filter);

        if (amthucs.length === 0) {
            return res.render('../views/amthuc/amthucs', { message: 'Không tìm thấy nhà hàng', amthucs: [] });
        }

        const message = req.session.message; // Lấy thông báo từ session
        delete req.session.message; // Xóa thông báo sau khi đã sử dụng

        res.render('../views/amthuc/amthucs', { message: message || null, amthucs });
    } catch (error) {
        console.error(error);
        res.render('../views/amthuc/amthucs', { message: 'Lỗi khi lấy dữ liệu', amthucs: [] });
    }
};

// exports.addAmThuc = async (req, res, next) => {
//     try {
//         let imageUrl = [];
//         let imageId = [];
//         const mainFile = req.files['hinhAnhChinh'] ? req.files['hinhAnhChinh'][0] : null;

//         // Xử lý hình ảnh chính
//         if (mainFile) {
//             const result = await uploadToCloudinary(mainFile.path);
//             imageUrl = result.secure_url;
//             imageId = result.public_id;
//             await fs.promises.unlink(mainFile.path);
//         }

//         // Xử lý hình ảnh menu
//         const menuImages = [];
//         if (req.files['hinhMenu']) {
//             for (const menuFile of req.files['hinhMenu']) {
//                 const result = await uploadToCloudinary(menuFile.path);
//                 menuImages.push({
//                     url: result.secure_url,
//                     publicId: result.public_id
//                 });
//                 await fs.promises.unlink(menuFile.path);
//             }
//         }

//         const amthuc = new AmThucModel({
//             tenNhaHang: req.body.tenNhaHang,
//             hinhAnh: imageUrl,
//             hinhAnhID: imageId,
//             moTa: req.body.moTa,
//             hinhMenu: menuImages.map(img => img.url),
//             hinhMenuID: menuImages.map(img => img.publicId),
//             gioMoCua: req.body.gioMoCua,
//             gioDongCua: req.body.gioDongCua,
//             viTri: req.body.viTri,
//             hotline: req.body.hotline
//         });

//         await amthuc.save();

//         req.session.message = "Thêm nhà hàng thành công!";
//         res.redirect('/web/amthucs');
//     } catch (error) {
//         console.error('Error:', error);
//         res.render('../views/amthuc/amthucs', { 
//             message: 'Lỗi khi thêm nhà hàng', 
//             amthucs: [] 
//         });
//     }
// };

// exports.suaAmThuc = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const amthuc = await AmThucModel.findOne({ _id: id });
//         if (!amthuc) {
//             return res.render('../views/amthuc/amthucs', { 
//                 message: 'Nhà hàng không tồn tại', 
//                 amthucs: [] 
//             });
//         }

//         // Xử lý hình ảnh chính
//         let imageUrl = amthuc.hinhAnh;
//         let imageId = amthuc.hinhAnhID;
//         const mainFile = req.files['hinhAnhChinh'] ? req.files['hinhAnhChinh'][0] : null;

//         // Xóa hình ảnh cũ nếu có file mới
//         if (mainFile) {
//             if (imageId) {
//                 await deleteFromCloudinary(imageId);
//             }
            
//             const result = await uploadToCloudinary(mainFile.path);
//             imageUrl = result.secure_url;
//             imageId = result.public_id;
//             await fs.promises.unlink(mainFile.path);
//         }

//         // Xử lý hình ảnh menu
//         const menuImages = [];
//         if (req.files['hinhMenu']) {
//             // Xóa các hình menu cũ
//             if (amthuc.hinhMenuID && amthuc.hinhMenuID.length > 0) {
//                 for (const oldImageId of amthuc.hinhMenuID) {
//                     await deleteFromCloudinary(oldImageId);
//                 }
//             }

//             // Tải lên hình menu mới
//             for (const menuFile of req.files['hinhMenu']) {
//                 const result = await uploadToCloudinary(menuFile.path);
//                 menuImages.push({
//                     url: result.secure_url,
//                     publicId: result.public_id
//                 });
//                 await fs.promises.unlink(menuFile.path);
//             }
//         }

//         // Cập nhật nhà hàng
//         await AmThucModel.findByIdAndUpdate(id, {
//             tenNhaHang: req.body.tenNhaHang,
//             hinhAnh: imageUrl,
//             hinhAnhID: imageId,
//             moTa: req.body.moTa,
//             hinhMenu: menuImages.length > 0 ? menuImages.map(img => img.url) : amthuc.hinhMenu,
//             hinhMenuID: menuImages.length > 0 ? menuImages.map(img => img.publicId) : amthuc.hinhMenuID,
//             gioMoCua: req.body.gioMoCua,
//             gioDongCua: req.body.gioDongCua,
//             viTri: req.body.viTri,
//             hotline: req.body.hotline
//         }, { new: true });

//         req.session.message = "Sửa nhà hàng thành công!";
//         res.redirect('/web/amthucs');
//     } catch (error) {
//         console.error('Error:', error);
//         res.render('../views/amthuc/amthucs', { 
//             message: 'Lỗi khi sửa nhà hàng', 
//             amthucs: [] 
//         });
//     }
// };

exports.xoaAmThuc = async (req, res, next) => {
    try {
        const { id } = req.params;

        const amthuc = await AmThucModel.findOne({ _id: id });
        if (!amthuc) {
            return res.render('../views/amthuc/amthucs', { message: 'Nhà hàng không tồn tại', amthucs: [] });
        }

        if (amthuc.hinhAnhID) {
            await deleteFromCloudinary(amthuc.hinhAnhID);
        }

        await AmThucModel.findByIdAndDelete({ _id: id });

        req.session.message = "Xóa nhà hàng thành công!";
        res.redirect('/web/amthucs'); // Chuyển hướng về danh sách
    } catch (error) {
        console.error('Error:', error);
        res.render('../views/amthuc/amthucs', { message: 'Lỗi khi xóa nhà hàng', amthucs: [] });
    }
};










// Thêm món ăn
exports.addAmThuc = async (req, res) => {
    // if (req.method === 'GET') {
    //     res.render('/views/amthuc/amthucs.ejs'); // Hiển thị form thêm món ăn
    // } else 
    if (req.method === 'POST') {
        try {
            const { ten, moTa } = req.body;
            const image = req.files && req.files.images ? req.files.images[0] : null;

            let hinhAnhUrl = null;
            let hinhAnhId = null;

            if (image) {
                const result = await uploadToCloudinary(image.path);
                hinhAnhUrl = result.secure_url;
                hinhAnhId = result.public_id;
                await fs.promises.unlink(image.path);
            }

             await AmThucModel.create({
                ten,
                moTa,
                hinhAnh: hinhAnhUrl,
                hinhAnhID: hinhAnhId,
            });

            res.redirect('/web/amthucs'); // Chuyển hướng về danh sách món ăn
        } catch (error) {
            res.render('error', { message: 'Error adding AmThuc', error });
            console.log(error);
            
        }
    }
};

// Sửa món ăn
exports.suaAmThuc = async (req, res) => {
    if (req.method === 'GET') {
        try {
            const { id } = req.params;
            const amthuc = await AmThucModel.findById(id);

            if (!amthuc) {
                return res.status(404).render('error', { message: 'AmThuc not found' });
            }

            res.render('/views/amthuc/amthucs.ejs', { amthuc });
        } catch (error) {
            res.render('error', { message: 'Error fetching AmThuc for editing', error });
        }
    } else if (req.method === 'POST') {
        try {
            const { id } = req.params;
            const amthuc = await AmThucModel.findById(id);

            if (!amthuc) {
                return res.status(404).render('error', { message: 'AmThuc not found' });
            }

            const { ten, moTa } = req.body;
            const image = req.files && req.files.images ? req.files.images[0] : null;

            let hinhAnhUrl = amthuc.hinhAnh;
            let hinhAnhId = amthuc.hinhAnhID;

            if (image) {
                if (hinhAnhId) {
                    await deleteFromCloudinary(hinhAnhId); // Xóa ảnh cũ trên Cloudinary
                }
                const result = await uploadToCloudinary(image.path);
                hinhAnhUrl = result.secure_url;
                hinhAnhId = result.public_id;
                await fs.promises.unlink(image.path);
            }

            await AmThucModel.findByIdAndUpdate(id, {
                ten,
                moTa,
                hinhAnh: hinhAnhUrl,
                hinhAnhID: hinhAnhId,
            });

            res.redirect('/web/amthucs'); // Chuyển hướng về danh sách món ăn
        } catch (error) {
            res.render('error', { message: 'Error updating AmThuc', error });
        }
    }
};


