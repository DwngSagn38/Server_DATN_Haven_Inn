var express = require('express');
var router = express.Router();

var loginRouter = require('./login_web');


router.use('/auth', loginRouter);


router.get('/home', (req, res) => {
    const message = req.session.message; // Lấy thông báo từ session
    delete req.session.message; // Xóa thông báo sau khi đã sử dụng
    res.render('home', { message: message });
});



module.exports = router;