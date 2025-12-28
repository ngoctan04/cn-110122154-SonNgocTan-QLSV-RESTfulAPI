import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './StudentsTable.css';

const StudentsTable = ({ initialPage = 1, initialLimit = 10 }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8000/api/users', {
        params: { page, limit, search },
      });
      if (res.data && res.data.success) {
        setStudents(res.data.data || []);
        setTotal(res.data.pagination ? res.data.pagination.total : (res.data.data || []).length);
      } else {
        setStudents([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sinh viên', err.message || err);
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/delete/user/${id}`);
      toast.success('Xóa sinh viên thành công');
      fetchStudents();
    } catch (err) {
      console.error('Lỗi xóa sinh viên', err.response?.data || err.message || err);
      toast.error(err.response?.data?.message || 'Lỗi khi xóa sinh viên');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="students-table-root">
      <div className="students-table-header">
        <div className="students-search">
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="Tìm theo tên hoặc email..."
          />
        </div>
        <div className="students-meta">Tổng: {total}</div>
      </div>

      <div className="students-table-wrap">
        <table className="management-table students-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>MSSV</th>
              <th>Họ và Tên</th>
              <th>Email</th>
              <th>Số ĐT</th>
              <th>Giới tính</th>
              <th>Lớp</th>
              <th>Chuyên ngành</th>
              <th>Ngày nhập học</th>
              <th>Địa chỉ</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="center">Đang tải...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={11} className="center">Không có dữ liệu</td>
              </tr>
            ) : (
              students.map((s, idx) => (
                <tr key={s._id || s.id}>
                  <td>{(page - 1) * limit + idx + 1}</td>
                  <td>{s.mssv || '-'}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.phone || '-'}</td>
                  <td>{s.gender || '-'}</td>
                  <td>{s.className || '-'}</td>
                  <td>{s.majorName || '-'}</td>
                  <td>{s.joinDate ? new Date(s.joinDate).toLocaleDateString() : '-'}</td>
                  <td>{s.address || '-'}</td>
                  <td className="action-buttons">
                    <Link to={`/students/update/${s._id}`} className="btn btn-sm btn-edit" title="Chỉnh sửa">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </Link>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(s._id)} title="Xóa">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="students-pagination">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <div className="students-page-info">{page} / {totalPages}</div>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StudentsTable;
