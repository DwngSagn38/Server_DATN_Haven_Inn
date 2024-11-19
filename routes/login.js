const express = require("express");
const router = express.Router();

const authController = require('../controllers/auth_controller')

router.post('/login', authController.login);
router.put('/doimatkhau/:id', authController.doimatkhau);
router.post('/logout', authController.logout);

module.exports = router;
