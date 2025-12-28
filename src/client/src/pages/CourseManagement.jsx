import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './CourseManagement.css';

const CourseManagement = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        courseName: '',
        code: '',
        credits: 3,
        semester: 1,
        description: '',
        instructor: ''
    });

    const [errors, setErrors] = useState({});

    // Lấy danh sách môn học
    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/course/all?page=1&limit=100');
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi lấy dữ liệu môn học:', error);
            toast.error('Lỗi lấy danh sách môn học!', { position: 'top-right' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.courseName.trim()) {
            newErrors.courseName = "Tên môn học là bắt buộc";
        } else if (formData.courseName.length < 3) {
            newErrors.courseName = "Tên môn học phải có ít nhất 3 ký tự";
        }

        if (!formData.code.trim()) {
            newErrors.code = "Mã môn học là bắt buộc";
        } else if (formData.code.length < 2) {
            newErrors.code = "Mã môn học phải có ít nhất 2 ký tự";
        }

        if (!formData.credits || formData.credits < 1 || formData.credits > 6) {
            newErrors.credits = "Số tín chỉ phải từ 1 đến 6";
        }

        if (!formData.semester || formData.semester < 1 || formData.semester > 8) {
            newErrors.semester = "Kỳ học phải từ 1 đến 8";
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
                const response = await axios.put(`http://localhost:8000/api/course/${editingId}`, formData);
                if (response.data.success) {
                    toast.success('Cập nhật môn học thành công!', { position: 'top-right' });
                    fetchCourses();
                    setFormData({ courseName: '', code: '', credits: 3, semester: 1, description: '', instructor: '' });
                    setEditingId(null);
                    setShowForm(false);
                }
            } else {
                // Create
                const response = await axios.post('http://localhost:8000/api/course', formData);
                if (response.data.success) {
                    toast.success('Tạo môn học thành công!', { position: 'top-right' });
                    fetchCourses();
                    setFormData({ courseName: '', code: '', credits: 3, semester: 1, description: '', instructor: '' });
                    setShowForm(false);
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi!';
            toast.error(errorMessage, { position: 'top-right' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (courseData) => {
        setFormData({
            courseName: courseData.courseName,
            code: courseData.code,
            credits: courseData.credits,
            semester: courseData.semester,
            description: courseData.description || '',
            instructor: courseData.instructor || ''
        });
        setEditingId(courseData._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
            try {
                const response = await axios.delete(`http://localhost:8000/api/course/${id}`);
                if (response.data.success) {
                    toast.success('Xóa môn học thành công!', { position: 'top-right' });
                    fetchCourses();
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Lỗi xóa môn học!';
                toast.error(errorMessage, { position: 'top-right' });
            }
        }
    };

    const handleCancel = () => {
        setFormData({ courseName: '', code: '', credits: 3, semester: 1, description: '', instructor: '' });
        setEditingId(null);
        setShowForm(false);
        setErrors({});
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
                        <h1> Quản lý Môn Học</h1>
                        {user && <p className="user-info">Đăng nhập: <strong>{user.email}</strong></p>}
                    </div>
                    <button 
                        className="btn btn-add"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <i className="fa-solid fa-plus me-2"></i>
                        {showForm ? 'Hủy' : 'Thêm Môn Học'}
                    </button>
                </div>
                        </div>
                        {/* Card tổng quan môn học */}
                        <div className="course-summary-cards mt-3">
                            <div className="course-summary-card course-summary-blue">
                                <div className="course-summary-icon"><i className="fa-solid fa-book"></i></div>
                                <div>
                                    <div className="course-summary-title">Tổng môn học</div>
                                    <div className="course-summary-value">{courses.length}</div>
                                </div>
                            </div>
                            <div className="course-summary-card course-summary-green">
                                <div className="course-summary-icon"><i className="fa-solid fa-user-graduate"></i></div>
                                <div>
                                    <div className="course-summary-title">Tổng tín chỉ</div>
                                    <div className="course-summary-value">{courses.reduce((sum, c) => sum + (c.credits || 0), 0)}</div>
                                </div>
                            </div>
                        </div>

            {/* Form Thêm/Sửa Môn Học */}
            {showForm && (
                <div className="form-section">
                    <h3>{editingId ? ' Sửa Môn Học' : ' Thêm Môn Học Mới'}</h3>
                    <form onSubmit={handleSubmit} className="management-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="courseName">Tên Môn Học <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="courseName"
                                    name="courseName"
                                    className={`form-control ${errors.courseName ? 'is-invalid' : ''}`}
                                    placeholder="VD: Lập Trình Hướng Đối Tượng"
                                    value={formData.courseName}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                {errors.courseName && <div className="error-message">{errors.courseName}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="code">Mã Môn Học <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="code"
                                    name="code"
                                    className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                                    placeholder="VD: PROG101"
                                    value={formData.code}
                                    onChange={(e) => handleChange({ target: { name: 'code', value: e.target.value.toUpperCase() } })}
                                    disabled={loading}
                                />
                                {errors.code && <div className="error-message">{errors.code}</div>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="credits">Số Tín Chỉ <span className="required">*</span></label>
                                <select
                                    id="credits"
                                    name="credits"
                                    className={`form-control ${errors.credits ? 'is-invalid' : ''}`}
                                    value={formData.credits}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} tín chỉ</option>)}
                                </select>
                                {errors.credits && <div className="error-message">{errors.credits}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="semester">Kỳ Học <span className="required">*</span></label>
                                <select
                                    id="semester"
                                    name="semester"
                                    className={`form-control ${errors.semester ? 'is-invalid' : ''}`}
                                    value={formData.semester}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Kỳ {n}</option>)}
                                </select>
                                {errors.semester && <div className="error-message">{errors.semester}</div>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="instructor">Giảng Viên</label>
                            <input
                                type="text"
                                id="instructor"
                                name="instructor"
                                className="form-control"
                                placeholder="Tên giảng viên (optional)"
                                value={formData.instructor}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Mô Tả</label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-control"
                                placeholder="Mô tả môn học (optional)"
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                                disabled={loading}
                            ></textarea>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? ' Đang xử lý...' : editingId ? ' Cập Nhật' : ' Thêm Môn Học'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
                                ✕ Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bảng Danh Sách Môn Học */}
            <div className="table-section">
                {courses.length === 0 ? (
                    <div className="empty-state">
                        <i className="fa-solid fa-book"></i>
                        <p>Chưa có môn học nào. Hãy thêm môn học mới!</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="management-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên Môn Học</th>
                                    <th>Mã</th>
                                    <th>Tín Chỉ</th>
                                    <th>Kỳ</th>
                                    <th>Giảng Viên</th>
                                    <th className="actions">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course, index) => (
                                    <tr key={course._id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{course.courseName}</strong></td>
                                        <td><span className="badge badge-code">{course.code}</span></td>
                                        <td><span className="badge badge-info">{course.credits}</span></td>
                                        <td><span className="badge badge-semester">Kỳ {course.semester}</span></td>
                                        <td>{course.instructor || 'N/A'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn btn-sm btn-edit"
                                                    onClick={() => handleEdit(course)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-delete"
                                                    onClick={() => handleDelete(course._id)}
                                                    title="Xóa"
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
            </div>
        </div>
    );
};

export default CourseManagement;
