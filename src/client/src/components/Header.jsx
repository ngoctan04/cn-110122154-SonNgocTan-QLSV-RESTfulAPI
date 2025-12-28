import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-left">
        <img src="/logo1.png" alt="logo" className="header-logo-img" />
        <span className="header-title">Quản lý sinh viên</span>
      </div>
      
    </header>
  );
};

export default Header;
