const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ChiTietHoaDonModel = new Schema({
    id_Phong : {type: Schema.Types.ObjectId, ref: 'phong', require: true},
    id_HoaDon : {type: Schema.Types.ObjectId, ref: 'hoadon', required : true},
    giaPhong : {type: Number, require: true},
    buaSang : {type: Boolean, require: true},
})

module.exports = mongoose.model("chitiethoadon",ChiTietHoaDonModel);