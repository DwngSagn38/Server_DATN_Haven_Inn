const LoaiPhongModel = require('../model/loaiphongs');
const TienNghiPhongModel = require('../model/tiennghiphongs');
const DanhGiaModel = require('../model/danhgias');
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/common/uploads");
const fs = require('fs');

exports.getListorByID = async (req, res, next) => {
    try {
        const { id } = req.query;
        
        // Xây dựng điều kiện lọc dựa trên các tham số có sẵn
        let filter = {};
        if (id) {
            filter._id = id;
        }
        const loaiphongs = await LoaiPhongModel.find(filter).sort({ createdAt: -1 });

        if (loaiphongs.length === 0) {
            return res.status(404).send({ message: 'Không tìm thấy' });
        }

        res.send(loaiphongs);

    
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Error fetching data", error: error.message });
    }
};

exports.addLoaiPhong = async (req, res) => {

    console.log("req.files:", req.files); // Log toàn bộ files

    // Kiểm tra xem có file hay không
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    try {
        const imageUrls = [];
        const imageIds = []; // Mảng lưu public_id của ảnh chính

        // Truy cập đúng trường images trong req.files
        const images = req.files.filter(file => file.fieldname === 'images');
        // console.log("Images array:", images);  // Log để kiểm tra mảng images

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

        // Tạo đối tượng mới cho LoaiPhong
        const newLoaiPhong = new LoaiPhongModel({
            ...req.body,
            hinhAnh: imageUrls,  // Lưu URL ảnh chính
            hinhAnhIDs: imageIds, // Lưu public_id ảnh chính
        });

        // Lưu vào database
        const result = await newLoaiPhong.save();

        // Trả về kết quả
        res.json({ status: 200, data: result });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ message: 'Error uploading files', error });
    }
};

exports.suaLoaiPhong = async (req, res) => {
    console.log("req.files:", req.files); // Log toàn bộ files

    // Kiểm tra xem có file hay không
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    try {
        const { id } = req.params;

        // Tìm loại phòng theo ID
        const loaiphong = await LoaiPhongModel.findById(id);
        if (!loaiphong) {
            return res.status(404).send({ message: 'Không tìm thấy loại phòng' });
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
        const result = await LoaiPhongModel.findByIdAndUpdate(
            id,
            {
                ...req.body,
                hinhAnh: imageUrls,
                hinhAnhIDs: imageIds,
            },
            { new: true } // Trả về đối tượng đã cập nhật
        );

        // Trả về kết quả
        res.send({ status: 200, data: result, message: "Update successfully" });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ message: 'Error uploading files', error });
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
        }

        const result = await LoaiPhongModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Delete successfully", result: result });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", result: error });
    }
};

exports.getLoaiPhongDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra nếu có id
        if (!id) {
            return res.status(400).send({ message: 'Thiếu id loại phòng' });
        }

        // Truy vấn thông tin loại phòng
        const loaiphong = await LoaiPhongModel.findById(id);
        if (!loaiphong) {
            return res.status(404).send({ message: 'Không tìm thấy loại phòng' });
        }

        // Truy vấn thông tin tiện nghi cho loại phòng này
        const tienNghiPhongs = await TienNghiPhongModel.find({ id_LoaiPhong: id })
            .populate({
                path: 'id_TienNghi',
                select: 'tenTienNghi image', // Lấy tên tiện nghi và hình ảnh
            });

        const tienNghiResult = tienNghiPhongs.map(item => ({
            tenTienNghi: item.id_TienNghi?.tenTienNghi,
            image: item.id_TienNghi?.image,
            moTa: item.moTa
        }));

        // Truy vấn đánh giá cho loại phòng này
        const danhgias = await DanhGiaModel.find({ id_LoaiPhong: id }).sort({ createdAt: -1 });

        // Nếu có đánh giá, trả về thông tin loại phòng cùng tiện nghi và đánh giá
        res.send({
            loaiPhong: loaiphong,
            tienNghi: tienNghiResult,
            danhGia: danhgias
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Error fetching data", error: error.message });
    }
};
