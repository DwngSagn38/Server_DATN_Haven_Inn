const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoaiPhongModel = new Schema({
    tenLoaiPhong : { type : String , require : true},
    giuong : { type : String, require : true},
    soLuongKhach : { type : Number, require : true},
    dienTich : { type : Number, require : true},
    giaTien : { type : Number, require : true},
    hinhAnh : { type : String, require : true},
    moTa : { type : String},
    trangThai : { type : Boolean},
},{
    timestamps : true
})

module.exports = mongoose.model('loaiphong',LoaiPhongModel)