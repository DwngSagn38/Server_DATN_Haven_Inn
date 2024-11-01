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
          return res.status(404).json({ msg: "Password chưa đúng" });
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

module.exports = router;
