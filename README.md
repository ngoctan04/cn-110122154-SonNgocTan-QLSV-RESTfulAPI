
 # Đề tài: Tìm hiểu về API và RESTful Architecture
Mục đích
- Triển khai hệ thống quản lý sinh viên: quản lý người dùng, lớp, chuyên ngành, môn học và điểm.
- Đưa đầy đủ hướng dẫn để giảng viên/bạn đọc có thể chạy lại hệ thống và kiểm tra kết quả báo cáo.

Sinh viên thực hiện:
- Họ và tên: Sơn Ngọc Tân
- MSSV: 110122154
- Lớp: DA22TTB


Phiên bản repo này phục vụ cho đồ án: "Tìm hiểu về API và RESTful Architecture". Mục tiêu là nghiên cứu lý thuyết và thực hành thiết kế API theo nguyên tắc REST, triển khai một API mẫu có tài liệu đầy đủ và ứng dụng frontend để minh họa.

Mục tiêu cụ thể
- Tổng quan khái niệm API và RESTful architecture.
- Thiết kế và triển khai RESTful API đúng chuẩn (HTTP verbs, status codes, resource URIs, HATEOAS cơ bản).

- Xây dựng ứng dụng demo (frontend + backend) minh họa cách client tiêu thụ API.



Yêu cầu kỹ thuật
- Node.js (>=16) và npm
- MongoDB (local) hoặc MongoDB Atlas (chuỗi kết nối đặt trong `server/.env`)

Mẫu biến môi trường (`server/.env.example`)
```
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/tan
JWT_SECRET=your_jwt_secret
```

Hướng dẫn chạy (phát triển)
- Backend:
```bash
cd scr/server
npm install
# sửa `server/.env` theo `server/.env.example`
npm run dev
```
- Frontend:
```bash
cd scr/client
npm install
npm start
```





