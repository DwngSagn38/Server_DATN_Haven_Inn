const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NguoiDungModel = new Schema({
    tenNguoiDung : { type : String , required : true},
    soDienThoai : { type : String, required : true, unique : true, maxlength: 10 },
    matKhau : { type : String, required : true},
    email : { type : String},
    hinhAnh : { type : String},
    hinhAnhID: { type : String},
    chucVu : { type : Number, default : 0}, 
    trangThai : { type : Boolean, default : true},
},{
    timestamps : true
})

module.exports = mongoose.model('nguoidung',NguoiDungModel)