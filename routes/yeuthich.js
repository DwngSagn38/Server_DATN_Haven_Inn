const express = require('express');
const router = express.Router();

const yeuThichController = require('../controllers/yeuthich_controller')
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware('json'));
router.get('/', yeuThichController.getListorByidNguoiDung);
router.post('/post', yeuThichController.addYeuThich);
router.put('/put/:id', yeuThichController.suaYeuThich);
router.delete('/delete/:id', yeuThichController.xoaYeuThich);

module.exports = router;