const express = require('express');
const nguoiDungController = require('../controllers/nguoidung_controller');
const { upload } = require('../config/common/uploads');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// router.use(authMiddleware('json'));
router.get('/',nguoiDungController.getListorByID)
router.post('/post', upload.single('image') ,nguoiDungController.addNguoiDung)
router.put('/put/:id', upload.single('image') ,nguoiDungController.suaNguoiDung)
router.delete('/delete/:id',nguoiDungController.xoaNguoiDung)


module.exports = router;

