import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/finance/payments');
      if (res.data.success) setItems(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải lịch sử thanh toán');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  if (!user || user.role !== 'admin') return <div className="container mt-4">Bạn không có quyền xem trang này.</div>;

  return (
    <div className="container mt-4">
      <h2>Lịch sử Thanh toán</h2>
      {loading ? <p>Đang tải...</p> : (
        <table className="table">
          <thead>
            <tr><th>SV</th><th>Loại</th><th>Mục</th><th>Số tiền</th><th>Ghi chú</th><th>Ngày</th></tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it._id}>
                <td>{it.studentId?.name || it.studentId || '-'}</td>
                <td>{it.type}</td>
                <td>{it.financeId || '-'}</td>
                <td>{it.amount?.toLocaleString('vi-VN')}</td>
                <td>{it.note || '-'}</td>
                <td>{new Date(it.createdAt).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentHistory;
