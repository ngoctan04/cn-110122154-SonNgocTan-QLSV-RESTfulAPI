import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set default API base URL to backend server
// Backend running locally on port 8000 (see server/index.js logs)
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Kiểm tra token khi component mount — gọi backend để verify token
    useEffect(() => {
        // In development, always show login first by clearing any stored token/user
        if (process.env.NODE_ENV === 'development') {
            logout();
            setLoading(false);
            return;
        }
        const initializeAuth = async () => {
            setLoading(true);
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken) {
                try {
                    // Verify token with backend (send header explicitly)
                    const res = await axios.post('/api/auth/verify-token', null, {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });

                    if (res.data && res.data.success) {
                        setToken(storedToken);
                        setIsAuthenticated(true);
                        // Prefer server user data
                        if (res.data.user) {
                            setUser(res.data.user);
                            localStorage.setItem('user', JSON.stringify(res.data.user));
                        } else if (storedUser) {
                            try {
                                setUser(JSON.parse(storedUser));
                            } catch (error) {
                                console.error('Error parsing user:', error);
                                localStorage.removeItem('user');
                            }
                        }
                    } else {
                        // Invalid token
                        logout();
                    }
                } catch (error) {
                    // Token invalid or request failed
                    console.warn('Token verification failed:', error?.response?.data?.message || error.message);
                    logout();
                }
            } else {
                // No token — clear any stale user data
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (error) {
                        console.error('Error parsing user:', error);
                        localStorage.removeItem('user');
                    }
                }
            }

            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Sync axios Authorization header with current token
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }

        // Response interceptor to handle 401 Unauthorized globally
        const resInterceptor = axios.interceptors.response.use(
            response => response,
            error => {
                const status = error?.response?.status;
                if (status === 401) {
                    // Invalid or expired token -> force logout
                    logout();
                    // Optionally, we could navigate to login here, but leave to components
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(resInterceptor);
        };
    }, [token]);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        setIsAuthenticated(true);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const register = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        setIsAuthenticated(true);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated,
                login,
                register,
                logout,
                setUser,
                setToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
