const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HoaDonModel = new Schema({
    id_NguoiDung: { type: Schema.Types.ObjectId, ref: 'nguoidung' },
    id_Coupon: { type: Schema.Types.ObjectId, ref: 'coupon' },
    ngayNhanPhong : { type : Date , required : true},
    ngayTraPhong : { type : Date , required : true},
    soLuongKhach : { type : Number, required : true},
    soLuongPhong : { type : Number, required : true},
    ngayThanhToan : { type : Date, required : true},
    phuongThucThanhToan : { type : String, required : true},
    trangThai : { type : Number, required : true}, // chua thanh toan, da thanh toan, bi huy
    ghiChu : { type : String, required : true},
},{
    timestamps : true
})

module.exports = mongoose.model('hoadon',HoaDonModel)