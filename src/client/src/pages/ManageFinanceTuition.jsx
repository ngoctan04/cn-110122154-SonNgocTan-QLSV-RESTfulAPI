import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ManageFinanceTuition = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ course: '', year: '', amount: '' });
  const [editId, setEditId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/finance/tuition');
      if (res.data.success) setItems(res.data.data || []);
    } catch (err) { console.error(err); toast.error('Không thể tải dữ liệu'); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    const validation = () => {
      if (!form.course) return 'Chưa nhập khoá/ngành';
      if (!form.year) return 'Chưa nhập năm';
      if (!form.amount || Number(form.amount) <= 0) return 'Số tiền không hợp lệ';
      return null;
    };
    const v = validation();
    if (v) { toast.error(v); return; }
    try {
      const payload = { ...form, amount: Number(form.amount) };
      const res = await axios.post('/api/finance/tuition', payload);
      if (res.data.success) {
        toast.success('Tạo học phí thành công');
        setForm({ course: '', year: '', amount: '' });
        fetch();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi tạo');
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({ course: item.course || '', year: item.year || '', amount: item.amount || '' });
  };

  const handleUpdate = async () => {
    if (!editId) return;
    const validation = () => {
      if (!form.course) return 'Chưa nhập khoá/ngành';
      if (!form.year) return 'Chưa nhập năm';
      if (!form.amount || Number(form.amount) <= 0) return 'Số tiền không hợp lệ';
      return null;
    };
    const v = validation();
    if (v) { toast.error(v); return; }
    try {
      const payload = { ...form, amount: Number(form.amount) };
      const res = await axios.put(`/api/finance/tuition/${editId}`, payload);
      if (res.data.success) {
        toast.success('Cập nhật thành công');
        setForm({ course: '', year: '', amount: '' });
        setEditId(null);
        fetch();
      }
    } catch (err) { console.error(err); toast.error('Lỗi cập nhật'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bản ghi?')) return;
    try {
      await axios.delete(`/api/finance/tuition/${id}`);
      toast.success('Đã xóa');
      fetch();
    } catch (err) { console.error(err); toast.error('Lỗi xóa'); }
  };

  if (!user || user.role !== 'admin') return <div className="container mt-4">Bạn không có quyền xem trang này.</div>;

  return (
    <div className="container mt-4">
      <h2>Quản lý Học phí</h2>
      <div className="mb-3 d-flex gap-2">
        <input placeholder="Khoá/ngành" value={form.course} onChange={e=>setForm({...form, course:e.target.value})} className="form-control" />
        <input placeholder="Năm" value={form.year} onChange={e=>setForm({...form, year:e.target.value})} className="form-control" />
        <input placeholder="Số tiền" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} className="form-control" />
        {editId ? (
          <>
            <button className="btn btn-success" onClick={handleUpdate}>Cập nhật</button>
            <button className="btn btn-secondary" onClick={()=>{ setEditId(null); setForm({ course: '', year: '', amount: '' }); }}>Hủy</button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={handleCreate}>Tạo</button>
        )}
      </div>

      {loading ? <p>Đang tải...</p> : (
        <table className="table">
          <thead><tr><th>Khoá</th><th>Năm</th><th>Số tiền</th><th>Hành động</th></tr></thead>
          <tbody>
            {items.map(it=> (
              <tr key={it._id}>
                <td>{it.course}</td>
                <td>{it.year}</td>
                <td>{it.amount?.toLocaleString('vi-VN')}</td>
                <td>
                  <button className="btn btn-warning btn-sm me-2" onClick={()=>handleEdit(it)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(it._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageFinanceTuition;
