const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const TienNghiPhongModel = new Schema({
    id_Phong : {type: Schema.Types.ObjectId, ref: 'phong', require: true},
    id_TienNghi : {type: Schema.Types.ObjectId, ref: 'tiennghi', required : true},
})

module.exports = mongoose.model("tiennghiphong",TienNghiPhongModel);