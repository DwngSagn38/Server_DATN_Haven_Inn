const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThongBaoModel = new Schema({
    id_NguoiDung: { type: Schema.Types.ObjectId, ref: 'nguoidung' },
    tieuDe : { type : String , require : true},
    noiDung : { type : String , require : true},
    ngayGui : { type : Date},
    trangThai : { type : Boolean, default : true} // true : chưa đọc , false : đã đọc
},{
    timestamps : true
})

module.exports = mongoose.model('thongbao',ThongBaoModel)