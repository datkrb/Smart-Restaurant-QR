# Smart Restaurant — QR Table Management

Project demo gồm backend (API) và frontend (React + Vite) cho quản lý bàn nhà hàng và tạo QR code.

## Cấu trúc

- `backend/` — Express API (MongoDB, QR generation, PDF export)
- `frontend/` — React + Vite client

## Yêu cầu

- Node.js 16+ (hoặc mới hơn)
- MongoDB hoặc MongoDB Atlas

## Backend — chạy local

1. Mở terminal và vào thư mục `backend`:

```bash
cd backend
npm install
```

2. Tạo file `.env` (ví dụ) với ít nhất:

```
MONGO_URI=mongodb://user:pass@host:port/dbname
PORT=5000
```

3. Chạy server:

- Chế độ phát triển (với `nodemon`):

```bash
npm run dev
```

- Hoặc chạy trực tiếp:

```bash
npm start
```

Server mặc định lắng nghe cổng `5000` nếu không đặt `PORT`.

## Frontend — chạy local

1. Mở terminal và vào thư mục `frontend`:

```bash
cd frontend
npm install
```

2. Chạy dev server (Vite):

```bash
npm run dev
```

Vite mặc định dùng cổng `5173` (hoặc cổng khác nếu đã bận).

3. Build production:

```bash
npm run build
npm run preview
```

## Cấu hình frontend ↔ backend

- Nếu frontend cần gọi API backend, chỉnh base URL trong mã nguồn (ví dụ `axios` instance) hoặc thêm biến môi trường cho Vite (ví dụ `VITE_API_URL`) rồi tham chiếu trong mã.

## Ghi chú phát triển

- Backend sử dụng `MONGO_URI` từ `.env` (dotenv).
- Backend scripts: `npm run dev` (nodemon), `npm start` (node server.js).
- Frontend scripts: `npm run dev`, `npm run build`, `npm run preview`.

## Tiếp theo (gợi ý)

- Thêm file `.env.example` cho project mẫu biến môi trường.
- Thêm hướng dẫn migration hoặc seed DB nếu cần.

## License

Add a license file if you plan to share the project publicly. MIT is a common choice.

---

Ngắn gọn: vào `backend/` và `frontend/`, cài dependencies rồi chạy `npm run dev`.

## Production (Deployed)

Ứng dụng đã được triển khai:

- Backend: https://smart-restaurant-qr.onrender.com/
- Frontend: https://smart-restaurant-qr-1.onrender.com/

Cập nhật: dự án đã được deploy và chạy trên hai URL trên (Chạy Backend trước khi chạy frontend).
