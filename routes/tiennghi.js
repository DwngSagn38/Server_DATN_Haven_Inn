const express = require('express');
const router = express.Router();
const tienNghiController = require("../controllers/tiennghi_controller");
const { upload } = require('../config/common/uploads');

router.get('/',tienNghiController.getListorByID);
router.post('/post', upload.single('image') ,tienNghiController.addTienNghi);
router.put('/put/:id', upload.single('image') ,tienNghiController.suaTienNghi);
router.delete('/delete/:id',tienNghiController.xoaTienNghi);


module.exports = router;


