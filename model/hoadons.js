const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HoaDonModel = new Schema({
    id_NguoiDung: { type: Schema.Types.ObjectId, ref: 'nguoidung' },
    id_Coupon: { type: Schema.Types.ObjectId, ref: 'coupon' },
    ngayNhanPhong : { type : Date },
    ngayTraPhong : { type : Date },
    tongPhong : { type : Number, },
    tongKhach : { type : Number, },
    tongTien : { type : Number, },
    ngayThanhToan : { type : Date, },
    phuongThucThanhToan : { type : String, },
    trangThai : { type : Number, required : true, default : 3}, // chua thanh toan, da thanh toan, bi huy
    ghiChu : { type : String, },
},{
    timestamps : true
})

module.exports = mongoose.model('hoadon',HoaDonModel)