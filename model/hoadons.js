const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HoaDonModel = new Schema({
    id_NguoiDung: { type: Schema.Types.ObjectId, ref: 'nguoidung' },
    id_Coupon: { type: Schema.Types.ObjectId, ref: 'coupon' },
    ngayNhanPhong : { type : Date , require : true},
    ngayTraPhong : { type : Date , require : true},
    soLuongKhach : { type : Number, require : true},
    soLuongPhong : { type : Number, require : true},
    ngayThanhToan : { type : Date, require : true},
    phuongThucThanhToan : { type : String, require : true},
    trangThai : { type : Number, require : true}, // chua thanh toan, da thanh toan, bi huy
    ghiChu : { type : String, require : true},
},{
    timestamps : true
})

module.exports = mongoose.model('hoadon',HoaDonModel)