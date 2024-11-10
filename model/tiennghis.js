const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TienNghiModel = new Schema({
    tenTienNghi : { type : String , required : true},
    icon : { type : String},
    moTa : { type : String}
},{
    timestamps : true
})

module.exports = mongoose.model('tiennghi',TienNghiModel)