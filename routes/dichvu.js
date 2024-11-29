const express = require('express');
const router = express.Router();
const dichvuController = require('../controllers/dichvu_controller');
const { upload } = require('../config/common/uploads');


router.get('/', dichvuController.getListorByID),
router.delete('/delete/:id', dichvuController.xoaDichVu),
router.post('/post', upload.single('hinhAnh'), dichvuController.addDichVu);
router.put('/put/:id', upload.single('hinhAnh'), dichvuController.suaDichVu);

module.exports = router;


