const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Middleware
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Cho phép đọc dữ liệu JSON gửi lên

// Kết nối MongoDB
const uri = process.env.MONGO_URI;
function parseUriInfo(u) {
  try {
    const parsed = new URL(u);
    return {
      user: parsed.username || "(none)",
      host: parsed.hostname || "(unknown)",
      db: (parsed.pathname || "").replace("/", "") || "(none)",
    };
  } catch (e) {
    const m = (u || "").match(
      /mongodb(?:\+srv)?:\/\/(?:(.*?):(.*?)@)?([^/]+)\/(.*?)($|\?)/
    );
    if (m)
      return {
        user: m[1] || "(none)",
        host: m[3] || "(unknown)",
        db: m[4] || "(none)",
      };
    return { user: "(unknown)", host: "(unknown)", db: "(unknown)" };
  }
}
const info = parseUriInfo(uri);
console.log(
  `Attempting MongoDB connection as ${info.user}@${info.host}/${info.db}`
);

mongoose
  .connect(uri)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error(
      "❌ MongoDB Connection Error:",
      err && err.message ? err.message : err
    );
  });

// Routes
// Định tuyến tất cả request bắt đầu bằng /api/admin/tables vào file route riêng
app.use("/api/admin/tables", require("./routes/tableRoutes"));

// Route kiểm tra server sống hay chết
app.get("/", (req, res) => {
  res.send("Smart Restaurant API is running...");
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
