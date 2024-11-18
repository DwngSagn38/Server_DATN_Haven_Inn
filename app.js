var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

var indexAPIRouter = require('./routes/index_api');
var indexWEBRouter = require('./routes/index_web');

var app = express();
const PORT = process.env.PORT || 3000;

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

// Route example
app.get('/', (req, res) => {
  res.render('index');
});


// Khởi động server
app.listen(PORT, async () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);

  // // Sử dụng dynamic import để mở trình duyệt
  // const open = (await import('open')).default;
  // await open(`http://localhost:${PORT}/web/auth/login`);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexAPIRouter);
app.use('/web', indexWEBRouter);

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
