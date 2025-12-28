import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './AdminLayout.css';
import { Outlet } from 'react-router-dom';

const AdminLayout = ({ user }) => {
  return (
    <div className="admin-layout-root">
      <Header />
      <div style={{ display: 'flex', width: '100%' }}>
        <Sidebar user={user} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
