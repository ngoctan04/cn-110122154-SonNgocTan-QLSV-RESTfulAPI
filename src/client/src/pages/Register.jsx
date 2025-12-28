import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = '❌ Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '❌ Email không hợp lệ';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = '❌ Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = '❌ Mật khẩu phải có ít nhất 6 ký tự';
        }

        // Password confirm validation
        if (!formData.passwordConfirm) {
            newErrors.passwordConfirm = '❌ Xác nhận mật khẩu là bắt buộc';
        } else if (formData.password !== formData.passwordConfirm) {
            newErrors.passwordConfirm = '❌ Mật khẩu không trùng khớp';
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

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/auth/register', {
                email: formData.email,
                password: formData.password,
                passwordConfirm: formData.passwordConfirm
            });

            if (response.data.success) {
                // Lưu token và user vào context
                register(response.data.user, response.data.token);

                toast.success(response.data.message, { position: 'top-right' });

                // Chuyển hướng tới dashboard
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi đăng ký!';
            toast.error(errorMessage, { position: 'top-right' });
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-panel" aria-hidden="true" />

            <div className="auth-left">
                <div className="auth-box">
                    <div className="auth-marquee" aria-hidden="true">
                        <div className="marquee-track" aria-hidden="true" data-text="— Tạo tài khoản Quản lý Sinh viên —   — Nhập thông tin và bắt đầu sử dụng —   — Kiểm tra email để kích hoạt (nếu cần) —   — Hỗ trợ: admin@university.edu —">
                            <span>— Tạo tài khoản Quản lý Sinh viên —</span>
                            <span>— Nhập thông tin và bắt đầu sử dụng —</span>
                            <span>— Kiểm tra email để kích hoạt (nếu cần) —</span>
                            <span>— Hỗ trợ: admin@university.edu —</span>
                        </div>
                    </div>
                    <div className="auth-brand">
                        <img src="/logo1.png" alt="logo" className="auth-brand-img" />
                    </div>
                    <div className="auth-header">
                        <h1>Đăng Ký</h1>
                        <p>Tạo tài khoản quản lý sinh viên</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                <i className="fa-solid fa-envelope"></i> Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                placeholder="Nhập email của bạn"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.email && <div className="error-message">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                <i className="fa-solid fa-lock"></i> Mật khẩu
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.password && <div className="error-message">{errors.password}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="passwordConfirm" className="form-label">
                                <i className="fa-solid fa-lock"></i> Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                id="passwordConfirm"
                                name="passwordConfirm"
                                className={`form-control ${errors.passwordConfirm ? 'is-invalid' : ''}`}
                                placeholder="Nhập lại mật khẩu"
                                value={formData.passwordConfirm}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.passwordConfirm && <div className="error-message">{errors.passwordConfirm}</div>}
                        </div>

                        <button type="submit" className="btn btn-register" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Đang đăng ký...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-user-plus me-2"></i>
                                    Đăng Ký
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <div className="right-overlay">
                    <h2>Quản lý học tập hiệu quả &amp; chuyên nghiệp</h2>
                    <p>Truy cập điểm số, lịch thi và tài liệu học tập mọi lúc mọi nơi với nền tảng EduManager.</p>
                </div>
            </div>
        </div>
    );
};

export default Register;
