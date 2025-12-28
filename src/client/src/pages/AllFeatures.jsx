import React from 'react';
import { Link } from 'react-router-dom';
import './AllFeatures.css';

const features = [
  {
    path: '/',
    icon: 'fa-gauge',
    title: 'Tổng quan',
    desc: 'Thống kê tổng quan hệ thống quản lý sinh viên.'
  },
  {
    path: '/students',
    icon: 'fa-users',
    title: 'Quản lý sinh viên',
    desc: 'Xem, thêm, sửa, xóa sinh viên, tìm kiếm, lọc, phân trang.'
  },
  {
    path: '/classes',
    icon: 'fa-school',
    title: 'Quản lý lớp học',
    desc: 'Quản lý danh sách lớp, chuyên ngành, mô tả, thao tác CRUD.'
  },
  {
    path: '/majors',
    icon: 'fa-graduation-cap',
    title: 'Quản lý ngành học',
    desc: 'Quản lý ngành, mã ngành, mô tả, thao tác CRUD.'
  },
  {
    path: '/courses',
    icon: 'fa-book',
    title: 'Quản lý môn học',
    desc: 'Quản lý môn học, mã môn, mô tả, thao tác CRUD.'
  },
  {
    path: '/grades',
    icon: 'fa-chart-line',
    title: 'Quản lý điểm',
    desc: 'Quản lý điểm, nhập điểm, xem điểm, thống kê.'
  },
  {
    path: '/profile',
    icon: 'fa-id-card',
    title: 'Hồ sơ cá nhân',
    desc: 'Xem và cập nhật thông tin cá nhân.'
  },
  {
    path: '/logout',
    icon: 'fa-arrow-right-from-bracket',
    title: 'Đăng xuất',
    desc: 'Thoát khỏi hệ thống.'
  }
];

const AllFeatures = () => {
  return (
    <div className="all-features-container">
      <h1 className="all-features-title">Tất cả tính năng hệ thống</h1>
      <div className="all-features-grid">
        {features.map((f, idx) => (
          <Link to={f.path} className="feature-card" key={idx}>
            <div className="feature-icon">
              <i className={`fa-solid ${f.icon}`}></i>
            </div>
            <div className="feature-info">
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllFeatures;
