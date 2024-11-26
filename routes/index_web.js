var express = require('express');
var router = express.Router();

var loginRouter = require('./login_web');
var dichVuRouter = require('./dichvu_web');
var tienNghiRouter = require('./tiennghi_web');
var amThucRouter = require('./amthuc_web');
var hoTroRouter = require('./hotro_web');
var loaiphongRouter = require('./loaiphong_web');
var phongRouter = require('./phong_web');


router.use('/auth', loginRouter);
router.use('/dichvus', dichVuRouter);
router.use('/tiennghis', tienNghiRouter);
router.use('/amthucs', amThucRouter);
router.use('/hotros', hoTroRouter);
router.use('/loaiphongs', loaiphongRouter);
router.use('/phongs', phongRouter);


const authMiddleware = require('../middleware/authMiddleware');

router.get('/home', authMiddleware('html'), (req, res) => {
    // const message = req.session.message;
    // delete req.session.message;

    const message = req.flash('message');
    res.render('home', { message: message });
});



module.exports = router;