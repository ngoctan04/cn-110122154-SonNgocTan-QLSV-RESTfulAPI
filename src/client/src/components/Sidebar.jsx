import React from 'react';

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';


const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-user-block">
          <img src="/logo5.png" alt="avatar" className="sidebar-avatar" />
          <span className="sidebar-user-name">Admin</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="sidebar-menu-group">
          <div className="sidebar-menu-header">TÍNH NĂNG</div>
          <NavLink to="/" end className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}>
            <i className="fa-solid fa-gauge"></i> Tổng quan
          </NavLink>
          <NavLink to="/students" className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}>
            <i className="fa-solid fa-users"></i> Quản lý sinh viên
          </NavLink>
          <NavLink to="/classes" className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}>
            <i className="fa-solid fa-school"></i> Quản lý lớp học
          </NavLink>
          <NavLink to="/majors" className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}>
            <i className="fa-solid fa-graduation-cap"></i> Quản lý ngành học
          </NavLink>
          <NavLink to="/courses" className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}>
            <i className="fa-solid fa-book"></i> Quản lý môn học
          </NavLink>
          <NavLink to="/grades" className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}>
            <i className="fa-solid fa-chart-line"></i> Quản lý điểm
          </NavLink>
        </div>

        {/* Finance & support removed per user request (caused errors) */}

        <div className="sidebar-menu-group">
          <div className="sidebar-menu-header">TÀI KHOẢN</div>
          <NavLink to="/profile" className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}>
            <i className="fa-solid fa-id-card"></i> Hồ sơ cá nhân
          </NavLink>
          <button className="sidebar-link sidebar-logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
