import jwt from "jsonwebtoken";
import Auth from "../model/authModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_this";
const JWT_EXPIRE = "7d"; // Token hết hạn sau 7 ngày

// Hàm helper xử lý lỗi MongoDB
const handleValidationError = (error) => {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return { status: 400, message: messages.join(', ') };
    }
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return { status: 400, message: `${field} này đã tồn tại trong hệ thống` };
    }
    return { status: 500, message: error.message };
};

// Hàm tạo JWT token
const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
    );
};

// REGISTER - Đăng ký tài khoản mới
export const register = async (req, res) => {
    try {
        const { email, password, passwordConfirm } = req.body;

        // Validation cơ bản
        if (!email || !password || !passwordConfirm) {
            return res.status(400).json({
                success: false,
                message: "Email, mật khẩu và xác nhận mật khẩu là bắt buộc"
            });
        }

        // Kiểm tra password và passwordConfirm trùng khớp
        if (password !== passwordConfirm) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu không trùng khớp"
            });
        }

        // Kiểm tra email đã tồn tại
        const existingUser = await Auth.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email này đã được đăng ký"
            });
        }

        // Tạo user mới
        const newAuth = new Auth({
            email: email.toLowerCase(),
            password,
            role: "user"
        });

        const saveData = await newAuth.save();

        // Tạo token
        const token = generateToken(saveData._id, saveData.email);

        res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản thành công",
            token,
            user: {
                id: saveData._id,
                email: saveData.email,
                role: saveData.role
            }
        });
    } catch (error) {
        const errorResponse = handleValidationError(error);
        res.status(errorResponse.status).json({
            success: false,
            message: errorResponse.message
        });
    }
};

// LOGIN - Đăng nhập
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation cơ bản
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email và mật khẩu là bắt buộc"
            });
        }

        // Tìm user theo email (cần select password vì mặc định không trả về)
        const user = await Auth.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        // So sánh password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        // Tạo token
        const token = generateToken(user._id, user.email);

        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// VERIFY TOKEN - Kiểm tra token có hợp lệ không
export const verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token không tồn tại"
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await Auth.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Người dùng không tồn tại"
            });
        }

        res.status(200).json({
            success: true,
            message: "Token hợp lệ",
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Token không hợp lệ"
        });
    }
};

// GET CURRENT USER
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId; // Được set bởi middleware

        const user = await Auth.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Người dùng không tồn tại"
            });
        }

        res.status(200).json({
            success: true,
            message: "Lấy thông tin người dùng thành công",
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// LOGOUT (Client side)
export const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Đăng xuất thành công"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
