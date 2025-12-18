const Table = require("../models/Table");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const archiver = require("archiver");

// 1. Tạo bàn mới
exports.createTable = async (req, res) => {
  try {
    const { table_number, capacity, location, description } = req.body;

    // Check trùng số bàn
    const existingTable = await Table.findOne({ table_number });
    if (existingTable) {
      return res.status(400).json({ message: "Table number already exists" });
    }

    const newTable = new Table({
      table_number,
      capacity,
      location,
      description,
    });
    await newTable.save();
    res.status(201).json(newTable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Lấy danh sách (kèm Filter)
exports.getTables = async (req, res) => {
  try {
    const { status, location } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (location) filter.location = location;

    // Sort theo số bàn
    const tables = await Table.find(filter).sort({ table_number: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Cập nhật thông tin bàn
exports.updateTable = async (req, res) => {
  try {
    const { table_number, capacity, location, description } = req.body;
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { table_number, capacity, location, description },
      { new: true, runValidators: true }
    );
    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Soft Delete / Reactivate (Đổi trạng thái)
exports.toggleTableStatus = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    // Đảo ngược trạng thái hiện tại
    table.status = table.status === "active" ? "inactive" : "active";

    await table.save();
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//5 Tạo / Tái tạo QR Code (Regenerate)
exports.generateQR = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    // Tạo JWT Token chứa ID bàn và thời gian tạo
    // Token này sẽ hết hạn hoặc bị vô hiệu hóa khi tạo token mới (do lưu đè vào DB)
    const token = jwt.sign(
      {
        tableId: table._id,
        restaurantId: process.env.RESTAURANT_ID || "DEFAULT_RES",
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET
    );

    // Lưu token mới vào DB -> Token cũ lập tức vô hiệu (Invalidation Logic)
    table.qr_token = token;
    table.qr_token_created_at = new Date(); // Lưu timestamp
    await table.save();

    // Tạo URL đầy đủ cho khách hàng quét
    // Ví dụ: http://localhost:5173/menu?table=xxx&token=yyy
    const scanUrl = `${process.env.FRONTEND_URL}/menu?table=${table._id}&token=${token}`;

    res.json({
      message: "QR Code generated successfully",
      qr_token: token,
      scanUrl: scanUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Tải PDF để in ấn
exports.downloadQRPDF = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table || !table.qr_token) {
      return res.status(404).json({
        message: "Table or QR Token not found. Please generate QR first.",
      });
    }

    // Tái tạo lại URL từ token trong DB
    const scanUrl = `${process.env.FRONTEND_URL}/menu?table=${table._id}&token=${table.qr_token}`;

    // Tạo QR code dưới dạng hình ảnh (Data URL)
    const qrImage = await QRCode.toDataURL(scanUrl);

    // Khởi tạo PDF
    const doc = new PDFDocument({ size: "A6", margin: 50 }); // Khổ A6 nhỏ gọn

    // Thiết lập Header phản hồi để trình duyệt tải file về
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Table-${table.table_number}.pdf`
    );

    doc.pipe(res); // Ghi dữ liệu PDF trực tiếp vào response

    // --- Thiết kế nội dung PDF ---
    // 1. Viền trang trí
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

    // 2. Tiêu đề
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("SCAN TO ORDER", { align: "center" });
    doc.moveDown(0.5);

    // 3. Số bàn
    doc.fontSize(16).text(`Table: ${table.table_number}`, { align: "center" });
    doc.moveDown(1);

    // 4. Hình QR Code
    doc.image(qrImage, {
      fit: [200, 200],
      align: "center",
      valign: "center",
    });

    // 5. Footer / Hướng dẫn
    doc.moveDown(8); // Đẩy xuống dưới
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Use your camera to scan menu", { align: "center" });
    doc.text("Free WiFi: SmartRes_Guest", { align: "center" });

    doc.end(); // Kết thúc file
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

// 7. Tải QR dạng ảnh PNG
exports.downloadQRPNG = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table || !table.qr_token) {
      return res.status(404).json({ message: "Table or QR Token not found." });
    }

    // Lấy URL cần mã hóa
    const scanUrl = `${process.env.FRONTEND_URL}/menu?table=${table._id}&token=${table.qr_token}`;

    // Thiết lập Header để trình duyệt hiểu đây là file tải về
    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=QR-Table-${table.table_number}.png`
    );

    // Tạo luồng ảnh PNG và gửi trực tiếp về Client
    // width: 500 giúp ảnh sắc nét (High Resolution)
    await QRCode.toFileStream(res, scanUrl, { width: 500, margin: 2 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating PNG" });
  }
};

// Thêm hàm này vào cuối file
exports.downloadAllQR = async (req, res) => {
  try {
    const tables = await Table.find({
      status: "active",
      qr_token: { $ne: null },
    });
    if (tables.length === 0)
      return res
        .status(404)
        .json({ message: "No active tables with QR codes" });

    const archive = archiver("zip", { zlib: { level: 9 } });

    res.attachment("All_Table_QRs.zip"); // Tự động set header tải file
    archive.pipe(res);

    for (const table of tables) {
      const url = `${process.env.FRONTEND_URL}/menu?table=${table._id}&token=${table.qr_token}`;
      // Dùng toBuffer thay vì toDataURL để nén nhanh hơn
      const buffer = await QRCode.toBuffer(url);
      archive.append(buffer, { name: `Table-${table.table_number}.png` });
    }

    await archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating zip" });
  }
};
