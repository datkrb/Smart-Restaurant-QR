import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

// 1. Lấy URL gốc từ biến môi trường
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const verifyToken = async () => {
      const tableId = searchParams.get("table");
      const token = searchParams.get("token");

      try {
        // 2. Nối chuỗi chuẩn xác: API_BASE + endpoint
        await axios.get(
          `${API_BASE}/api/menu/verify?table=${tableId}&token=${token}`
        );
        setStatus("valid");
      } catch (error) {
        setStatus("invalid");
      }
    };

    verifyToken();
  }, [searchParams]);

  if (status === "loading")
    return <div className="p-10 text-center">Checking QR Code...</div>;

  if (status === "invalid")
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <h1 className="text-3xl font-bold mb-4">Mã QR không hợp lệ</h1>
        <p>Vui lòng liên hệ nhân viên để lấy mã mới.</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-green-600">
        🎉 Menu Linked Successfully!
      </h1>
    </div>
  );
};

export default Menu;
