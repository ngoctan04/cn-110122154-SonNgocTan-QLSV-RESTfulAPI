import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ManageFinanceScholarships = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', amount: '' });
  const [editId, setEditId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/finance/scholarships');
      if (res.data.success) setItems(res.data.data || []);
    } catch (err) { console.error(err); toast.error('Không thể tải dữ liệu'); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    const validation = () => {
      if (!form.name) return 'Chưa nhập tên';
      if (!form.amount || Number(form.amount) <= 0) return 'Mức hỗ trợ không hợp lệ';
      return null;
    };
    const v = validation();
    if (v) { toast.error(v); return; }
    try {
      const payload = { ...form, amount: Number(form.amount) };
      const res = await axios.post('/api/finance/scholarships', payload);
      if (res.data.success) {
        toast.success('Tạo học bổng thành công');
        setForm({ name: '', description: '', amount: '' });
        fetch();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi tạo');
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({ name: item.name || '', description: item.description || '', amount: item.amount || '' });
  };

  const handleUpdate = async () => {
    if (!editId) return;
    const validation = () => {
      if (!form.name) return 'Chưa nhập tên';
      if (!form.amount || Number(form.amount) <= 0) return 'Mức hỗ trợ không hợp lệ';
      return null;
    };
    const v = validation();
    if (v) { toast.error(v); return; }
    try {
      const payload = { ...form, amount: Number(form.amount) };
      const res = await axios.put(`/api/finance/scholarships/${editId}`, payload);
      if (res.data.success) {
        toast.success('Cập nhật thành công');
        setForm({ name: '', description: '', amount: '' });
        setEditId(null);
        fetch();
      }
    } catch (err) { console.error(err); toast.error('Lỗi cập nhật'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bản ghi?')) return;
    try {
      await axios.delete(`/api/finance/scholarships/${id}`);
      toast.success('Đã xóa');
      fetch();
    } catch (err) { console.error(err); toast.error('Lỗi xóa'); }
  };

  if (!user || user.role !== 'admin') return <div className="container mt-4">Bạn không có quyền xem trang này.</div>;

  return (
    <div className="container mt-4">
      <h2>Quản lý Học bổng</h2>
      <div className="mb-3 d-flex gap-2">
        <input placeholder="Tên" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="form-control" />
        <input placeholder="Mô tả" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="form-control" />
        <input placeholder="Mức hỗ trợ" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} className="form-control" />
        {editId ? (
          <>
            <button className="btn btn-success" onClick={handleUpdate}>Cập nhật</button>
            <button className="btn btn-secondary" onClick={()=>{ setEditId(null); setForm({ name: '', description: '', amount: '' }); }}>Hủy</button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={handleCreate}>Tạo</button>
        )}
      </div>

      {loading ? <p>Đang tải...</p> : (
        <table className="table">
          <thead><tr><th>Tên</th><th>Mô tả</th><th>Mức hỗ trợ</th><th>Hành động</th></tr></thead>
          <tbody>
            {items.map(it=> (
              <tr key={it._id}>
                <td>{it.name}</td>
                <td>{it.description}</td>
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

export default ManageFinanceScholarships;
