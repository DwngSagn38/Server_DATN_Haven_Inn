var express = require('express');
var router = express.Router();

var loginRouter = require('./login_web');
var dichVuRouter = require('./dichvu_web');
var tienNghiRouter = require('./tiennghi_web');


router.use('/auth', loginRouter);
router.use('/dichvus', dichVuRouter);
router.use('/tiennghis', tienNghiRouter);


router.get('/home', (req, res) => {
    const message = req.session.message; // Lấy thông báo từ session
    delete req.session.message; // Xóa thông báo sau khi đã sử dụng
    res.render('home', { message: message });
});



module.exports = router;