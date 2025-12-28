import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = ' Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = ' Email không hợp lệ';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = ' Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = ' Mật khẩu phải có ít nhất 6 ký tự';
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
            const response = await axios.post('http://localhost:8000/api/auth/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                // Lưu token và user vào context
                login(response.data.user, response.data.token);

                toast.success(response.data.message, { position: 'top-right' });

                // Chuyển hướng tới trang admin (root)
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi đăng nhập!';
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
                        <div className="marquee-track" aria-hidden="true" data-text="— Chào mừng đến với Hệ thống Quản lý Sinh viên —   — Hãy đăng nhập để tiếp tục —   — Liên hệ admin nếu cần hỗ trợ —   — Chúc bạn học tập hiệu quả —">
                            <span>— Chào mừng đến với Hệ thống Quản lý Sinh viên —</span>
                            <span>— Hãy đăng nhập để tiếp tục —</span>
                            <span>— Liên hệ admin nếu cần hỗ trợ —</span>
                            <span>— Chúc bạn học tập hiệu quả —</span>
                        </div>
                    </div>
                    <div className="auth-brand">
                        <img src="/logo1.png" alt="logo" className="auth-brand-img" />
                    </div>
                    <div className="auth-header">
                        <h1>Quản lý sinh viên</h1>
                        <p>Đăng nhập vào hệ thống quản lý sinh viên của bạn.</p>
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
                                placeholder="Nhập mật khẩu của bạn"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.password && <div className="error-message">{errors.password}</div>}
                        </div>

                        <button type="submit" className="btn btn-login" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Đang đăng nhập...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-arrow-right-to-bracket me-2"></i>
                                    Đăng Nhập
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
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

export default Login;
