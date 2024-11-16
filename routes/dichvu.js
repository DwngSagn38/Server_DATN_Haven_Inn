const express = require('express');
const router = express.Router();
const dichvuController = require('../controllers/dichvu_controller');
const { upload } = require('../config/common/uploads');

router.get('/', dichvuController.getListorByID),
router.delete('/delete/:id', dichvuController.xoaDichVu),
router.post('/post', upload.single('hinhAnh'), dichvuController.addDichVu);
router.put('/put/:id', upload.single('hinhAnh'), dichvuController.suaDichVu);

module.exports = router;

// // GET list dịch vụ và tìm kiếm dịch vụ theo ID
// router.get('/', async (req, res) => {
//     try {
//         const dichVus = await DichVuModel.find().sort({ createdAt: -1 });
//         res.send(dichVus);
//     } catch (error) {
//         res.status(500).json({ status: 500, msg: "Error fetching data", error: error.message });
//     }
// });

// // DELETE - xóa dịch vụ và ảnh
// router.delete('/delete/:id', async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Tìm dịch vụ theo ID để lấy đường dẫn ảnh
//         const dichvu = await DichVuModel.findById(id);
//         if (!dichvu) {
//             return res.status(404).json({
//                 status: 404,
//                 msg: "Dịch vụ không tồn tại"
//             });
//         }

//         // Kiểm tra sự tồn tại của file trước khi xóa
//         if (dichvu.hinhAnh) {
//             const imagePath = path.join(__dirname, '..', 'public', 'uploads', path.basename(dichvu.hinhAnh));
//             if (fs.existsSync(imagePath)) {
//                 try {
//                     fs.unlinkSync(imagePath);
//                 } catch (error) {
//                     console.error("Lỗi khi xóa ảnh:", error);
//                 }
//             }
//         }

//         // Xóa bản ghi dịch vụ trong MongoDB
//         const result = await DichVuModel.findByIdAndDelete({ _id: id });
        
//         if (result) {
//             res.status(200).json({
//                 status: 200,
//                 msg: "Xóa dịch vụ và ảnh thành công",
//                 data: result
//             });
//         } else {
//             res.status(400).json({
//                 status: 400,
//                 msg: "Xóa dịch vụ thất bại",
//                 data: []
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             status: 500,
//             msg: "Lỗi khi xóa dịch vụ",
//             error: error.message
//         });
//     }
// });

// // POST - thêm dịch vụ
// router.post('/post', upload.single('hinhAnh'), async (req, res) => {
//     try {
//         const data = req.body;
//         const { file } = req;

//         const imageUrl = file ? `${req.protocol}://${req.get('host')}/uploads/${file.filename}` : "";
        
//         const dichvu = new DichVuModel({
//             tenDichVu: data.tenDichVu,
//             moTa: data.moTa,
//             hinhAnh: imageUrl,
//         });

//         const result = await dichvu.save();

//         res.status(201).json({
//             status: 201,
//             msg: "Add success",
//             data: result
//         });
//     } catch (error) {
//         res.status(500).json({ status: 500, msg: "Add fail", error: error.message });
//     }
// });

// // PUT - cập nhật dịch vụ
// router.put('/put/:id', upload.single('hinhAnh'), async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = req.body;

//         const dichvu = await DichVuModel.findById(id);
//         if (!dichvu) {
//             return res.status(404).json({ status: 404, msg: "Dịch vụ không tồn tại" });
//         }

//         // Xóa ảnh cũ nếu có ảnh mới
//         if (req.file) {
//             const oldImagePath = path.join(__dirname, '..', 'public', 'uploads', path.basename(dichvu.hinhAnh));
//             if (fs.existsSync(oldImagePath)) {
//                 fs.unlinkSync(oldImagePath);
//             }
//             data.hinhAnh = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
//         }

//         const result = await DichVuModel.findByIdAndUpdate(id, data, { new: true });

//         res.status(200).json({
//             status: 200,
//             msg: "Update success",
//             data: result
//         });
//     } catch (error) {
//         res.status(500).json({ status: 500, msg: "Update fail", error: error.message });
//     }
// });


