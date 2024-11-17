const express = require("express");
const router = express.Router();

const loginController = require('../controllers/login_controller')

router.post('/', loginController.login);
router.put('/doimatkhau/:id', loginController.doimatkhau);

module.exports = router;
