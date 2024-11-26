const LoaiPhongModel = require('../model/loaiphongs');
const TienNghiModel = require('../model/tiennghis');
const TienNghiPhongModel = require('../model/tiennghiphongs');
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/common/uploads");
const fs = require('fs');
const PhongModel = require('../model/phongs'); // Đường dẫn đến model phong
const { formatCurrencyVND } = require('./utils');


exports.getListorByID = async (req, res, next) => {
    try {
        const { id } = req.query;

        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};
        if (id) {
            filter._id = id;
        }

        const tiennghis = await TienNghiModel.find({});
        // Lấy danh sách loaiphongs
        const loaiphongs = await LoaiPhongModel.find(filter).sort({ createdAt: -1 });

        if (loaiphongs.length === 0) {
            return res.render('../views/loaiphong/loaiphongs', {
                message: 'Không tìm thấy loại phòng',
                loaiphongs: []
            });
        }

        // Tính tổng số phòng theo id_LoaiPhong
        const phongCounts = await PhongModel.aggregate([
            { $group: { _id: "$id_LoaiPhong", totalPhong: { $sum: 1 } } }
        ]);

        // Map tổng số phòng vào từng loaiphong
        const loaiphongsWithCounts = loaiphongs.map((loaiphong) => {
            const phongCount = phongCounts.find(
                (count) => count._id.toString() === loaiphong._id.toString()
            );

            // Format giá tiền
            const formattedGiaTien = formatCurrencyVND(loaiphong.giaTien);


            return {
                ...loaiphong.toObject(),
                giaTien: formattedGiaTien,
                totalPhong: phongCount ? phongCount.totalPhong : 0
            };
        });

        const message = req.session.message; // Lấy thông báo từ session
        delete req.session.message; // Xóa thông báo sau khi đã sử dụng

        res.render('../views/loaiphong/loaiphongs', {
            message: message || null,
            loaiphongs: loaiphongsWithCounts,
            tiennghis
        });
    } catch (error) {
        console.error(error);
        res.render('../views/loaiphong/loaiphongs', {
            message: 'Lỗi khi lấy dữ liệu',
            loaiphongs: []
        });
    }
};



exports.addLoaiPhong = async (req, res) => {
    try {
        const imageUrls = [];
        const imageIds = []; // Mảng lưu public_id của ảnh chính

        // Truy cập đúng trường images trong req.files
        const images = req.files.filter(file => file.fieldname === 'images');

        // Kiểm tra và xử lý từng file trong mảng images
        if (images.length > 0) {  // Kiểm tra nếu có file images
            for (const file of images) {
                const filePath = file.path;
                const result = await uploadToCloudinary(filePath); // Upload ảnh
                imageUrls.push(result.secure_url);  // Lưu URL ảnh
                imageIds.push(result.public_id);    // Lưu public_id của ảnh
                await fs.promises.unlink(filePath);  // Xóa file đã upload
            }
        }


        // Xử lý tiện nghi
        let selectedTienNghi = [];
        console.log("tien nghi select : ", req.body)
        if (req.body.tienNghi) {
            try {
                selectedTienNghi = JSON.parse(req.body.tienNghi);
                console.log("Parsed amenities:", selectedTienNghi);
            } catch (error) {
                console.error("Error parsing JSON:", error);
                selectedTienNghi = [];
            }
        }

        // Tạo đối tượng mới cho LoaiPhong
        const newLoaiPhong = new LoaiPhongModel({
            ...req.body,
            hinhAnh: imageUrls,
            hinhAnhIDs: imageIds,
            // tienNghi: selectedTienNghi, // Lưu danh sách tiện nghi đã chọn
        });

        // Lưu vào database
        await newLoaiPhong.save();


        // Cập nhật tiện nghi phòng trong database (nếu cần)
        for (const tienNghiId of selectedTienNghi) {
            const newTienNghiPhong = new TienNghiPhongModel({
                id_LoaiPhong: newLoaiPhong._id,
                id_TienNghi: tienNghiId,
                moTa:"",
            });
            await newTienNghiPhong.save();

            console.log("tiennghiphong : ", newTienNghiPhong)
        }

        // Đưa thông báo và chuyển hướng về trang loaiphongs
        req.session.message = "Thêm loại phòng thành công!";
        res.redirect('/web/loaiphongs');
    } catch (error) {
        console.error('Error uploading files:', error);
        res.render('../views/loaiphong/loaiphongs', {
            message: 'Lỗi khi thêm loại phòng.',
            loaiphongs: []
        });
    }
};


exports.suaLoaiPhong = async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm loại phòng theo ID
        const loaiphong = await LoaiPhongModel.findById(id);
        if (!loaiphong) {
            return res.render('../views/loaiphong/loaiphongs', {
                message: 'Không tìm thấy loại phòng',
                loaiphongs: []
            });
        }

        // Khởi tạo giá trị hình ảnh từ loại phòng hiện tại
        let imageUrls = loaiphong.hinhAnh || [];
        let imageIds = loaiphong.hinhAnhIDs || [];

        // Lọc file upload mới
        const images = req.files.filter(file => file.fieldname === 'images');
        console.log("New images:", images); // Log kiểm tra ảnh mới

        if (images.length > 0) {
            // Xóa các ảnh cũ trên Cloudinary
            for (const publicId of imageIds) {
                await deleteFromCloudinary(publicId);
            }

            // Reset giá trị URL và public_id
            imageUrls = [];
            imageIds = [];

            // Upload các file mới lên Cloudinary
            for (const file of images) {
                const filePath = file.path;
                const result = await uploadToCloudinary(filePath); // Upload ảnh
                imageUrls.push(result.secure_url);  // Lưu URL ảnh
                imageIds.push(result.public_id);    // Lưu public_id ảnh
                await fs.promises.unlink(filePath);  // Xóa file đã upload
            }
        }

        // Cập nhật loại phòng
        await LoaiPhongModel.findByIdAndUpdate(
            id,
            {
                ...req.body,
                hinhAnh: imageUrls || loaiphong.hinhAnh,
                hinhAnhIDs: imageIds || loaiphong.hinhAnhIDs,
            },
            { new: true } // Trả về đối tượng đã cập nhật
        );

        // Trả về kết quả
        req.session.message = "Sửa thành công!";
        // Trả về kết quả
        res.redirect('/web/loaiphongs');
    } catch (error) {
        console.error('Error uploading files:', error);
        res.render('../views/loaiphong/loaiphongs', {
            message: 'Lỗi khi lấy dữ liệu',
            loaiphongs: []
        });
    }
};

exports.xoaLoaiPhong = async (req, res) => {
    try {
        const id = req.params.id;
        const LoaiPhong = await LoaiPhongModel.findById(id);

        // Kiểm tra xem món ăn có ảnh hay không
        if (LoaiPhong) {
            const imageIds = LoaiPhong.hinhAnhIDs;  // Lấy public_id ảnh chính

            // Xóa các ảnh khỏi Cloudinary
            if (imageIds && imageIds.length > 0) {
                for (const publicId of imageIds) {
                    await deleteFromCloudinary(publicId);
                }
            }

            // if (LoaiPhong.hinhAnhIDs.length > 0) {
            //     await Promise.all(LoaiPhong.hinhAnhIDs.map(id => deleteFromCloudinary(id)));
            // }
        }

        await LoaiPhongModel.findByIdAndDelete(id);
        req.session.message = "Xóa thành công!";
        res.redirect('/web/loaiphongs');
    } catch (error) {
        res.render('../views/loaiphong/loaiphongs', {
            message: 'Lỗi khi lấy dữ liệu',
            loaiphongs: []
        });
    }
};


exports.getLoaiPhongDetails = async (req, res) => {
    try {
        // Lấy thông tin loại phòng theo ID
        const { id } = req.params;  // ID loại phòng được truyền từ frontend
        const loaiPhong = await LoaiPhongModel.findById(id);

        if (!loaiPhong) {
            return res.status(404).send("LoaiPhong not found");
        }

        // Lấy thông tin tiện nghi cho loại phòng này
        const tienNghiPhong = await TienNghiPhongModel.find({ id_LoaiPhong: id })
            .populate('id_TienNghi'); // Lấy thông tin tiện nghi từ TienNghiModel

        // Nếu không có tiện nghi cho loại phòng
        const tienNghiDetails = tienNghiPhong.map(item => ({
            tenTienNghi: item.id_TienNghi.tenTienNghi,
            image: item.id_TienNghi.image,
            moTa: item.moTa,
        }));

        // Trả về thông tin loại phòng và tiện nghi
        res.json({
            tenLoaiPhong: loaiPhong.tenLoaiPhong,
            giuong: loaiPhong.giuong,
            soLuongKhach: loaiPhong.soLuongKhach,
            dienTich: loaiPhong.dienTich,
            giaTien: loaiPhong.giaTien,
            moTa: loaiPhong.moTa,
            hinhAnh: loaiPhong.hinhAnh,
            tienNghi: tienNghiDetails,  // Danh sách tiện nghi
        });
    } catch (error) {
        console.error('Error fetching loaiPhong details:', error);
        res.status(500).send('Internal Server Error');
    }
};
