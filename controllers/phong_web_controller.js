const PhongModel = require('../model/phongs');
const LoaiPhongModel = require('../model/loaiphongs');
const ChiTietHoaDonModel = require('../model/chitiethoadons')

exports.getListorByIdorIdPhong = async (req, res, next) => {
    try {
        const loaiphongs = await LoaiPhongModel.find();

        // Truy vấn danh sách phòng và liên kết các bảng liên quan
        const phongs = await PhongModel.find()
            .populate({
                path: 'id_LoaiPhong', // Lấy thông tin loại phòng
                select: 'tenLoaiPhong',
            })
            .lean(); // Sử dụng lean() để dữ liệu trả về có thể được chỉnh sửa

        // Lấy danh sách các `id_Phong` từ kết quả trên
        const phongIds = phongs.map(phong => phong._id);

        // Truy vấn chi tiết hóa đơn
        const chiTietHoaDons = await ChiTietHoaDonModel.find({ id_Phong: { $in: phongIds } })
            .populate({
                path: 'id_HoaDon', // Lấy thông tin hóa đơn
                select: 'ngayNhanPhong ngayTraPhong',
            })
            .lean();

        const currentDate = new Date();

        // Gắn thông tin ngày nhận phòng và trả phòng vào từng phòng
        for (const phong of phongs) {
            const chiTiet = chiTietHoaDons.find(ct => String(ct.id_Phong) === String(phong._id));

            if (chiTiet && chiTiet.id_HoaDon) {
                phong.ngayNhanPhong = chiTiet.id_HoaDon.ngayNhanPhong;
                phong.ngayTraPhong = chiTiet.id_HoaDon.ngayTraPhong;

                // Kiểm tra trạng thái phòng dựa trên ngày nhận/trả phòng
                if (new Date(phong.ngayNhanPhong) > currentDate) {
                    phong.trangThai = 2; // Khách đã đặt
                } else if (new Date(phong.ngayNhanPhong) <= currentDate && new Date(phong.ngayTraPhong) >= currentDate) {
                    phong.trangThai = 1; // Đang sử dụng
                }else{
                    phong.trangThai = 0
                }

                // Cập nhật trạng thái phòng trong database
                await PhongModel.updateOne({ _id: phong._id }, { $set: { trangThai: phong.trangThai } });
            } else {
                phong.ngayNhanPhong = null;
                phong.ngayTraPhong = null;
                phong.trangThai = 0; // Mặc định là còn trống nếu không có hóa đơn liên quan
            }
        }

        if (phongs.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy' });
        }

        const message = req.session.message; // Lấy thông báo từ session
        delete req.session.message; // Xóa thông báo sau khi đã sử dụng

        res.render('../views/phong/phongs', {
            message: message || null,
            phongs: phongs,
            loaiphongs: loaiphongs,
        });
    } catch (error) {
        console.error(error);
        res.render('../views/phong/phongs', {
            message: 'Lỗi khi lấy dữ liệu',
            phongs: [],
        });
    }
};


exports.addPhong = async (req, res, next) => {
    try {
        const data = req.body;
        const Existorphong = await PhongModel.findOne({soPhong : data.soPhong});
        if(Existorphong){
            req.session.message = "Số phòng đã tồn tại!";
            return res.redirect('/web/phongs');
        }

        const phong = new PhongModel({
            soPhong: data.soPhong,
            id_LoaiPhong: data.id_LoaiPhong,
            VIP: data.VIP,
            trangThai: data.trangThai,
        })

        await phong.save();

        req.session.message = "Thêm thành công!";
        // Trả về kết quả
        res.redirect('/web/phongs');

    } catch (error) {
        console.error(error);
        res.render('../views/phong/phongs', {
            message: 'Lỗi khi lấy dữ liệu',
            phongs: [],
        });
    }
}

exports.suaPhong = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const phong = await PhongModel.findOne({_id : id});
        if(phong.trangThai !== 0){
            req.session.message = "Phòng có khách đặt không thể sửa!";
            // Trả về kết quả
            return res.redirect('/web/phongs');
        }
        // Sử dụng findByIdAndUpdate để tìm và cập nhật dữ liệu
        await PhongModel.findByIdAndUpdate(id, data, { new: true });

        req.session.message = "Sửa thành công!";
        // Trả về kết quả
        res.redirect('/web/phongs');

    } catch (error) {
        console.error(error);
        res.render('../views/phong/phongs', {
            message: 'Lỗi khi lấy dữ liệu',
            loaiphongs: [],
        });
    }
}

exports.xoaPhong = async (req, res, next) => {
    try {
        const { id } = req.params;
        await PhongModel.findByIdAndDelete(id); // Xóa phòng
        req.session.message = 'Xóa thành công';
        res.redirect('/web/phongs'); // Điều hướng lại danh sách phòng
    } catch (error) {
        console.error(error);
        req.session.message = 'Lỗi khi xóa phòng';
        res.redirect('/web/phongs');
    }
}

exports.getTrangThai = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Lấy thông tin trạng thái của phòng từ database
        const chiTietHoaDons = await ChiTietHoaDonModel.find({ id_Phong: id })
            .populate('id_HoaDon', 'ngayNhanPhong ngayTraPhong')
            .lean();

            // console.log('chi tiet hoa don', chiTietHoaDons)
        
        // Tạo một mảng ngày từ ngày nhận phòng đến ngày trả phòng
        const calendarData = chiTietHoaDons.map(chiTiet => {
            const startDate = new Date(chiTiet.id_HoaDon.ngayNhanPhong);
            const endDate = new Date(chiTiet.id_HoaDon.ngayTraPhong);
            const events = [];

            // Thêm các ngày từ ngày nhận phòng đến ngày trả phòng vào mảng events
            for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
                events.push({
                    title: 'Có khách', // Hoặc thay đổi tên sự kiện theo ý bạn
                    start: new Date(date),
                    end: new Date(date),
                    description: 'Phòng đã được đặt',
                    color: 'red' // Màu sắc sự kiện (có thể thay đổi)
                });
            }

            return events;
        }).flat(); // Dùng flat() để làm phẳng mảng nếu có nhiều phòng

        // console.log('====================================');
        // console.log(calendarData);
        // console.log('====================================');
        res.json(calendarData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu trạng thái phòng' });
    }
}
