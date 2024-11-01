const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhongModel = new Schema({
    soPhong : { type : String , require : true},
    id_LoaiPhong: { type: Schema.Types.ObjectId, ref: 'loaiphong' },
    trangThai : { type : Number, require : true},
},{
    timestamps : true
})

module.exports = mongoose.model('phong',PhongModel)