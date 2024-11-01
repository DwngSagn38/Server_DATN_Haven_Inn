const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AmThucModel = new Schema({
    tenNhaHang : { type : String , require : true},
    hinhAnh : { type : String},
    moTa : { type : String},
    menu : { type : String},
    gioMoCua : { type : Date},
    gioDongCua : { type : Date},
},{
    timestamps : true
})

module.exports = mongoose.model('amthuc',AmThucModel)