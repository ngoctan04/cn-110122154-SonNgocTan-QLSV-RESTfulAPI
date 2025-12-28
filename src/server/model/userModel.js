import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Tên sinh viên là bắt buộc"],
        trim: true,
        minlength: [3, "Tên phải có ít nhất 3 ký tự"],
        maxlength: [100, "Tên không được quá 100 ký tự"]
    },
    email:{
        type: String,
        required: [true, "Email là bắt buộc"],
        unique: [true, "Email này đã tồn tại"],
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Định dạng email không hợp lệ"]
    },
    mssv: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        default: null
    },
    phone:{
        type: String,
        match: [/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"],
        default: null
    },
    address:{
        type: String,
        required: [true, "Địa chỉ là bắt buộc"],
        minlength: [5, "Địa chỉ phải có ít nhất 5 ký tự"]
    },
    gender:{
        type: String,
        enum: ["Nam", "Nữ", "Khác"],
        default: "Khác"
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        default: null
    },
    className:{
        type: String,
        default: null
    },
    majorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major',
        default: null
    },
    majorName:{
        type: String,
        default: null
    },
    joinDate:{
        type: Date,
        default: Date.now
    },
    avatar:{
        type: String,
        default: null
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("User", userSchema);