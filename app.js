var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

var indexRouter = require('./routes/index');
var amthucRouter = require('./routes/amthuc');
var chitiethoadonRouter = require('./routes/chitiethoadon');
var couponRouter = require('./routes/coupon');
var danhgiaRouter = require('./routes/danhgia');
var dichvuRouter = require('./routes/dichvu');
var hoadonRouter = require('./routes/hoadon');
var hotroRouter = require('./routes/hotro');
var loaiphongRouter = require('./routes/loaiphong');
var loginRouter = require('./routes/login');
var nguoidungRouter = require('./routes/nguoidung');
var phongRouter = require('./routes/phong');
var thongbaoRouter = require('./routes/thongbao');
var tiennghiRouter = require('./routes/tiennghi');
var tiennghiphongRouter = require('./routes/tiennghiphong');
var YeuThichRouter = require('./routes/yeuthich');

var app = express();

var database = require('./config/db')

const methodOverride = require('method-override');

// Middleware để xử lý _method trong form
app.use(methodOverride('_method'));

const session = require('express-session');

// Cấu hình session
app.use(session({
  secret: process.env.SESSION_SECRET, // Chìa khóa để mã hóa session
  resave: false,  // Không lưu lại session nếu không có thay đổi
  saveUninitialized: true,  // Lưu session ngay cả khi chưa thay đổi
  cookie: { secure: false } // Chạy trên HTTP, nếu sử dụng HTTPS thì đặt secure: true
}));

const bodyParser = require('body-parser');

// Cấu hình EJS
app.set('views', path.join(__dirname, 'views')); // Đảm bảo đúng đường dẫn
app.set('view engine', 'ejs');



// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/amthucs', amthucRouter);
app.use('/chitiethoadons', chitiethoadonRouter);
app.use('/coupons', couponRouter);
app.use('/danhgias', danhgiaRouter);
app.use('/dichvus', dichvuRouter);
app.use('/hoadons', hoadonRouter);
app.use('/hotros', hotroRouter);
app.use('/loaiphongs', loaiphongRouter);
app.use('/login', loginRouter);
app.use('/nguoidungs', nguoidungRouter);
app.use('/phongs', phongRouter);
app.use('/thongbaos', thongbaoRouter);
app.use('/tiennghis', tiennghiRouter);
app.use('/tiennghiphongs', tiennghiphongRouter);
app.use('/yeuthichs', YeuThichRouter);

database.connect();
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
