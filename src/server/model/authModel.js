import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const authSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email là bắt buộc"],
        unique: [true, "Email này đã tồn tại"],
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Định dạng email không hợp lệ"]
    },
    password: {
        type: String,
        required: [true, "Mật khẩu là bắt buộc"],
        minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
        select: false // Không trả về password khi query
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware hash password trước khi save
authSchema.pre("save", async function(next) {
    // Nếu password không bị thay đổi, skip
    if (!this.isModified("password")) {
        return next();
    }
    
    try {
        // Hash password với salt rounds = 10
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method so sánh password
authSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Auth = mongoose.model("Auth", authSchema);

export default Auth;
