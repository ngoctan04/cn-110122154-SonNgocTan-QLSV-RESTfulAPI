import React, { useEffect, useState } from 'react';
import './User.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const User = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search, Filter, Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [uniqueClasses, setUniqueClasses] = useState([]);

  const fetchData = React.useCallback(async (page = 1, limit = pageSize, search = '', filter = '', sort = '-createdAt') => {
    setLoading(true);
    try {
      let url = `http://localhost:8000/api/users?page=${page}&limit=${limit}`;
      console.log('Fetching users with', { page, limit, search, filter, sort });
      
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (filter && filter !== 'all') url += `&filter=${encodeURIComponent(filter)}`;
      if (sort) url += `&sort=${encodeURIComponent(sort)}`;
      
      const response = await axios.get(url);
      console.log('API Response:', response.data.message, response.data.pagination);
      
      if (response.data.success && response.data.data) {
        setUsers(response.data.data);
        
        // Update pagination info
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage);
          setTotal(response.data.pagination.total);
          setTotalPages(response.data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Error while fetching data:', error);
      toast.error('Lỗi lấy dữ liệu sinh viên!', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Fetch danh sách lớp cho dropdown filter (use class dropdown endpoint)
  const fetchUniqueClasses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/class/dropdown');
      if (response.data.success) {
        setUniqueClasses(response.data.data); // array of class objects
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  useEffect(() => {
    // Fetch using current UI state so sort/filter/search persist
    fetchData(1, pageSize, searchTerm, filterClass, sortBy);
    fetchUniqueClasses();

    const handleExternalUpdate = () => {
      fetchData(1, pageSize, searchTerm, filterClass, sortBy);
      fetchUniqueClasses();
    };

    window.addEventListener('dataUpdated', handleExternalUpdate);
    return () => {
      window.removeEventListener('dataUpdated', handleExternalUpdate);
    };
  }, [fetchData, pageSize, searchTerm, filterClass, sortBy]);

  // Xử lý search - debounce để tránh gọi API quá nhiều
  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchData(1, pageSize, value, filterClass, sortBy);
  };

  // Xử lý filter
  const handleFilterChange = (value) => {
    setFilterClass(value);
    fetchData(1, pageSize, searchTerm, value, sortBy);
  };

  // Xử lý sort
  const handleSort = (value) => {
    console.log('handleSort called with', value);
    setSortBy(value);
    fetchData(1, pageSize, searchTerm, filterClass, value);
  };

  // Xử lý thay đổi kích thước trang
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    fetchData(1, newSize, searchTerm, filterClass, sortBy);
  };

  // Xử lý chuyển trang
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchData(currentPage - 1, pageSize, searchTerm, filterClass, sortBy);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchData(currentPage + 1, pageSize, searchTerm, filterClass, sortBy);
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum > 0 && pageNum <= totalPages) {
      fetchData(pageNum, pageSize, searchTerm, filterClass, sortBy);
    }
  };

const deleteUser = async (userId) => {
  if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
    await axios.delete(`http://localhost:8000/api/delete/user/${userId}`)
      .then((response) => {
        setUsers((prevUser) => prevUser.filter((user) => user._id !== userId));
        toast.success('Xóa sinh viên thành công!', { position: 'top-right' });
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.message || 'Lỗi xóa sinh viên!', { position: 'top-right' });
      });
  }
}


  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!', { position: 'top-right' });
    navigate('/login');
  };

  return (
    <div className="userTable container-fluid mt-4">
      <div className="d-flex justify-content-end mb-4">
        <Link to="/students/add" type="button" className="btn btn-primary">
          <i className="fa-solid fa-user-plus me-2"></i>Thêm Sinh Viên
        </Link>
      </div>

      {/* Header with User Info and Logout */}
      <div className="user-header-section mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div className="user-header-left">
            <div className="user-header-avatar">
              <img src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=667eea&color=fff'} alt="avatar" />
            </div>
            <div>
              <h2> Danh sách Sinh viên</h2>
              {user && <p className="user-info"><i className="fa-solid fa-user-circle me-2"></i>Xin chào: <strong>{user.email}</strong></p>}
            </div>
          </div>
          <div className="header-actions">
            <button onClick={handleLogout} className="btn btn-logout">
              <i className="fa-solid fa-arrow-right-from-bracket me-2"></i>Đăng Xuất
            </button>
          </div>
        </div>
        {/* Card tổng quan sinh viên */}
        <div className="user-summary-cards mt-3">
          <div className="user-summary-card user-summary-green">
            <div className="user-summary-icon"><i className="fa-solid fa-users"></i></div>
            <div className="user-summary-info">
              <div className="user-summary-title">Tổng sinh viên</div>
              <div className="user-summary-value">{total}</div>
            </div>
          </div>
          <div className="user-summary-card user-summary-blue">
            <div className="user-summary-icon"><i className="fa-solid fa-school"></i></div>
            <div className="user-summary-info">
              <div className="user-summary-title">Lớp học</div>
              <div className="user-summary-value">{uniqueClasses.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter, Sort Bar */}
      <div className="search-filter-section mb-4">
        <div className="row g-3">
          {/* Search Input */}
          <div className="col-md-4">
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="btn-clear"
                  onClick={() => handleSearch('')}
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter by Class */}
          <div className="col-md-3">
            <select
              className="form-select"
              value={filterClass}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="all"> Tất cả lớp</option>
              {uniqueClasses.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.className}</option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="col-md-5">
            <div className="sort-buttons">
              <label className="sort-label">Sắp xếp:</label>
              <button
                type="button"
                className={`sort-btn ${sortBy === '-createdAt' ? 'active' : ''}`}
                onClick={() => handleSort('-createdAt')}
                title="Mới nhất trước"
              >
                <i className="fa-solid fa-arrow-down-9-1"></i> Mới nhất
              </button>
              <button
                type="button"
                className={`sort-btn ${sortBy === 'createdAt' ? 'active' : ''}`}
                onClick={() => handleSort('createdAt')}
                title="Cũ nhất trước"
              >
                <i className="fa-solid fa-arrow-up-1-9"></i> Cũ nhất
              </button>
              <button
                type="button"
                className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => handleSort('name')}
                title="Tên A-Z"
              >
                <i className="fa-solid fa-arrow-down-a-z"></i> Tên A-Z
              </button>
              <button
                type="button"
                className={`sort-btn ${sortBy === '-name' ? 'active' : ''}`}
                onClick={() => handleSort('-name')}
                title="Tên Z-A"
              >
                <i className="fa-solid fa-arrow-down-z-a"></i> Tên Z-A
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="alert alert-info">Đang tải dữ liệu...</div>}

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark sticky-top">
            <tr>
              <th scope="col" style={{width: '5%'}}>STT</th>
              <th scope="col" style={{width: '12%'}}>Họ và Tên</th>
              <th scope="col" style={{width: '15%'}}>Email</th>
              <th scope="col" style={{width: '9%'}}>MSSV</th>
              <th scope="col" style={{width: '12%'}}>Số ĐT</th>
              <th scope="col" style={{width: '12%'}}>Giới tính</th>
              <th scope="col" style={{width: '10%'}}>Lớp</th>
              <th scope="col" style={{width: '15%'}}>Chuyên ngành</th>
              <th scope="col" style={{width: '10%'}}>Ngày nhập học</th>
              <th scope="col" style={{width: '10%'}}>Địa chỉ</th>
              <th scope="col" className="actions" style={{width: '9%'}}>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={user._id || index}>
                  <td className="fw-bold">{index + 1}</td>
                  <td>
                    <div className="fw-500">{user.name}</div>
                  </td>
                  <td>
                    <a href={`mailto:${user.email}`} style={{textDecoration: 'none'}}>
                      {user.email}
                    </a>
                  </td>
                  <td>{user.mssv || '—'}</td>
                  <td>{user.phone || '—'}</td>
                  <td>
                    <span className={`badge ${
                      user.gender === 'Nam' ? 'bg-primary' : 
                      user.gender === 'Nữ' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {user.gender || 'Khác'}
                    </span>
                  </td>
                  <td>{user.className || user.classId?.className || '—'}</td>
                  <td>{user.majorName || user.majorId?.majorName || '—'}</td>
                  <td>
                    {user.joinDate ? new Date(user.joinDate).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td>
                    <small>{user.address}</small>
                  </td>
                  <td className="text-center">
                    <div className="action-buttons">
                      <Link 
                        to={`/students/update/${user._id}`} 
                        type="button" 
                        className="btn btn-sm btn-edit"
                        title="Chỉnh sửa"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </Link>
                      <button
                        onClick={() => deleteUser(user._id)}
                        type="button" 
                        className="btn btn-sm btn-delete"
                        title="Xóa"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center py-5">
                  <p className="text-muted mb-0">
                    <i className="fa-solid fa-inbox me-2"></i>
                    Không có dữ liệu sinh viên
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-section mt-4">
        <div className="row align-items-center">
          {/* Page size selector */}
          <div className="col-md-4 mb-3 mb-md-0">
            <label htmlFor="pageSize" className="me-2 fw-bold">
              Hiển thị:
            </label>
            <select
              id="pageSize"
              className="form-select d-inline-block w-auto"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>

          {/* Pagination info */}
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <p className="text-muted mb-0">
              Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> 
              {' '}(<strong>{total}</strong> sinh viên)
            </p>
          </div>

          {/* Pagination buttons */}
          <div className="col-md-4 d-flex justify-content-end gap-2">
            <button
              className="btn btn-primary"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
            >
              <i className="fa-solid fa-chevron-left me-2"></i>
              Trước
            </button>

            {/* Page numbers */}
            <div className="btn-group">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Tính số trang cần hiển thị
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                }
                
                if (pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      className={`btn ${
                        currentPage === pageNum ? 'btn-primary' : 'btn-outline-primary'
                      }`}
                      onClick={() => goToPage(pageNum)}
                      disabled={loading}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            <button
              className="btn btn-primary"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
            >
              Tiếp
              <i className="fa-solid fa-chevron-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
