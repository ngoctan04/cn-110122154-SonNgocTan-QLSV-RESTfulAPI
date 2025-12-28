import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Sinh viên là bắt buộc"]
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Môn học là bắt buộc"]
    },
    score: {
        type: Number,
        required: [true, "Điểm số là bắt buộc"],
        min: [0, "Điểm không thể âm"],
        max: [10, "Điểm không được quá 10"]
    },
    midterm: {
        type: Number,
        min: [0, "Điểm giữa kỳ không thể âm"],
        max: [10, "Điểm giữa kỳ không được quá 10"],
        default: null
    },
    final: {
        type: Number,
        min: [0, "Điểm cuối kỳ không thể âm"],
        max: [10, "Điểm cuối kỳ không được quá 10"],
        default: null
    },
    assignment: {
        type: Number,
        min: [0, "Điểm bài tập không thể âm"],
        max: [10, "Điểm bài tập không được quá 10"],
        default: null
    },
    ktqt1: {
        type: Number,
        min: [0, "KTQT1 không thể âm"],
        max: [10, "KTQT1 không được quá 10"],
        default: null
    },
    ktqt2: {
        type: Number,
        min: [0, "KTQT2 không thể âm"],
        max: [10, "KTQT2 không được quá 10"],
        default: null
    },
    exam: {
        type: Number,
        min: [0, "Điểm thi không thể âm"],
        max: [10, "Điểm thi không được quá 10"],
        default: null
    },
    mssv: {
        type: String,
        default: null
    },
    semester: {
        type: Number,
        required: [true, "Kỳ học là bắt buộc"],
        min: [1, "Kỳ học phải ≥ 1"],
        max: [8, "Kỳ học không được quá 8"]
    },
    credits: {
        type: Number,
        required: [true, "Số tín chỉ là bắt buộc"],
        min: [1, "Số tín chỉ phải ≥ 1"]
    },
    gpa: {
        type: Number,
        default: 0,
        min: [0, "GPA không thể âm"],
        max: [4, "GPA không được quá 4"]
    },
    grade: {
        type: String,
        enum: {
            values: ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"],
            message: "Điểm chữ không hợp lệ"
        },
        default: "F"
    },
    classification: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: {
            values: ["Đạt", "Không đạt"],
            message: "Trạng thái không hợp lệ"
        },
        default: "Không đạt"
    },
    notes: {
        type: String,
        default: "",
        maxlength: [300, "Ghi chú không được quá 300 ký tự"]
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

// Unique index: mỗi sinh viên chỉ có 1 điểm cho mỗi môn học
gradeSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Grade = mongoose.model("Grade", gradeSchema);

export default Grade;
