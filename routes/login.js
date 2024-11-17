const express = require("express");
const router = express.Router();

const loginController = require('../controllers/login_controller')

router.post('/', loginController.login);

// Hiển thị giao diện đăng nhập
router.get('/', (req, res) => {
    res.render('../views/auth/login', { title: 'Đăng Nhập', error : null });
});

router.get('/doimatkhau/:id', (req, res) => {
    const { id } = req.params;
    res.render('../views/auth/change_password', { 
        userId: id, 
        title: 'Đổi mật khẩu' ,
        error : null
    });
});

router.put('/doimatkhau/:id', loginController.doimatkhau);

module.exports = router;
