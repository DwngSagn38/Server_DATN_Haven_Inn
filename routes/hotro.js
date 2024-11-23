const express = require('express');
const router = express.Router();
const hoTroController = require('../controllers/hotro_controller')
const authMiddleware = require('../middleware/authMiddleware');

// router.use(authMiddleware('json'));
router.get('/', hoTroController.getListorByIdUser);
router.post('/post', hoTroController.addHoTro);
router.put('/update-status/:id', hoTroController.suaHoTro);
router.delete('/delete/:id', hoTroController.xoaHoTro);

module.exports = router; 