const express = require("express");
const router = express.Router();
const tableController = require("../controllers/tableController");

// Định nghĩa các đường dẫn API
// GET /api/admin/tables -> Lấy danh sách
router.get("/", tableController.getTables);

// POST /api/admin/tables -> Tạo bàn mới
router.post("/", tableController.createTable);

// PUT /api/admin/tables/:id -> Cập nhật bàn
router.put("/:id", tableController.updateTable);

// PATCH /api/admin/tables/:id/status -> Xóa mềm (Active/Inactive)
router.patch("/:id/status", tableController.toggleTableStatus);

router.post("/:id/qr/generate", tableController.generateQR);

router.get("/:id/qr/download", tableController.downloadQRPDF);

// Route mới cho PNG
router.get("/:id/qr/download-png", tableController.downloadQRPNG);

// Route mới để tải xuống tất cả QR code dưới dạng ZIP
router.get("/qr/download-all", tableController.downloadAllQR);

module.exports = router;
