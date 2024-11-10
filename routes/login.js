const express = require("express");
const router = express.Router();

const NguoiDungModel = require("../model/nguoidungs");

router.post("/", async (req, res) => {
  const { soDienThoai , matKhau } = req.query;
  if (!soDienThoai) {
    res.status(401).json({ msg: "Chưa nhập số điện thoại" });
  } else {
    try {
      const nguoidung = await NguoiDungModel.findOne({ soDienThoai: soDienThoai });
      if (!nguoidung) {
        return res
          .status(404)
          .json({ msg: "Số điện thoại chưa đăng ký tài khoản!" });
      } else {
        if (nguoidung.matKhau != matKhau) {
          return res.status(404).json({ msg: "matKhau chưa đúng" });
        }
        nguoidung.matKhau = null;
        return res.json({
          status: 200,
          msg: "Login success",
          data: nguoidung,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi server");
    }
  }
});

router.put('/doimatkhau/:id', async (req,res) => {
  const {id} = req.params;
  const {matKhauCu, matKhauMoi} = req.body;
  const nguoidung = await NguoiDungModel.findById(id);
  if(nguoidung != null){

      if(matKhauCu != nguoidung.matKhau){
          return res
        .status(404)
        .json({ msg: "Mật khẩu không chính xác!" });
      }

      if(matKhauMoi == null || matKhauMoi == undefined){
          return res
        .status(403)
        .json({ msg: "Chưa nhập mật khẩu mới" });
      }

      const result = await NguoiDungModel.findByIdAndUpdate(id,{matKhau: matKhauMoi}, {new : true});
      if(result){
          return res
          .status(200)
          .json({ msg: "Đổi mật khẩu thành công, vui lòng đăng nhập lại" });
      }else{
          return res
          .status(404)
          .json({ msg: "Đổi mật khẩu không thành công" });
      } 
  }
})

module.exports = router;
