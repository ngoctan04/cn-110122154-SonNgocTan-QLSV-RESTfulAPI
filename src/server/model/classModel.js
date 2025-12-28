import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: [true, "Tên lớp là bắt buộc"],
        unique: [true, "Tên lớp này đã tồn tại"],
        trim: true,
        minlength: [3, "Tên lớp phải có ít nhất 3 ký tự"],
        maxlength: [50, "Tên lớp không được quá 50 ký tự"]
    },
    description: {
        type: String,
        default: "",
        maxlength: [500, "Mô tả không được quá 500 ký tự"]
    },
    totalStudents: {
        type: Number,
        default: 0,
        min: [0, "Số sinh viên không thể âm"]
    },
    majorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Major",
        default: null
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

const Class = mongoose.model("Class", classSchema);

export default Class;
