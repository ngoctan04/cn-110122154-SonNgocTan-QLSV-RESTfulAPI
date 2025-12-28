import React from 'react';
import StatsOverview from '../components/StatsOverview';
import './AdminHome.css';

const AdminHome = () => {
  return (
    <div className="admin-home-container">
      <div className="admin-home-header">
        <h1>Tổng quan hệ thống</h1>
        <div className="admin-home-user">
          <i className="fas fa-user"></i> Admin
        </div>
      </div>

      <div className="admin-home-main">
        <StatsOverview chartHeight={440} />
      </div>
    </div>
  );
};

export default AdminHome;
