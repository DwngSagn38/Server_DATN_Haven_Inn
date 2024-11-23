const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NguoiDungModel = new Schema({
    tenNguoiDung : { type : String , required : true},
    soDienThoai : { type : String, maxlength: 10 },
    matKhau : { type : String, required : true},
    email : { type : String, required : true},
    hinhAnh : { type : String},
    hinhAnhID: { type : String},
    chucVu : { type : Number, default : 0}, 
    trangThai : { type : Boolean, default : true},
    cccd: { 
        type: Schema.Types.ObjectId, 
        ref: 'cccd' // Liên kết với bảng CCCD
    }
},{
    timestamps : true
})

module.exports = mongoose.model('nguoidung',NguoiDungModel)

