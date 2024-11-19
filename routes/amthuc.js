const express = require('express');
const router = express.Router();

const { upload } = require('../config/common/uploads');
const amThucController = require('../controllers/amthuc_controller');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware('json'));

router.get('/', amThucController.getList);
router.get('/getbyid', amThucController.getById);
router.post('/post', upload.fields([{ name: 'images', maxCount: 1 }, { name: 'menu', maxCount: 5 }]), amThucController.addAmThuc);
router.put('/put/:id', upload.fields([{ name: 'images', maxCount: 1 }, { name: 'menu', maxCount: 5 }]), amThucController.suaAmThuc);
router.delete('/delete/:id', amThucController.deleteAmThuc)

module.exports = router;
