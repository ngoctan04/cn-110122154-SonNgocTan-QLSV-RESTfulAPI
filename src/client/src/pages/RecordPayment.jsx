import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RecordPayment = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [tuitions, setTuitions] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [form, setForm] = useState({ studentId: '', type: 'tuition', financeId: '', amount: '', note: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [uRes, tRes, sRes] = await Promise.all([
          axios.get('/api/users?limit=500'),
          axios.get('/api/finance/tuition'),
          axios.get('/api/finance/scholarships')
        ]);
        if (uRes.data.success) setStudents(uRes.data.data || []);
        if (tRes.data.success) setTuitions(tRes.data.data || []);
        if (sRes.data.success) setScholarships(sRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    // auto fill amount when finance selection changes
    const list = form.type === 'tuition' ? tuitions : scholarships;
    const found = list.find(x => String(x._id) === String(form.financeId));
    if (found) setForm(f => ({ ...f, amount: found.amount || '' }));
  }, [form.financeId, form.type, tuitions, scholarships]);

  const validate = () => {
    if (!form.studentId) return 'Chọn sinh viên';
    if (!form.type) return 'Chọn loại';
    if (!form.amount || Number(form.amount) <= 0) return 'Số tiền không hợp lệ';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      const res = await axios.post('/api/finance/payments', payload);
      if (res.data.success) {
        toast.success('Ghi nhận thanh toán thành công');
        setForm({ studentId: '', type: 'tuition', financeId: '', amount: '', note: '' });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi ghi nhận thanh toán');
    } finally { setLoading(false); }
  };

  if (!user || user.role !== 'admin') return <div className="container mt-4">Bạn không có quyền xem trang này.</div>;

  return (
    <div className="container mt-4">
      <h2>Ghi nhận Thanh toán</h2>
      <div className="mb-3 d-flex gap-2 align-items-center">
        <select value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} className="form-select">
          <option value="">-- Chọn sinh viên --</option>
          {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
        </select>
        <select value={form.type} onChange={e => setForm({...form, type: e.target.value, financeId: ''})} className="form-select">
          <option value="tuition">Học phí</option>
          <option value="scholarship">Học bổng</option>
        </select>
        <select value={form.financeId} onChange={e => setForm({...form, financeId: e.target.value})} className="form-select">
          <option value="">-- Chọn mục --</option>
          {(form.type === 'tuition' ? tuitions : scholarships).map(it => (
            <option key={it._id} value={it._id}>{form.type === 'tuition' ? `${it.course} - ${it.year}` : it.name}</option>
          ))}
        </select>
        <input type="number" placeholder="Số tiền" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="form-control" />
        <input placeholder="Ghi chú" value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="form-control" />
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>Ghi nhận</button>
      </div>
    </div>
  );
};

export default RecordPayment;
