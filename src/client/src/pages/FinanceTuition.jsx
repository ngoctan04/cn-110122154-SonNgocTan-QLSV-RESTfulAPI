import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const FinanceTuition = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTuition = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/finance/tuition');
      if (res.data && res.data.success) setItems(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải dữ liệu học phí');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTuition(); }, []);

  return (
    <div className="container mt-4">
      <h2>Học phí</h2>
      {loading ? <p>Đang tải...</p> : (
        <table className="table">
          <thead>
            <tr><th>Khoá</th><th>Năm</th><th>Số tiền</th></tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id || it.id}>
                <td>{it.course || '-'}</td>
                <td>{it.year || '-'}</td>
                <td>{it.amount ? it.amount.toLocaleString('vi-VN') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FinanceTuition;
