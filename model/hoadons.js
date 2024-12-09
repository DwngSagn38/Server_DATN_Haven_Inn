const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HoaDonModel = new Schema({
    id_NguoiDung: { type: Schema.Types.ObjectId, ref: 'nguoidung' },
    id_Coupon: { type: Schema.Types.ObjectId, ref: 'coupon' },
    ngayNhanPhong : { type : Date, required : true },
    ngayTraPhong : { type : Date, required : true },
    tongPhong : { type : Number, },
    tongKhach : { type : Number, },
    tongTien : { type : Number, },
    ngayThanhToan : { type : Date, },
    phuongThucThanhToan : { type : String, },
    trangThai : { type : Number, required : true, default : 3}, // 0 chua thanh toan, 1 da thanh toan, 2 bi huy
    ghiChu : { type : String },
    giamGia : { type : Number }
},{
    timestamps : true
})

module.exports = mongoose.model('hoadon',HoaDonModel)

