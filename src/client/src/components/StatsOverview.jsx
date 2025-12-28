import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import './StatsOverview.css';
import StudentsTable from './StudentsTable';
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const COLORS = ['#012A6B', '#274B8A', '#2ecc71', '#e67e22'];

const StatsOverview = ({ showCards = true, showCharts = true, chartHeight = 320 }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalMajors: 0,
    totalCourses: 0,
    avgGPA: 0,
    excellent: 0,
    weak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/dashboard/summary');
        if (res.data.success && res.data.data) setStats(res.data.data);
      } catch (err) {
        // ignore for now
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!showCards && !showCharts) return null;

  return (
    <div className="stats-overview-root">
      {showCards && (
        <div className="stats-cards">
          <div className="stat-item">
            <div className="stat-label">Tổng số sinh viên</div>
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-desc">Sinh viên đang học</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Tổng số lớp học</div>
            <div className="stat-value">{stats.totalClasses}</div>
            <div className="stat-desc">Lớp học hiện tại</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Tổng số ngành học</div>
            <div className="stat-value">{stats.totalMajors}</div>
            <div className="stat-desc">Ngành học có sẵn</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Tổng số môn học</div>
            <div className="stat-value">{stats.totalCourses}</div>
            <div className="stat-desc">Môn học trong chương trình</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Điểm trung bình</div>
            <div className="stat-value">{typeof stats.avgGPA === 'number' ? stats.avgGPA.toFixed(1) : '0.0'}</div>
            <div className="stat-desc">Điểm GPA trung bình</div>
          </div>
        </div>
      )}

      {showCharts && (
        <div className="stats-charts">
          <div className="chart-card">
            <h3>Thống kê số lượng</h3>
            <div style={{ height: chartHeight }}>
              <Bar
                data={{
                  labels: ['Sinh viên', 'Lớp học', 'Ngành học', 'Môn học'],
                  datasets: [
                    {
                      label: 'Số lượng',
                      data: [stats.totalStudents, stats.totalClasses, stats.totalMajors, stats.totalCourses],
                      backgroundColor: COLORS.slice(0, 4),
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
              />
            </div>
          </div>

          <div className="chart-card">
            <h3>Phân loại học lực</h3>
            <div style={{ height: chartHeight }}>
              <Doughnut
                data={{
                  labels: ['Xuất sắc', 'Yếu'],
                  datasets: [
                    {
                      data: [stats.excellent, stats.weak],
                      backgroundColor: ['#2ecc71', '#e74c3c'],
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
              />
            </div>
          </div>
        </div>
      )}

      <StudentsTable />

      {loading && <div className="stats-loading">Đang tải số liệu...</div>}
    </div>
  );
};

export default StatsOverview;
