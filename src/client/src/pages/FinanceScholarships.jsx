import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const FinanceScholarships = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/finance/scholarships');
      if (res.data && res.data.success) setItems(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải dữ liệu học bổng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScholarships(); }, []);

  return (
    <div className="container mt-4">
      <h2>Học bổng</h2>
      {loading ? <p>Đang tải...</p> : (
        <table className="table">
          <thead>
            <tr><th>Tên học bổng</th><th>Mô tả</th><th>Mức hỗ trợ</th></tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id || it.id}>
                <td>{it.name || '-'}</td>
                <td>{it.description || '-'}</td>
                <td>{it.amount ? it.amount.toLocaleString('vi-VN') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FinanceScholarships;
