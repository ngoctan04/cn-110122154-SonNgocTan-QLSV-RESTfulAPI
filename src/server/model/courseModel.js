import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: [true, "Tên môn học là bắt buộc"],
        unique: [true, "Tên môn học này đã tồn tại"],
        trim: true,
        minlength: [3, "Tên môn học phải có ít nhất 3 ký tự"],
        maxlength: [100, "Tên môn học không được quá 100 ký tự"]
    },
    code: {
        type: String,
        required: [true, "Mã môn học là bắt buộc"],
        unique: [true, "Mã môn học này đã tồn tại"],
        trim: true,
        minlength: [2, "Mã môn học phải có ít nhất 2 ký tự"],
        maxlength: [20, "Mã môn học không được quá 20 ký tự"],
        uppercase: true
    },
    credits: {
        type: Number,
        required: [true, "Số tín chỉ là bắt buộc"],
        min: [1, "Số tín chỉ phải ≥ 1"],
        max: [6, "Số tín chỉ không được quá 6"]
    },
    semester: {
        type: Number,
        required: [true, "Kỳ học là bắt buộc"],
        min: [1, "Kỳ học phải ≥ 1"],
        max: [8, "Kỳ học không được quá 8"]
    },
    description: {
        type: String,
        default: "",
        maxlength: [500, "Mô tả không được quá 500 ký tự"]
    },
    instructor: {
        type: String,
        default: "",
        maxlength: [100, "Tên giảng viên không được quá 100 ký tự"]
    },
    totalStudents: {
        type: Number,
        default: 0,
        min: [0, "Số sinh viên không thể âm"]
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

const Course = mongoose.model("Course", courseSchema);

export default Course;
