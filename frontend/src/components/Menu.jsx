import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios"; // Nhớ cài axios hoặc dùng fetch

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // 'loading', 'valid', 'invalid'

  useEffect(() => {
    const verifyToken = async () => {
      const tableId = searchParams.get("table");
      const token = searchParams.get("token");

      try {
        // Gọi API backend (Bạn cần đảm bảo backend có endpoint này)
        // Lưu ý: Endpoint này phải check token trong DB khớp với token gửi lên
        await axios.get(
          `http://localhost:5000/api/menu/verify?table=${tableId}&token=${token}`
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
      {/* Code hiển thị Menu cũ của bạn đặt vào đây */}
      <h1 className="text-2xl font-bold text-green-600">
        🎉 Menu Linked Successfully!
      </h1>
    </div>
  );
};

export default Menu;
