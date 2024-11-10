const express = require('express');
const router = express.Router();
const TienNghiModel = require('../model/tiennghis');

// GET list
router.get('/', async (req, res) => {
    try {
        const tienNghis = await TienNghiModel.find().sort({ createdAt: -1 });
        res.status(200).json(tienNghis);
    } catch (error) {
        res.status(500).json({ status: 500, msg: "Error fetching data", error: error.message });
    }
});

// DELETE
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await TienNghiModel.findByIdAndDelete(id);

        if (result) {
            res.status(200).json({
                status: 200,
                msg: "Delete success",
                data: result
            });
        } else {
            res.status(404).json({
                status: 404,
                msg: "Delete fail, item not found",
                data: []
            });
        }
    } catch (error) {
        res.status(500).json({ status: 500, msg: "Error deleting data", error: error.message });
    }
});

// POST - add
router.post('/post', async (req, res) => {
    try {
        const { tenTienNghi, moTa, icon } = req.body;
        const tiennghi = new TienNghiModel({ tenTienNghi, moTa, icon });
        const result = await tiennghi.save();

        res.status(201).json({
            status: 201,
            msg: "Add success",
            data: result
        });
    } catch (error) {
        res.status(500).json({ status: 500, msg: "Add fail", error: error.message });
    }
});

// PUT - update
router.put('/put/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Tìm và cập nhật
        const result = await TienNghiModel.findByIdAndUpdate(id, data, { new: true });

        if (result) {
            res.status(200).json({
                status: 200,
                msg: "Update success",
                data: result
            });
        } else {
            res.status(404).json({
                status: 404,
                msg: "Update fail, item not found",
                data: []
            });
        }
    } catch (error) {
        res.status(500).json({ status: 500, msg: "Update fail", error: error.message });
    }
});

module.exports = router;
