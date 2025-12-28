
import React from 'react';
import StatsOverview from '../components/StatsOverview';


const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        Thống kê tổng quan hệ thống quản lý sinh viên
      </div>

      <div style={{ padding: '24px 32px' }}>
        <StatsOverview showCards={true} showCharts={true} chartHeight={440} />
      </div>

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        Thống kê tổng quan hệ thống quản lý sinh viên
      </div>

      <div style={{ padding: '24px 32px' }}>
        <StatsOverview showCards={true} showCharts={true} />

        {/* keep smaller chart/cards if needed below */}
      </div>

    </div>
  );
};

export default Dashboard;
