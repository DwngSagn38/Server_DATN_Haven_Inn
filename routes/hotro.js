const express = require('express');
const router = express.Router();
const hoTroController = require('../controllers/hotro_controller')

router.get('/', hoTroController.getListorByIdUser);
router.post('/post', hoTroController.addHoTro);
router.put('/update-status/:id', hoTroController.suaHoTro);
router.delete('/delete/:id', hoTroController.xoaHoTro);

module.exports = router; 