const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

const indexAPIRouter = require('./routes/index_api');
const indexWEBRouter = require('./routes/index_web');
const database = require('./config/db');

const session = require("express-session");
const { createClient } = require("redis");
const { RedisStore } = require("connect-redis");

const app = express();
const PORT = process.env.PORT || 3000;

// Khởi tạo Redis client
let redisClient = createClient({
  url: process.env.REDIS_URL, // Thay URL bằng của bạn
  legacyMode: false,
  socket: {
    connectTimeout: 10000,
  },
});

redisClient.connect().catch(console.error);
redisClient.on("connect", () => console.log("Connected to Redis successfully"));
redisClient.on("error", (err) => console.error("Redis connection error:", err));


// Khởi tạo RedisStore
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "haveninn:", // Tiền tố cho key trong Redis
});

// Cấu hình session
app.use(
  session({
    store: redisStore,
    resave: false, // Không lưu lại session nếu không thay đổi
    saveUninitialized: false, // Không lưu session nếu không có dữ liệu
    secret: process.env.SESSION_SECRET || "sang",
    cookie: {
      secure: false, // true nếu ứng dụng sử dụng HTTPS
      httpOnly: true, // Bảo vệ khỏi XSS
      maxAge: 3600000, // Thời gian hết hạn cookie (1 giờ)
    },
  })
);

const methodOverride = require('method-override');

// Middleware để xử lý _method trong form
app.use(methodOverride('_method'));

const bodyParser = require('body-parser');

// Cấu hình EJS
app.set('views', path.join(__dirname, 'views')); // Đảm bảo đúng đường dẫn
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')))

// Hoặc nếu muốn hỗ trợ cả JSON và x-www-form-urlencoded:
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route example
app.get('/', (req, res) => {
  res.render('./views/auth/login');
});

// Khởi động server
app.listen(PORT, async () => {
  console.log(`Server đang chạy `);

  // const open = (await import('open')).default;
  // await open(`https://server-datn-haven-inn.onrender.com/web/auth/login`);
});

app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}, Method: ${req.method}`);
  next();
});

const flash = require('connect-flash');
app.use(flash());

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
