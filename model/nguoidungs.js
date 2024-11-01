const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NguoiDungModel = new Schema({
    tenNguoiDung : { type : String , require : true},
    soDienThoai : { type : String, require : true, unique : true, maxlength: 10 },
    matKhau : { type : String, require : true},
    email : { type : String},
    hinhAnh : { type : String},
    chucVu : { type : Number, default : 0}, 
    trangThai : { type : Boolean},
},{
    timestamps : true
})

module.exports = mongoose.model('nguoidung',NguoiDungModel)