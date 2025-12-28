import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_this";
import Auth from '../model/authModel.js';

// Middleware kiểm tra JWT token
export const protectRoute = async (req, res, next) => {
    try {
        // Lấy token từ nhiều nguồn: Authorization header, x-access-token, query, body
        const authHeader = req.headers.authorization || req.headers['x-access-token'] || req.query.token || req.body.token;
        // Nếu header dạng "Bearer <token>" hoặc "Bearer<token>", trích token
        let token;
        if (authHeader) {
            if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer')) {
                const parts = authHeader.split(' ');
                token = parts.length > 1 ? parts[1] : authHeader.slice(6);
            } else {
                token = authHeader;
            }
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để truy cập" });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;

        // Get full user object (to access role)
        const user = await Auth.findById(decoded.userId).select('-password');
        if (user) req.user = user;

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn"
        });
    }
};

// Middleware kiểm tra role là admin
export const isAdmin = (req, res, next) => {
    try {
        // Lấy user từ protectRoute middleware
        if (req.user && req.user.role === "admin") {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền truy cập"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
