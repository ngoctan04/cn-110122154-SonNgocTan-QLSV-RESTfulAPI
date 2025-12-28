import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalMajors: 0,
    totalCourses: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/dashboard/summary');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="profile-container">
      <Link to="/" className="profile-back-button">
        <i className="fa-solid fa-arrow-left"></i>
        Trở về Dashboard
      </Link>

      <div className="profile-header">
        <h1> Hồ Sơ Cá Nhân</h1>
        <p>Thông tin chi tiết về tài khoản của bạn</p>
      </div>

      <div className="profile-content">
        {/* Avatar Card */}
        <div className="profile-avatar-card">
          <div className="profile-avatar-wrapper">
            <img
              src="/logo5.png"
              alt="Avatar"
              className="profile-avatar"
            />
            <div className="profile-avatar-badge">
              <i className="fa-solid fa-crown"></i>
            </div>
          </div>
          <h2 className="profile-name">{user?.name || 'Admin'}</h2>
          <p className="profile-email">{user?.email}</p>
          <span className="profile-role-badge">
            <i className="fa-solid fa-shield-halved"></i> {user?.role || 'Administrator'}
          </span>
        </div>

        {/* Info Card */}
        <div className="profile-info-card">
          <div className="profile-info-header">
            <i className="fa-solid fa-circle-info"></i>
            <h2>Thông Tin Chi Tiết</h2>
          </div>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <div className="profile-info-label">
                <i className="fa-solid fa-envelope"></i>
                Email
              </div>
              <div className="profile-info-value">
                {user?.email || '—'}
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-label">
                <i className="fa-solid fa-user"></i>
                Họ và Tên
              </div>
              <div className="profile-info-value">
                {user?.name || '—'}
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-label">
                <i className="fa-solid fa-shield"></i>
                Vai Trò
              </div>
              <div className="profile-info-value">
                {user?.role || 'Administrator'}
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-label">
                <i className="fa-solid fa-clock"></i>
                Ngày Tạo
              </div>
              <div className="profile-info-value">
                {formatDate(user?.createdAt)}
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-label">
                <i className="fa-solid fa-phone"></i>
                Số Điện Thoại
              </div>
              <div className={`profile-info-value ${!user?.phone ? 'empty' : ''}`}>
                {user?.phone || 'Chưa cập nhật'}
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-label">
                <i className="fa-solid fa-location-dot"></i>
                Địa Chỉ
              </div>
              <div className={`profile-info-value ${!user?.address ? 'empty' : ''}`}>
                {user?.address || 'Chưa cập nhật'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="profile-stats-card">
        <div className="profile-stats-header">
          <i className="fa-solid fa-chart-line"></i>
          <h3>Thống Kê Hệ Thống</h3>
        </div>
        <div className="profile-stats-grid">
          <div className="profile-stat-item">
            <div className="profile-stat-icon">
              <i className="fa-solid fa-user-graduate"></i>
            </div>
            <div className="profile-stat-value">{stats.totalStudents}</div>
            <div className="profile-stat-label">Sinh Viên</div>
          </div>

          <div className="profile-stat-item">
            <div className="profile-stat-icon">
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="profile-stat-value">{stats.totalClasses}</div>
            <div className="profile-stat-label">Lớp Học</div>
          </div>

          <div className="profile-stat-item">
            <div className="profile-stat-icon">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div className="profile-stat-value">{stats.totalMajors}</div>
            <div className="profile-stat-label">Chuyên Ngành</div>
          </div>

          <div className="profile-stat-item">
            <div className="profile-stat-icon">
              <i className="fa-solid fa-book"></i>
            </div>
            <div className="profile-stat-value">{stats.totalCourses}</div>
            <div className="profile-stat-label">Môn Học</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
