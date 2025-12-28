import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './ClassManagement.css';

const ClassManagement = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [majors, setMajors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        className: '',
        description: '',
        majorId: ''
    });

    const [errors, setErrors] = useState({});

    // Lấy danh sách lớp
    const fetchClasses = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/class/all?page=1&limit=100');
            if (response.data.success) {
                setClasses(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi lấy dữ liệu lớp:', error);
            toast.error('Lỗi lấy danh sách lớp!', { position: 'top-right' });
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách chuyên ngành
    const fetchMajors = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/major/dropdown');
            if (response.data.success) {
                setMajors(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi lấy dữ liệu chuyên ngành:', error);
        }
    };

    useEffect(() => {
        fetchClasses();
        fetchMajors();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.className.trim()) {
            newErrors.className = ' Tên lớp là bắt buộc';
        } else if (formData.className.length < 3) {
            newErrors.className = ' Tên lớp phải có ít nhất 3 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            if (editingId) {
                // Cập nhật lớp
                const response = await axios.put(`http://localhost:8000/api/class/${editingId}`, formData);
                if (response.data.success) {
                    toast.success('Cập nhật lớp thành công!', { position: 'top-right' });
                    fetchClasses();
                    // Notify other pages to refresh data
                    window.dispatchEvent(new Event('dataUpdated'));
                    setFormData({ className: '', description: '', majorId: '' });
                    setEditingId(null);
                    setShowForm(false);
                }
            } else {
                // Tạo lớp mới
                const response = await axios.post('http://localhost:8000/api/class', formData);
                if (response.data.success) {
                    toast.success('Tạo lớp thành công!', { position: 'top-right' });
                    fetchClasses();
                    window.dispatchEvent(new Event('dataUpdated'));
                    setFormData({ className: '', description: '', majorId: '' });
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

    const handleEdit = (classData) => {
        setFormData({
            className: classData.className,
            description: classData.description,
            majorId: classData.majorId?._id || ''
        });
        setEditingId(classData._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lớp này?')) {
            try {
                const response = await axios.delete(`http://localhost:8000/api/class/${id}`);
                if (response.data.success) {
                    toast.success('Xóa lớp thành công!', { position: 'top-right' });
                    fetchClasses();
                    window.dispatchEvent(new Event('dataUpdated'));
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Lỗi xóa lớp!';
                toast.error(errorMessage, { position: 'top-right' });
            }
        }
    };

    const handleCancel = () => {
        setFormData({ className: '', description: '', majorId: '' });
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
                        <h1> Quản lý Lớp học</h1>
                        {user && <p className="user-info">Đăng nhập: <strong>{user.email}</strong></p>}
                    </div>
                    <button 
                        className="btn btn-add"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <i className="fa-solid fa-plus me-2"></i>
                        {showForm ? 'Hủy' : 'Thêm Lớp'}
                    </button>
                </div>
                        </div>
                        {/* Card tổng quan lớp học */}
                        <div className="class-summary-cards mt-3">
                            <div className="class-summary-card class-summary-green">
                                <div className="class-summary-icon"><i className="fa-solid fa-layer-group"></i></div>
                                <div>
                                    <div className="class-summary-title">Tổng số lớp</div>
                                    <div className="class-summary-value">{classes.length}</div>
                                </div>
                            </div>
                            <div className="class-summary-card class-summary-blue">
                                <div className="class-summary-icon"><i className="fa-solid fa-graduation-cap"></i></div>
                                <div>
                                    <div className="class-summary-title">Chuyên ngành</div>
                                    <div className="class-summary-value">{majors.length}</div>
                                </div>
                            </div>
                        </div>

            {/* Form Thêm/Sửa Lớp */}
            {showForm && (
                <div className="form-section">
                    <h3>{editingId ? '✏️ Sửa Lớp' : '➕ Thêm Lớp Mới'}</h3>
                    <form onSubmit={handleSubmit} className="management-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="className">Tên Lớp <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="className"
                                    name="className"
                                    className={`form-control ${errors.className ? 'is-invalid' : ''}`}
                                    placeholder="VD: CNTT01, KTPM02..."
                                    value={formData.className}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                {errors.className && <div className="error-message">{errors.className}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="majorId">Chuyên Ngành</label>
                                <select
                                    id="majorId"
                                    name="majorId"
                                    className="form-control"
                                    value={formData.majorId}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="">-- Chọn chuyên ngành --</option>
                                    {majors.map(major => (
                                        <option key={major._id} value={major._id}>
                                            {major.majorName} ({major.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Mô Tả</label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-control"
                                placeholder="Nhập mô tả lớp (tuỳ chọn)..."
                                value={formData.description}
                                onChange={handleChange}
                                disabled={loading}
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Đang xử lý...' : editingId ? ' Cập Nhật' : ' Thêm Lớp'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bảng Danh Sách Lớp */}
            {loading && !showForm ? (
                <div className="alert alert-info">Đang tải dữ liệu...</div>
            ) : (
                <div className="table-section">
                    {classes.length === 0 ? (
                        <div className="empty-state">
                            <i className="fa-solid fa-inbox"></i>
                            <p>Chưa có lớp nào. Hãy thêm lớp mới!</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="management-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Tên Lớp</th>
                                        <th>Chuyên Ngành</th>
                                        <th>Mô Tả</th>
                                        <th className="actions">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.map((classData, index) => (
                                        <tr key={classData._id}>
                                            <td>{index + 1}</td>
                                            <td><strong>{classData.className}</strong></td>
                                            <td>
                                                {classData.majorId ? (
                                                    <span className="badge badge-major">
                                                        {classData.majorId.majorName}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">Chưa chọn</span>
                                                )}
                                            </td>
                                            <td>{classData.description || '-'}</td>
                                            <td className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-edit"
                                                    onClick={() => handleEdit(classData)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(classData._id)}
                                                    title="Xóa"
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassManagement;
