import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './MajorManagement.css';

const MajorManagement = () => {
    const { user } = useAuth();
    const [majors, setMajors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        majorName: '',
        code: '',
        description: ''
    });

    const [errors, setErrors] = useState({});

    // Lấy danh sách chuyên ngành
    const fetchMajors = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/major/all?page=1&limit=100');
            if (response.data.success) {
                setMajors(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi lấy dữ liệu chuyên ngành:', error);
            toast.error('Lỗi lấy danh sách chuyên ngành!', { position: 'top-right' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMajors();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.majorName.trim()) {
            newErrors.majorName = ' Tên chuyên ngành là bắt buộc';
        } else if (formData.majorName.length < 3) {
            newErrors.majorName = ' Tên chuyên ngành phải có ít nhất 3 ký tự';
        }

        if (!formData.code.trim()) {
            newErrors.code = ' Mã chuyên ngành là bắt buộc';
        } else if (formData.code.length < 2) {
            newErrors.code = ' Mã chuyên ngành phải có ít nhất 2 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'code' ? value.toUpperCase() : value
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
                // Cập nhật chuyên ngành
                const response = await axios.put(`http://localhost:8000/api/major/${editingId}`, formData);
                if (response.data.success) {
                    toast.success('Cập nhật chuyên ngành thành công!', { position: 'top-right' });
                    fetchMajors();
                    window.dispatchEvent(new Event('dataUpdated'));
                    setFormData({ majorName: '', code: '', description: '' });
                    setEditingId(null);
                    setShowForm(false);
                }
            } else {
                // Tạo chuyên ngành mới
                const response = await axios.post('http://localhost:8000/api/major', formData);
                if (response.data.success) {
                    toast.success('Tạo chuyên ngành thành công!', { position: 'top-right' });
                    fetchMajors();
                    window.dispatchEvent(new Event('dataUpdated'));
                    setFormData({ majorName: '', code: '', description: '' });
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

    const handleEdit = (majorData) => {
        setFormData({
            majorName: majorData.majorName,
            code: majorData.code,
            description: majorData.description
        });
        setEditingId(majorData._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa chuyên ngành này?')) {
            try {
                const response = await axios.delete(`http://localhost:8000/api/major/${id}`);
                if (response.data.success) {
                    toast.success('Xóa chuyên ngành thành công!', { position: 'top-right' });
                    fetchMajors();
                    window.dispatchEvent(new Event('dataUpdated'));
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Lỗi xóa chuyên ngành!';
                toast.error(errorMessage, { position: 'top-right' });
            }
        }
    };

    const handleCancel = () => {
        setFormData({ majorName: '', code: '', description: '' });
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
                        <h1> Quản lý Chuyên Ngành</h1>
                        {user && <p className="user-info">Đăng nhập: <strong>{user.email}</strong></p>}
                    </div>
                    <button 
                        className="btn btn-add"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <i className="fa-solid fa-plus me-2"></i>
                        {showForm ? 'Hủy' : 'Thêm Chuyên Ngành'}
                    </button>
                </div>
                        </div>
                        {/* Card tổng quan ngành học */}
                        <div className="major-summary-cards mt-3">
                            <div className="major-summary-card major-summary-green">
                                <div className="major-summary-icon"><i className="fa-solid fa-graduation-cap"></i></div>
                                <div>
                                    <div className="major-summary-title">Tổng ngành học</div>
                                    <div className="major-summary-value">{majors.length}</div>
                                </div>
                            </div>
                            <div className="major-summary-card major-summary-blue">
                                <div className="major-summary-icon"><i className="fa-solid fa-layer-group"></i></div>
                                <div>
                                    <div className="major-summary-title">Tổng số lớp</div>
                                    <div className="major-summary-value">{majors.reduce((sum, m) => sum + (m.totalClasses || 0), 0)}</div>
                                </div>
                            </div>
                        </div>

            {/* Form Thêm/Sửa Chuyên Ngành */}
            {showForm && (
                <div className="form-section">
                    <h3>{editingId ? ' Sửa Chuyên Ngành' : ' Thêm Chuyên Ngành Mới'}</h3>
                    <form onSubmit={handleSubmit} className="management-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="majorName">Tên Chuyên Ngành <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="majorName"
                                    name="majorName"
                                    className={`form-control ${errors.majorName ? 'is-invalid' : ''}`}
                                    placeholder="VD: Công nghệ thông tin..."
                                    value={formData.majorName}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                {errors.majorName && <div className="error-message">{errors.majorName}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="code">Mã Chuyên Ngành <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="code"
                                    name="code"
                                    className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                                    placeholder="VD: CNTT, KTPM, DHMT..."
                                    value={formData.code}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                {errors.code && <div className="error-message">{errors.code}</div>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Mô Tả</label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-control"
                                placeholder="Nhập mô tả chuyên ngành (tuỳ chọn)..."
                                value={formData.description}
                                onChange={handleChange}
                                disabled={loading}
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Đang xử lý...' : editingId ? ' Cập Nhật' : ' Thêm Chuyên Ngành'}
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

            {/* Bảng Danh Sách Chuyên Ngành */}
            {loading && !showForm ? (
                <div className="alert alert-info">Đang tải dữ liệu...</div>
            ) : (
                <div className="table-section">
                    {majors.length === 0 ? (
                        <div className="empty-state">
                            <i className="fa-solid fa-inbox"></i>
                            <p>Chưa có chuyên ngành nào. Hãy thêm chuyên ngành mới!</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="management-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Mã</th>
                                        <th>Tên Chuyên Ngành</th>
                                        <th>Mô Tả</th>
                                        <th>Số Lớp</th>
                                        <th className="actions">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {majors.map((majorData, index) => (
                                        <tr key={majorData._id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span className="badge badge-code">
                                                    {majorData.code}
                                                </span>
                                            </td>
                                            <td><strong>{majorData.majorName}</strong></td>
                                            <td>{majorData.description || '-'}</td>
                                            <td>
                                                <span className="badge badge-info">
                                                    {majorData.totalClasses} lớp
                                                </span>
                                            </td>
                                            <td className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-edit"
                                                    onClick={() => handleEdit(majorData)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(majorData._id)}
                                                    title="Xóa"
                                                    disabled={majorData.totalClasses > 0}
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

export default MajorManagement;
