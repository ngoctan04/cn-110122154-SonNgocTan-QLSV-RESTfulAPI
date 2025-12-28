import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './GradeManagement.css';

const GradeManagement = () => {
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [students, setStudents] = useState([]);
    const [studentLoading, setStudentLoading] = useState(false);
    const [studentError, setStudentError] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        userId: '',
        courseId: '',
        ktqt1: '',
        ktqt2: '',
        exam: '',
        semester: 1,
        notes: ''
    });

    const [errors, setErrors] = useState({});
    const [filters, setFilters] = useState({
        studentFilter: '',
        semesterFilter: ''
    });

    // Lấy danh sách điểm
    const fetchGrades = React.useCallback(async () => {
        setLoading(true);
        try {
            let url = 'http://localhost:8000/api/grade/all?page=1&limit=100';
            if (filters.studentFilter) url += `&userId=${filters.studentFilter}`;
            if (filters.semesterFilter) url += `&semester=${filters.semesterFilter}`;

            const response = await axios.get(url);
            if (response.data.success) {
                console.log('Fetched grades:', response.data.data);
                // Normalize grades: ensure ktqt1/ktqt2/exam exist (fall back to legacy midterm/final/assignment)
                const normalized = response.data.data.map(g => ({
                    ...g,
                    // prefer new fields, then legacy fields, then fall back to score so UI always shows a value
                    ktqt1: g.ktqt1 !== undefined && g.ktqt1 !== null ? g.ktqt1 : (g.midterm !== undefined && g.midterm !== null ? g.midterm : (g.score !== undefined && g.score !== null ? g.score : null)),
                    ktqt2: g.ktqt2 !== undefined && g.ktqt2 !== null ? g.ktqt2 : (g.final !== undefined && g.final !== null ? g.final : (g.score !== undefined && g.score !== null ? g.score : null)),
                    exam: g.exam !== undefined && g.exam !== null ? g.exam : (g.assignment !== undefined && g.assignment !== null ? g.assignment : (g.score !== undefined && g.score !== null ? g.score : null))
                }));
                setGrades(normalized);
            }
        } catch (error) {
            console.error('Lỗi lấy dữ liệu điểm:', error);
            toast.error('Lỗi lấy danh sách điểm!', { position: 'top-right' });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Lấy danh sách sinh viên
        const fetchStudents = async () => {
            setStudentLoading(true);
            setStudentError('');
            console.log(' Bắt đầu fetch students...');
            try {
                // Dùng endpoint GET /api/users với pagination
                const response = await axios.get('http://localhost:8000/api/users', {
                    params: {
                        page: 1,
                        limit: 1000
                    }
                });
                
                console.log(' Response từ API:', response.data);
                console.log(' Số sinh viên:', response.data?.data?.length);
                
                if (response.data.success && Array.isArray(response.data.data)) {
                    setStudents(response.data.data);
                    console.log(' Đã set students state với', response.data.data.length, 'sinh viên');
                    if (response.data.data.length === 0) {
                        setStudentError('Chưa có sinh viên nào. Hãy thêm sinh viên trước.');
                    }
                } else {
                    throw new Error('Dữ liệu trả về không hợp lệ');
                }
            } catch (error) {
                console.error(' Lỗi lấy sinh viên:', error);
                console.error('Response:', error.response?.data);
                setStudentError('Không thể tải danh sách sinh viên. Vui lòng kiểm tra server.');
            } finally {
                setStudentLoading(false);
            }
        };

    // Lấy danh sách môn học
    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/course/dropdown');
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi lấy môn học:', error);
        }
    };

    useEffect(() => {
        console.log(' Component GradeManagement mounted, fetching data...');
        fetchStudents();
        fetchCourses();
        fetchGrades();
    }, [fetchGrades]);

    useEffect(() => {
        console.log(' Students state updated:', students.length, 'sinh viên');
        console.log(' Students data:', students);
    }, [students]);

    useEffect(() => {
        fetchGrades();
    }, [fetchGrades]);

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.userId) {
            newErrors.userId = "Vui lòng chọn sinh viên";
        }

        if (!formData.courseId) {
            newErrors.courseId = "Vui lòng chọn môn học";
        }

        const checkComp = (val) => val === '' || val === null || val === undefined ? false : true;
        if (!checkComp(formData.ktqt1) || Number(formData.ktqt1) < 0 || Number(formData.ktqt1) > 10) {
            newErrors.ktqt1 = "KTQT1 phải từ 0 đến 10";
        }
        if (!checkComp(formData.ktqt2) || Number(formData.ktqt2) < 0 || Number(formData.ktqt2) > 10) {
            newErrors.ktqt2 = "KTQT2 phải từ 0 đến 10";
        }
        if (!checkComp(formData.exam) || Number(formData.exam) < 0 || Number(formData.exam) > 10) {
            newErrors.exam = "Điểm thi phải từ 0 đến 10";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại form", { position: 'top-right' });
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                // Update
                console.log('formData before building payload:', formData);
                // quick client-side presence check before sending
                if (!formData.userId || !formData.courseId || formData.semester === '' || formData.semester === null || formData.semester === undefined) {
                    console.error('Missing required identifier in formData:', { userId: formData.userId, courseId: formData.courseId, semester: formData.semester });
                    toast.error('Thiếu trường bắt buộc: Sinh viên, Môn học hoặc Kỳ', { position: 'top-right' });
                    setLoading(false);
                    return;
                }

                const ukt1 = formData.ktqt1 !== '' ? Number(formData.ktqt1) : undefined;
                const ukt2 = formData.ktqt2 !== '' ? Number(formData.ktqt2) : undefined;
                const uex = formData.exam !== '' ? Number(formData.exam) : undefined;
                const uComputed = (ukt1 !== undefined && ukt2 !== undefined && uex !== undefined) ? +((((ukt1 + ukt2) / 2) + uex) / 2).toFixed(2) : undefined;
                const payload = {
                    userId: formData.userId,
                    courseId: formData.courseId,
                    ktqt1: ukt1,
                    ktqt2: ukt2,
                    exam: uex,
                    score: uComputed,
                    semester: Number(formData.semester),
                    notes: formData.notes || ''
                };
                console.log(' Updating grade with payload:', payload);
                const response = await axios.put(`http://localhost:8000/api/grade/${editingId}`, payload);
                if (response.data.success) {
                    toast.success('Cập nhật điểm thành công!', { position: 'top-right' });
                    fetchGrades();
                    setFormData({ userId: '', courseId: '', ktqt1: '', ktqt2: '', exam: '', semester: 1, notes: '' });
                    setEditingId(null);
                    setShowForm(false);
                }
            } else {
                // Create
                const kt1 = formData.ktqt1 !== '' ? Number(formData.ktqt1) : undefined;
                const kt2 = formData.ktqt2 !== '' ? Number(formData.ktqt2) : undefined;
                const ex = formData.exam !== '' ? Number(formData.exam) : undefined;
                const computedScore = (kt1 !== undefined && kt2 !== undefined && ex !== undefined) ? +((((kt1 + kt2) / 2) + ex) / 2).toFixed(2) : undefined;
                const payload = {
                    userId: formData.userId,
                    courseId: formData.courseId,
                    ktqt1: kt1,
                    ktqt2: kt2,
                    exam: ex,
                    score: computedScore,
                    semester: Number(formData.semester),
                    notes: formData.notes || ''
                };
                console.log(' Sending grade data:', payload);
                try {
                    console.log(' Sending JSON payload:', JSON.stringify(payload));
                } catch (e) {
                    console.log(' Could not stringify payload');
                }
                const response = await axios.post('http://localhost:8000/api/grade', payload);
                console.log(' Response:', response.data);
                if (response.data.success) {
                    toast.success('Tạo điểm thành công!', { position: 'top-right' });
                    fetchGrades();
                    setFormData({ userId: '', courseId: '', ktqt1: '', ktqt2: '', exam: '', semester: 1, notes: '' });
                    setShowForm(false);
                }
            }
        } catch (error) {
            console.error(' Error:', error);
            console.error(' Error status:', error.response?.status);
            console.error(' Error response raw:', error.response?.data);
            try { console.error(' Error response (string):', JSON.stringify(error.response?.data, null, 2)); } catch(e) {}
            const errorMessage = error.response?.data?.message || 'Lỗi!';
            toast.error(errorMessage, { position: 'top-right' });

            // If duplicate (student already has grade for the course), open edit form for that record
            try {
                const msg = (error.response?.data?.message || '').toLowerCase();
                if (msg.includes('đã có điểm') || msg.includes('điểm cho môn học')) {
                    // try to fetch existing grade for this user and course
                    const resp = await axios.get('http://localhost:8000/api/grade/all', {
                        params: { page: 1, limit: 1000, userId: formData.userId }
                    });
                    if (resp.data.success && Array.isArray(resp.data.data)) {
                        const found = resp.data.data.find(g => g.courseId && (g.courseId._id === formData.courseId || g.courseId === formData.courseId || g.courseId._id === (formData.courseId._id || formData.courseId)) );
                        if (found) {
                            toast('Bản ghi đã tồn tại — mở form sửa', { icon: 'ℹ️' });
                            handleEdit(found);
                        }
                    }
                }
            } catch (err2) {
                console.error('Error while trying to locate existing grade:', err2);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (gradeData) => {
        setFormData({
            userId: gradeData.userId._id,
            courseId: gradeData.courseId._id,
            ktqt1: gradeData.ktqt1 ?? gradeData.midterm ?? '',
            ktqt2: gradeData.ktqt2 ?? gradeData.final ?? '',
            exam: gradeData.exam ?? gradeData.assignment ?? '',
            semester: gradeData.semester,
            notes: gradeData.notes || ''
        });
        setEditingId(gradeData._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa điểm này?')) {
            try {
                const response = await axios.delete(`http://localhost:8000/api/grade/${id}`);
                if (response.data.success) {
                    toast.success('Xóa điểm thành công!', { position: 'top-right' });
                    fetchGrades();
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Lỗi xóa điểm!';
                toast.error(errorMessage, { position: 'top-right' });
            }
        }
    };

    // Export functions
    const csvEscape = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    };

    const exportCSV = () => {
        if (!grades || grades.length === 0) {
            toast('Không có dữ liệu để xuất', { icon: '⚠️' });
            return;
        }
        const headers = ['Mã SV','Họ tên','Môn Học','KTQT1','KTQT2','Điểm thi','Tổng kết','Xếp loại','Trạng thái','Ghi chú'];
        const rows = grades.map(g => [
            g.userId?.mssv || g.userId?._id || '',
            g.userId?.name || '',
            g.courseId?.courseName || '',
            g.ktqt1 ?? '',
            g.ktqt2 ?? '',
            g.exam ?? '',
            g.score ?? '',
            g.grade ?? '',
            g.status ?? '',
            g.notes ?? ''
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.map(csvEscape).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
        a.download = `grades-${ts}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const exportPDF = () => {
        if (!grades || grades.length === 0) {
            toast('Không có dữ liệu để xuất', { icon: '⚠️' });
            return;
        }
        // Build printable HTML
        const style = `
            table{border-collapse:collapse;width:100%;}
            th,td{border:1px solid #444;padding:6px;font-size:12px;}
            th{background:#0b4f8a;color:#fff}
        `;
        const headerHtml = `<h2>Danh sách điểm</h2><p>Xuất: ${new Date().toLocaleString()}</p>`;
        const tableHeader = `
            <tr>
                <th>Mã SV</th><th>Họ tên</th><th>Môn Học</th><th>KTQT1</th><th>KTQT2</th><th>Điểm thi</th><th>Tổng kết</th><th>Xếp loại</th><th>Trạng thái</th>
            </tr>`;
        const tableRows = grades.map(g => `
            <tr>
                <td>${g.userId?.mssv || g.userId?._id || ''}</td>
                <td>${g.userId?.name || ''}</td>
                <td>${g.courseId?.courseName || ''}</td>
                <td>${g.ktqt1 ?? ''}</td>
                <td>${g.ktqt2 ?? ''}</td>
                <td>${g.exam ?? ''}</td>
                <td>${g.score ?? ''}</td>
                <td>${g.grade ?? ''}</td>
                <td>${g.status ?? ''}</td>
            </tr>`).join('\n');

        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Export Grades</title><style>${style}</style></head><body>${headerHtml}<table>${tableHeader}${tableRows}</table></body></html>`;
        const w = window.open('', '_blank');
        if (!w) {
            toast.error('Trình duyệt chặn popup. Vui lòng cho phép popup để in.', { position: 'top-right' });
            return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
        // give browser a moment to render then trigger print
        setTimeout(() => {
            w.print();
        }, 500);
    };

    const handleCancel = () => {
        setFormData({ userId: '', courseId: '', score: '', semester: 1, notes: '' });
        setEditingId(null);
        setShowForm(false);
        setErrors({});
    };

    const getGradeColor = (grade) => {
        if (grade === 'A+' || grade === 'A') return '#4caf50';
        if (grade === 'B+' || grade === 'B') return '#2196f3';
        if (grade === 'C+' || grade === 'C') return '#ff9800';
        if (grade === 'D+' || grade === 'D') return '#f44336';
        return '#999';
    };

    const showComponent = (gradeObj, primary, secondary) => {
        const v1 = gradeObj?.[primary];
        if (v1 !== undefined && v1 !== null && v1 !== '') return v1;
        const v2 = gradeObj?.[secondary];
        if (v2 !== undefined && v2 !== null && v2 !== '') return v2;
        return '—';
    };

    return (
        <div className="management-container">
            <div className="management-header-with-back">
                <Link to="/" className="back-button-management">
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Trở về</span>
                </Link>
                <div className="management-header">
                    <div>
                        <h1> Quản lý Điểm</h1>
                        {user && <p className="user-info">Đăng nhập: <strong>{user.email}</strong></p>}
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <button 
                            className="btn btn-add"
                            onClick={() => setShowForm(!showForm)}
                        >
                            <i className="fa-solid fa-plus me-2"></i>
                            {showForm ? 'Hủy' : 'Nhập Điểm'}
                        </button>
                        <button className="btn btn-outline" onClick={exportCSV} title="Xuất CSV/Excel">
                            <i className="fa-solid fa-file-csv me-2"></i> Xuất CSV
                        </button>
                        <button className="btn btn-outline" onClick={exportPDF} title="Xuất PDF">
                            <i className="fa-solid fa-file-pdf me-2"></i> Xuất PDF
                        </button>
                    </div>
                </div>
                        </div>
                        {/* Card tổng quan điểm */}
                        <div className="grade-summary-cards mt-3">
                            <div className="grade-summary-card grade-summary-green">
                                <div className="grade-summary-icon"><i className="fa-solid fa-chart-line"></i></div>
                                <div>
                                    <div className="grade-summary-title">Tổng điểm đã nhập</div>
                                    <div className="grade-summary-value">{grades.length}</div>
                                </div>
                            </div>
                            <div className="grade-summary-card grade-summary-blue">
                                <div className="grade-summary-icon"><i className="fa-solid fa-user-graduate"></i></div>
                                <div>
                                    <div className="grade-summary-title">Số sinh viên có điểm</div>
                                    <div className="grade-summary-value">{[...new Set(grades.map(g => g.userId._id))].length}</div>
                                </div>
                            </div>
                            <div className="grade-summary-card grade-summary-orange">
                                <div className="grade-summary-icon"><i className="fa-solid fa-book"></i></div>
                                <div>
                                    <div className="grade-summary-title">Số môn đã nhập điểm</div>
                                    <div className="grade-summary-value">{[...new Set(grades.map(g => g.courseId._id))].length}</div>
                                </div>
                            </div>
                        </div>

            {/* Bộ Lọc */}
            <div className="filter-section">
                <div className="filter-group">
                    <label htmlFor="studentFilter">Lọc theo Sinh Viên:</label>
                    <select
                        id="studentFilter"
                        name="studentFilter"
                        value={filters.studentFilter}
                        onChange={handleFilterChange}
                        className="form-control"
                    >
                        <option value="">Tất cả sinh viên</option>
                        {students.map(student => (
                            <option key={student._id} value={student._id}>
                                {student.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="semesterFilter">Lọc theo Kỳ Học:</label>
                    <select
                        id="semesterFilter"
                        name="semesterFilter"
                        value={filters.semesterFilter}
                        onChange={handleFilterChange}
                        className="form-control"
                    >
                        <option value="">Tất cả kỳ</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Kỳ {sem}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Form Thêm/Sửa Điểm */}
            {showForm && (
                <div className="form-section">
                    <h3>{editingId ? ' Sửa Điểm' : ' Nhập Điểm Mới'}</h3>
                    {students.length === 0 && !studentLoading && (
                        <div style={{padding:'16px',background:'#fff3cd',border:'1px solid #ffc107',borderRadius:'8px',marginBottom:'16px'}}>
                            <strong>⚠️ Chưa có sinh viên nào trong hệ thống!</strong>
                            <p style={{margin:'8px 0 0 0'}}>Vui lòng <Link to="/students" style={{color:'var(--primary)',fontWeight:'bold'}}>thêm sinh viên</Link> trước khi nhập điểm.</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="management-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="userId">Sinh Viên <span className="required">*</span></label>
                                <select
                                    id="userId"
                                    name="userId"
                                    className={`form-control ${errors.userId ? 'is-invalid' : ''}`}
                                    value={formData.userId}
                                    onChange={handleChange}
                                    disabled={loading || editingId}
                                >
                                    <option value="">-- Chọn sinh viên --</option>
                                    {studentLoading && <option disabled> Đang tải danh sách...</option>}
                                    {!studentLoading && students.length === 0 && <option disabled> Chưa có sinh viên (Vui lòng thêm sinh viên trước)</option>}
                                    {!studentLoading && students.map(student => (
                                        <option key={student._id} value={student._id}>
                                            {student.name} {student.email ? `(${student.email})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.userId && <div className="error-message">{errors.userId}</div>}
                                {studentError && <div className="info-message" style={{color:'#b55'}}>{studentError}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="courseId">Môn Học <span className="required">*</span></label>
                                <select
                                    id="courseId"
                                    name="courseId"
                                    className={`form-control ${errors.courseId ? 'is-invalid' : ''}`}
                                    value={formData.courseId}
                                    onChange={handleChange}
                                    disabled={loading || editingId}
                                >
                                    <option value="">-- Chọn môn học --</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.courseName} ({course.code})
                                        </option>
                                    ))}
                                </select>
                                {errors.courseId && <div className="error-message">{errors.courseId}</div>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ktqt1">KTQT1 <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="ktqt1"
                                    name="ktqt1"
                                    step="0.5"
                                    min="0"
                                    max="10"
                                    className={`form-control ${errors.ktqt1 ? 'is-invalid' : ''}`}
                                    placeholder="0 - 10"
                                    value={formData.ktqt1}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                {errors.ktqt1 && <div className="error-message">{errors.ktqt1}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="ktqt2">KTQT2 <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="ktqt2"
                                    name="ktqt2"
                                    step="0.5"
                                    min="0"
                                    max="10"
                                    className={`form-control ${errors.ktqt2 ? 'is-invalid' : ''}`}
                                    placeholder="0 - 10"
                                    value={formData.ktqt2}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                {errors.ktqt2 && <div className="error-message">{errors.ktqt2}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="exam">Điểm thi <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="exam"
                                    name="exam"
                                    step="0.5"
                                    min="0"
                                    max="10"
                                    className={`form-control ${errors.exam ? 'is-invalid' : ''}`}
                                    placeholder="0 - 10"
                                    value={formData.exam}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                {errors.exam && <div className="error-message">{errors.exam}</div>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="semester">Kỳ Học <span className="required">*</span></label>
                                <select
                                    id="semester"
                                    name="semester"
                                    className="form-control"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Kỳ {n}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Ghi Chú</label>
                            <textarea
                                id="notes"
                                name="notes"
                                className="form-control"
                                placeholder="Ghi chú (optional)"
                                rows="2"
                                value={formData.notes}
                                onChange={handleChange}
                                disabled={loading}
                                maxLength="300"
                            ></textarea>
                            <small className="text-muted">{formData.notes.length}/300</small>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? ' Đang xử lý...' : editingId ? ' Cập Nhật' : ' Thêm Điểm'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
                                ✕ Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bảng Danh Sách Điểm */}
            <div className="table-section">
                {grades.length === 0 ? (
                    <div className="empty-state">
                        <i className="fa-solid fa-chart-line"></i>
                        <p>Chưa có điểm nào. Hãy thêm điểm mới!</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="management-table">
                            <thead>
                                <tr>
                                    <th>Mã SV</th>
                                    <th>Họ tên</th>
                                    <th>Môn Học</th>
                                    <th>KTQT1</th>
                                    <th>KTQT2</th>
                                    <th>Điểm thi</th>
                                    <th>Tổng kết</th>
                                    <th>Xếp loại</th>
                                    <th>Trạng thái</th>
                                    <th className="actions">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map((grade) => (
                                    <tr key={grade._id}>
                                        <td>{grade.userId?.mssv || grade.userId?._id}</td>
                                        <td><strong>{grade.userId?.name}</strong></td>
                                        <td>{grade.courseId?.courseName}</td>
                                        <td>{showComponent(grade, 'ktqt1', 'midterm')}</td>
                                        <td>{showComponent(grade, 'ktqt2', 'final')}</td>
                                        <td>{showComponent(grade, 'exam', 'assignment')}</td>
                                        <td><strong className="score-text">{grade.score}</strong></td>
                                        <td>
                                            <span 
                                                className="badge" 
                                                style={{ 
                                                    backgroundColor: getGradeColor(grade.grade),
                                                    color: 'white'
                                                }}
                                            >
                                                {grade.grade}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${grade.status === 'Đạt' ? 'pass' : 'fail'}`}>
                                                {grade.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn btn-sm btn-edit"
                                                    onClick={() => handleEdit(grade)}
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(grade._id)}
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* debug panel removed */}
            </div>
        </div>
    );
};

export default GradeManagement;
