import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiFilter,
  FiDownload,
} from "react-icons/fi";
import QRCodePanel from "./QRCodePanel";

const API_URL = "http://localhost:5000/api/admin/tables";

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", location: "" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [formData, setFormData] = useState({
    table_number: "",
    capacity: 2,
    location: "Indoor",
    description: "",
  });

  // Fetch Tables
  const fetchTables = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append("status", filter.status);
      if (filter.location) params.append("location", filter.location);

      // Dùng biến API_URL
      const res = await axios.get(`${API_URL}?${params}`);
      setTables(res.data);
    } catch (error) {
      console.error("Error fetching tables", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [filter]);

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentTable) {
        // Update
        await axios.put(`${API_URL}/${currentTable._id}`, formData);
      } else {
        // Create
        await axios.post(API_URL, formData);
      }
      setIsModalOpen(false);
      fetchTables();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  // Handle Soft Delete
  const handleToggleStatus = async (table) => {
    if (table.status === "active") {
      if (!window.confirm(`Deactivate Table ${table.table_number}?`)) return;
    }
    try {
      await axios.patch(`${API_URL}/${table._id}/status`);
      fetchTables();
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (table = null) => {
    if (table) {
      setCurrentTable(table);
      setFormData({
        table_number: table.table_number,
        capacity: table.capacity,
        location: table.location,
        description: table.description,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentTable(null);
    setFormData({
      table_number: "",
      capacity: 2,
      location: "Indoor",
      description: "",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Table Management
        </h1>

        <div className="flex gap-3">
          {/* Nút Download ZIP */}
          <button
            onClick={() => window.open(`${API_URL}/qr/download-all`, "_blank")}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <FiDownload /> <span>Download ZIP</span>
          </button>

          {/* Nút Add Table (CHỈ GIỮ LẠI 1 CÁI NÀY) */}
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <FiPlus /> Add New Table
          </button>
        </div>
      </div>

      {/* Filtered */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-gray-500">
          <FiFilter /> <span className="font-medium">Filters:</span>
        </div>
        <select
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
          value={filter.location}
          onChange={(e) => setFilter({ ...filter, location: e.target.value })}
        >
          <option value="">All Locations</option>
          <option value="Indoor">Indoor</option>
          <option value="Outdoor">Outdoor</option>
          <option value="Patio">Patio</option>
          <option value="VIP Room">VIP Room</option>
        </select>
        <select
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Grid View Tables */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading tables...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => (
            <div
              key={table._id}
              className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden ${
                table.status === "inactive" ? "opacity-75 grayscale-[0.5]" : ""
              }`}
            >
              {/* Status Badge */}
              <div
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  table.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {table.status}
              </div>

              <div className="p-6">
                <div className="text-4xl font-black text-gray-800 mb-1">
                  {table.table_number}
                </div>
                <div className="text-sm font-medium text-gray-500 mb-4">
                  {table.location}
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <span className="font-semibold">Capacity:</span>{" "}
                  {table.capacity} seats
                </div>
                <div className="h-16 w-full">
                  {table.description && (
                    <p className="text-xs text-gray-400 italic mb-4 line-clamp-2">
                      {table.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <QRCodePanel table={table} onUpdate={fetchTables} />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(table)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  title="Edit Table"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => handleToggleStatus(table)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    table.status === "active"
                      ? "text-red-500 hover:bg-red-100"
                      : "text-green-600 hover:bg-green-100"
                  }`}
                  title={table.status === "active" ? "Deactivate" : "Activate"}
                >
                  {table.status === "active" ? (
                    <FiTrash2 size={18} />
                  ) : (
                    <FiRefreshCw size={18} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {currentTable ? "Edit Table" : "New Table"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formData.table_number}
                  onChange={(e) =>
                    setFormData({ ...formData, table_number: e.target.value })
                  }
                  placeholder="e.g. T-01"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="20"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Patio">Patio</option>
                    <option value="VIP Room">VIP Room</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional notes..."
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-md shadow-blue-200 transition-colors cursor-pointer"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
