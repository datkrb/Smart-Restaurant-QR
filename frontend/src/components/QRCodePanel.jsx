import React, { useState } from "react";
import QRCode from "react-qr-code";
import axios from "axios";
import { FiRefreshCw, FiImage, FiPrinter } from "react-icons/fi";

// 1. Lấy URL gốc
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const QRCodePanel = ({ table, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  // URL Frontend tự động (để tạo link trong QR)
  const frontendUrl = window.location.origin;

  const qrValue = table.qr_token
    ? `${frontendUrl}/menu?table=${table._id}&token=${table.qr_token}`
    : "";

  const handleRegenerate = async () => {
    if (table.qr_token) {
      const confirm = window.confirm(
        "Warning: Regenerating will invalidate the old QR code. Continue?"
      );
      if (!confirm) return;
    }

    setLoading(true);
    try {
      // 2. Dùng API_BASE
      await axios.post(`${API_BASE}/api/admin/tables/${table._id}/qr/generate`);
      onUpdate();
    } catch (error) {
      alert("Error generating QR");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // 3. Dùng API_BASE cho window.open
    window.open(
      `${API_BASE}/api/admin/tables/${table._id}/qr/download`,
      "_blank"
    );
  };

  const handleDownloadPNG = () => {
    window.open(
      `${API_BASE}/api/admin/tables/${table._id}/qr/download-png`,
      "_blank"
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
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
    </div>
  );
};

export default QRCodePanel;
