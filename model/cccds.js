const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CccdModel  = new Schema({
    nguoiDung: {
        type: Schema.Types.ObjectId,
        ref: 'nguoidung', // Liên kết với bảng Người dùng (NguoiDungModel)
        required: true
    },
    soCCCD : { type : String},
    ngayCap : { type : String},
    noiCap : { type : String},
    anhMatTruoc : { type : String},
    anhMatTruocId : { type : String},
    anhMatSau : { type : String},
    anhMatSauId : { type : String},
},{
    timestamps : true
})

module.exports = mongoose.model('cccd',CccdModel )