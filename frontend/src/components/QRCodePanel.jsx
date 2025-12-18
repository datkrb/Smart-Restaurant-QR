import React, { useState } from "react";
import QRCode from "react-qr-code";
import axios from "axios";
import { FiRefreshCw, FiDownload, FiPrinter, FiImage } from "react-icons/fi";

const QRCodePanel = ({ table, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  // URL mẫu (Frontend)
  const frontendUrl = window.location.origin;
  // Nếu bàn đã có token, tạo link hoàn chỉnh. Nếu chưa, để chuỗi rỗng.
  const qrValue = table.qr_token
    ? `${frontendUrl}/menu?table=${table._id}&token=${table.qr_token}`
    : "";

  // Hàm gọi API tạo lại QR (Regenerate)
  const handleRegenerate = async () => {
    if (table.qr_token) {
      const confirm = window.confirm(
        "Warning: Regenerating will invalidate the old QR code. Customers scanning the old code will see an error. Continue?"
      );
      if (!confirm) return;
    }

    setLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/admin/tables/${table._id}/qr/generate`
      );
      // Gọi callback để báo Component cha (TableManagement) tải lại dữ liệu mới nhất
      onUpdate();
    } catch (error) {
      alert("Error generating QR");
    } finally {
      setLoading(false);
    }
  };

  // Hàm tải PDF
  const handleDownloadPDF = () => {
    // Mở tab mới tới endpoint download của Backend
    window.open(
      `http://localhost:5000/api/admin/tables/${table._id}/qr/download`,
      "_blank"
    );
  };

  const handleDownloadPNG = () => {
    // Gọi thẳng vào API Backend để trình duyệt tự tải file về
    window.open(
      `http://localhost:5000/api/admin/tables/${table._id}/qr/download-png`,
      "_blank"
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
      {/* Khu vực hiển thị QR */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        {qrValue ? (
          <QRCode
            value={qrValue}
            size={120}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        ) : (
          <div className="w-[120px] h-[120px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs px-2">
            No QR Code Generated
          </div>
        )}
      </div>

      {/* Các nút chức năng */}
      <div className="flex flex-col w-full gap-2 px-4">
        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          {qrValue ? "Regenerate QR" : "Generate QR"}
        </button>

        {qrValue && (
          <>
            <button
              onClick={handleDownloadPNG}
              className="flex items-center justify-center gap-2 w-full py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              <FiImage /> Download PNG
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 w-full py-2 bg-gray-800 text-white hover:bg-gray-900 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              <FiPrinter /> Print PDF
            </button>
          </>
        )}
      </div>

      {qrValue && (
        <p className="text-[10px] text-gray-400 max-w-[150px] truncate">
          Token: {table.qr_token.substring(0, 15)}...
        </p>
      )}
    </div>
  );
};

export default QRCodePanel;
