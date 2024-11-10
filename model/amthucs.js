const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AmThucModel = new Schema({
    tenNhaHang: { type: String, required: true },
    hinhAnh: { type: [String] },  // Lưu danh sách URL ảnh
    moTa: { type: String },
    menu: { type: String },  // Lưu URL của file PDF menu
    gioMoCua: { type: String },  // Giờ mở cửa
    gioDongCua: { type: String },  // Giờ đóng cửa
}, {
    timestamps: true
});

module.exports = mongoose.model('AmThuc', AmThucModel);
