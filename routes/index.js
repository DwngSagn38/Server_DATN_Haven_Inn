var express = require('express');
const { default: routerImages } = require('../config/common/uploads');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
