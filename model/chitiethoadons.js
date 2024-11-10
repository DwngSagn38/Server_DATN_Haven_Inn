const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ChiTietHoaDonModel = new Schema({
    id_Phong : {type: Schema.Types.ObjectId, ref: 'phong', required: true},
    id_HoaDon : {type: Schema.Types.ObjectId, ref: 'hoadon', required : true},
    giaPhong : {type: Number, required: true},
    buaSang : {type: Boolean, required: true},
})

module.exports = mongoose.model("chitiethoadon",ChiTietHoaDonModel);