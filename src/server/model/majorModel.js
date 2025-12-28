import mongoose from "mongoose";

const majorSchema = new mongoose.Schema({
    majorName: {
        type: String,
        required: [true, "Tên chuyên ngành là bắt buộc"],
        unique: [true, "Tên chuyên ngành này đã tồn tại"],
        trim: true,
        minlength: [3, "Tên chuyên ngành phải có ít nhất 3 ký tự"],
        maxlength: [100, "Tên chuyên ngành không được quá 100 ký tự"]
    },
    description: {
        type: String,
        default: "",
        maxlength: [500, "Mô tả không được quá 500 ký tự"]
    },
    code: {
        type: String,
        required: [true, "Mã chuyên ngành là bắt buộc"],
        unique: [true, "Mã chuyên ngành này đã tồn tại"],
        trim: true,
        minlength: [2, "Mã chuyên ngành phải có ít nhất 2 ký tự"],
        maxlength: [20, "Mã chuyên ngành không được quá 20 ký tự"]
    },
    totalClasses: {
        type: Number,
        default: 0,
        min: [0, "Số lớp không thể âm"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Major = mongoose.model("Major", majorSchema);

export default Major;
