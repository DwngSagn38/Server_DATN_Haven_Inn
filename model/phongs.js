const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhongModel = new Schema({
    soPhong : { type : String , required : true},
    id_LoaiPhong: { type: Schema.Types.ObjectId, ref: 'loaiphong' },
    VIP : { type : Boolean, default : false},
    trangThai : { type : Number, required : true},
},{
    timestamps : true
})

module.exports = mongoose.model('phong',PhongModel)