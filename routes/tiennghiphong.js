const express = require('express');
const router = express.Router();
const tienNghiPhongController = require('../controllers/tiennghiphong_controller');

router.get('/', tienNghiPhongController.getListorByID);
router.post('/post', tienNghiPhongController.addTienNghiPhong);
router.put('/put/:id', tienNghiPhongController.suaTienNghiPhong);
router.delete('/delete/:id', tienNghiPhongController.xoaTienNghiPhong);

module.exports = router;
// // get list
// router.get('/', async (req, res) => {
//     try {
//         const { id_LoaiPhong } = req.query;  // Sử dụng req.query để lấy id từ query string

//         // Nếu có id_LPhong, lọc theo id_LoaiPhong
//         if (id_LoaiPhong) {
//             const tienNghiLPhongs = await TienNghiPhongModel.find({ id_LoaiPhong: id_LoaiPhong }).sort({ createdAt: -1 });
//             return res.json({
//                 status: 200,
//                 msg: "Lấy danh sách tiện nghi cho loại phòng",
//                 data: tienNghiLPhongs
//             });
//         }

//         // Nếu không có id_LPhong, trả về tất cả
//         const tienNghiPhongs = await TienNghiPhongModel.find().sort({ createdAt: -1 });
//         res.json({
//             status: 200,
//             msg: "Lấy danh sách tất cả tiện nghi phòng",
//             data: tienNghiPhongs
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             status: 500,
//             msg: "Lỗi khi lấy danh sách tiện nghi phòng",
//             error: error.message
//         });
//     }
// });

// // delete
// router.delete('/delete/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const result = await TienNghiPhongModel.findByIdAndDelete(id);
        
//         if (result) {
//             res.json({
//                 status: 200,
//                 msg: "Đã xóa tiện nghi khỏi phòng",
//                 data: result
//             });
//         } else {
//             res.status(404).json({
//                 status: 404,
//                 msg: "Không tìm thấy tiện nghi",
//                 data: []
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             status: 500,
//             msg: "Lỗi khi xóa tiện nghi",
//             error: error.message
//         });
//     }
// });

// // post - add
// router.post('/post', async (req, res) => {
//     try {
//         const data = req.body;

//         const tiennghiphong = new TienNghiPhongModel({
//             id_TienNghi: data.id_TienNghi,
//             id_LoaiPhong: data.id_LoaiPhong,
//         });

//         const result = await tiennghiphong.save();

//         if (result) {
//             res.json({
//                 status: 200,
//                 msg: "Thêm tiện nghi thành công",
//                 data: result
//             });
//         } else {
//             res.status(400).json({
//                 status: 400,
//                 msg: "Thêm tiện nghi thất bại",
//                 data: []
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             status: 500,
//             msg: "Lỗi khi thêm tiện nghi phòng",
//             error: error.message
//         });
//     }
// });


