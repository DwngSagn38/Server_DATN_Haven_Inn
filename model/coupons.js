const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CouponModel = new Schema({
    maGiamGia : { type : String , require : true, unique : true},
    giamGia : { type : Number, require : true},
    giamGiaToiDa : { type : Number},
    dieuKienToiThieu : { type : Number},
    ngayBatDau : { type : Date},
    ngayHetHan : { type : Date},
    trangThai : { type : Number}, // chua su dung, da su dung, het han
},{
    timestamps : true
})

module.exports = mongoose.model('coupon',CouponModel)