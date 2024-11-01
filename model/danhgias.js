const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DanhGiaModel = new Schema({
    id_NguoiDung: { type: Schema.Types.ObjectId, ref: 'nguoidung' },
    id_LoaiPhong: { type: Schema.Types.ObjectId, ref: 'loaiphong' },
    soDiem : { type : Number , require : true},
    binhLuan : { type : String}
},{
    timestamps : true
})

module.exports = mongoose.model('danhgia',DanhGiaModel)