const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  table_number: {
    type: String,
    required: true,
    unique: true, // Số bàn không được trùng
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 20 
  },
  location: {
    type: String,
    enum: ['Indoor', 'Outdoor', 'Patio', 'VIP Room'], // Các khu vực định sẵn
    default: 'Indoor'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  description: {
    type: String,
    default: ''
  },
  qr_token: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);