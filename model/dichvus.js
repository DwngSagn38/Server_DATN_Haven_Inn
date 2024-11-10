const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DichVuModel = new Schema({
    tenDichVu : { type : String , required : true},
    hinhAnh : { type : String},
    moTa : { type : String}
},{
    timestamps : true
})

module.exports = mongoose.model('dichvu',DichVuModel)