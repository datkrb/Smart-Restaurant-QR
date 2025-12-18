import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TableManagement from './components/TableManagement';
import Menu from './components/Menu';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Trang Admin */}
          <Route path="/admin/tables" element={<TableManagement />} />

          {/* Trang Khách Hàng Quét QR */}
          <Route path="/menu" element={<Menu />} />

          <Route path="/" element={<TableManagement />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
