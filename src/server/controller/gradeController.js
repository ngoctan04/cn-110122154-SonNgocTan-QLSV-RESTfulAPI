import Grade from "../model/gradeModel.js";
import Course from "../model/courseModel.js";
import User from "../model/userModel.js";

const handleValidationError = (errors) => {
    return Object.values(errors)
        .map(err => err.message)
        .join(", ");
};

// Hàm tính GPA từ điểm số
const calculateGPA = (score) => {
    if (score >= 9) return 4.0;
    if (score >= 8.5) return 3.7;
    if (score >= 8) return 3.5;
    if (score >= 7.5) return 3.2;
    if (score >= 7) return 3.0;
    if (score >= 6.5) return 2.7;
    if (score >= 6) return 2.5;
    if (score >= 5.5) return 2.2;
    if (score >= 5) return 2.0;
    return 0.0;
};

// Hàm xác định grade chữ theo thang điểm 10 yêu cầu
const getGradeLetter = (score) => {
    if (score >= 8.5) return "A";
    if (score >= 8.0) return "B+";
    if (score >= 7.0) return "B";
    if (score >= 6.5) return "C+";
    if (score >= 5.5) return "C";
    if (score >= 5.0) return "D+";
    if (score >= 4.0) return "D";
    return "F";
};

// Map letter to Vietnamese classification
const getClassification = (letter) => {
    switch (letter) {
        case 'A': return 'Giỏi';
        case 'B+': return 'Khá giỏi';
        case 'B': return 'Khá';
        case 'C+': return 'Trung bình khá';
        case 'C': return 'Trung bình';
        case 'D+': return 'Trung bình yếu';
        case 'D': return 'Yếu';
        default: return 'Rớt';
    }
};

// Xác định trạng thái (Đạt/Không đạt)
// Updated: passing threshold is 4.0 (>=4 => Đạt), per grading table where
// scores < 4.0 are 'F' and considered not passing.
const getStatus = (score) => {
    return score >= 4 ? "Đạt" : "Không đạt";
};

// Tạo điểm mới
export const createGrade = async (req, res) => {
    try {
        console.log('createGrade received body:', req.body);
        const { userId, courseId, midterm, final, assignment, ktqt1, ktqt2, exam, score, semester, notes } = req.body;

        // Validate required identifiers (score or components validated later)
        if (!userId || !courseId || !semester) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền các trường bắt buộc: Sinh viên, Môn học, Kỳ"
            });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sinh viên"
            });
        }

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy môn học"
            });
        }

        // Check duplicate (same user + course)
        const existingGrade = await Grade.findOne({ userId, courseId });
        if (existingGrade) {
            return res.status(400).json({
                success: false,
                message: "Sinh viên này đã có điểm cho môn học này"
            });
        }

        // Compute final score: prefer component scores (midterm/final/assignment) if provided,
        // otherwise fall back to `score` if present.
        const parseNum = (v) => (v === null || v === undefined || v === '') ? undefined : Number(v);
        // support both old component names or new ones
        const m = parseNum(midterm ?? ktqt1);
        const f = parseNum(final ?? ktqt2);
        const a = parseNum(assignment ?? exam);

        let finalScore;
        if (m !== undefined && f !== undefined && a !== undefined) {
            // Per requirement: KTQT1+KTQT2 -> divide by 2 = result1
            // Tổng kết = (result1 + exam) / 2
            finalScore = +((((m + f) / 2) + a) / 2).toFixed(2);
        } else if (score !== undefined && score !== null && score !== '') {
            finalScore = Number(score);
        } else {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp KTQT1, KTQT2 và Điểm thi hoặc tổng điểm' });
        }

        console.log('createGrade parse:', { midterm: m, ktqt1, final: f, ktqt2, assignment: a, exam, score, computedFinalScore: finalScore });

        // Calculate GPA (4.0-scale) and grade letter/classification from the computed finalScore
        const gpa = calculateGPA(finalScore);
        const grade = getGradeLetter(finalScore);
        const classification = getClassification(grade);
        const status = getStatus(finalScore);

        const newGrade = new Grade({
            userId,
            courseId,
            score: finalScore,
            ktqt1: m !== undefined ? m : null,
            ktqt2: f !== undefined ? f : null,
            exam: a !== undefined ? a : null,
            // keep old fields too for compatibility
            midterm: m !== undefined ? m : null,
            final: f !== undefined ? f : null,
            assignment: a !== undefined ? a : null,
            semester,
            credits: course.credits,
            gpa,
            grade,
            classification,
            status,
            notes: notes || "",
            mssv: user.mssv || null
        });

        await newGrade.save();

        // Populate references
        await newGrade.populate("userId", "name email mssv");
        await newGrade.populate("courseId", "courseName code credits");

        res.status(201).json({
            success: true,
            message: "Tạo điểm thành công",
            data: newGrade
        });
    } catch (error) {
        console.error('Error in createGrade:', error);
        if (error.errors) {
            console.error('Validation errors:', error.errors);
        }
        const message = error.errors ? handleValidationError(error.errors) : error.message;
        res.status(500).json({
            success: false,
            message: message || "Lỗi tạo điểm"
        });
    }
};

// Lấy tất cả điểm (phân trang)
export const getAllGrades = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const userId = req.query.userId || "";
        const semester = req.query.semester || "";
        const status = req.query.status || "";

        const skip = (page - 1) * limit;

        // Build filter
        let filter = {};
        if (userId) filter.userId = userId;
        if (semester) filter.semester = parseInt(semester);
        if (status) filter.status = status;

        const grades = await Grade.find(filter)
            .populate({
                path: "userId",
                select: "name email mssv",
                strictPopulate: false
            })
            .populate({
                path: "courseId",
                select: "courseName code credits",
                strictPopulate: false
            })
            .skip(skip)
            .limit(limit)
            .sort({ semester: -1, createdAt: -1 })
            .lean();

        // Filter out grades with null references
        const validGrades = grades.filter(g => g.userId && g.courseId);

        const total = await Grade.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Lấy danh sách điểm thành công",
            data: validGrades,
            pagination: {
                page,
                limit,
                total: validGrades.length,
                pages: Math.ceil(validGrades.length / limit)
            }
        });
    } catch (error) {
        console.error('❌ Error in getAllGrades:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi lấy danh sách điểm"
        });
    }
};

// Lấy bảng điểm của 1 sinh viên
export const getStudentTranscript = async (req, res) => {
    try {
        const { userId } = req.params;
        const { semester } = req.query;

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sinh viên"
            });
        }

        // Build filter
        let filter = { userId };
        if (semester) filter.semester = parseInt(semester);

        const grades = await Grade.find(filter)
            .populate("courseId", "courseName code credits semester")
            .sort({ semester: 1, createdAt: -1 });

        // Calculate semester GPA and cumulative GPA
        let semesters = {};
        let totalCredits = 0;
        let totalGradePoints = 0;

        grades.forEach(g => {
            const sem = g.semester;
            if (!semesters[sem]) {
                semesters[sem] = {
                    semester: sem,
                    courses: [],
                    totalCredits: 0,
                    totalGradePoints: 0,
                    semesterGPA: 0
                };
            }

            semesters[sem].courses.push(g);
            semesters[sem].totalCredits += g.credits;
            semesters[sem].totalGradePoints += g.gpa * g.credits;

            totalCredits += g.credits;
            totalGradePoints += g.gpa * g.credits;
        });

        // Calculate semester GPAs
        Object.keys(semesters).forEach(sem => {
            if (semesters[sem].totalCredits > 0) {
                semesters[sem].semesterGPA = (semesters[sem].totalGradePoints / semesters[sem].totalCredits).toFixed(2);
            }
        });

        const cumulativeGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            message: "Lấy bảng điểm thành công",
            data: {
                student: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    className: user.className,
                    majorName: user.majorName
                },
                grades,
                semesters: Object.values(semesters),
                cumulativeGPA,
                totalCredits
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi lấy bảng điểm"
        });
    }
};

// Cập nhật điểm
export const updateGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, semester, notes } = req.body;

        let grade = await Grade.findById(id);

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy điểm"
            });
        }

        // Calculate new GPA and grade letter if score changes
        let gpa = grade.gpa;
        let gradeLetter = grade.grade;
        let status = grade.status;

        const m2 = req.body.midterm ?? req.body.ktqt1;
        const f2 = req.body.final ?? req.body.ktqt2;
        const a2 = req.body.assignment ?? req.body.exam;
        const s2 = req.body.score !== undefined ? Number(req.body.score) : undefined;

        const pm = m2 !== undefined && m2 !== null && m2 !== '' ? Number(m2) : undefined;
        const pf = f2 !== undefined && f2 !== null && f2 !== '' ? Number(f2) : undefined;
        const pa = a2 !== undefined && a2 !== null && a2 !== '' ? Number(a2) : undefined;

        if (pm !== undefined && pf !== undefined && pa !== undefined) {
            const computed = +((((pm + pf) / 2) + pa) / 2).toFixed(2);
            gpa = calculateGPA(computed);
            gradeLetter = getGradeLetter(computed);
            const classification = getClassification(gradeLetter);
            status = getStatus(computed);
            grade.score = computed;
            grade.ktqt1 = pm;
            grade.ktqt2 = pf;
            grade.exam = pa;
            grade.midterm = pm;
            grade.final = pf;
            grade.assignment = pa;
            grade.classification = classification;
        } else if (s2 !== undefined && !isNaN(s2) && s2 !== grade.score) {
            gpa = calculateGPA(s2);
            gradeLetter = getGradeLetter(s2);
            grade.classification = getClassification(gradeLetter);
            status = getStatus(s2);
            grade.score = s2;
        }

        // Keep mssv in sync with user record
        const student = await User.findById(grade.userId);
        grade.mssv = student?.mssv ?? grade.mssv;

        grade.gpa = gpa;
        grade.grade = gradeLetter;
        grade.status = status;
        grade.semester = semester !== undefined ? semester : grade.semester;
        grade.notes = notes !== undefined ? notes : grade.notes;
        grade.updatedAt = Date.now();

        await grade.save();

        await grade.populate("userId", "name email mssv");
        await grade.populate("courseId", "courseName code credits");

        res.status(200).json({
            success: true,
            message: "Cập nhật điểm thành công",
            data: grade
        });
    } catch (error) {
        const message = error.errors ? handleValidationError(error.errors) : error.message;
        res.status(500).json({
            success: false,
            message: message || "Lỗi cập nhật điểm"
        });
    }
};

// Xóa điểm
export const deleteGrade = async (req, res) => {
    try {
        const { id } = req.params;

        const grade = await Grade.findByIdAndDelete(id);

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy điểm"
            });
        }

        res.status(200).json({
            success: true,
            message: "Xóa điểm thành công",
            data: grade
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi xóa điểm"
        });
    }
};

// Backfill missing component fields for existing grades
export const backfillComponents = async (req, res) => {
    try {
        // Find grades where components are null but score exists
        const grades = await Grade.find({
            score: { $ne: null },
            ktqt1: null,
            ktqt2: null,
            exam: null
        });

        let updated = 0;
        for (const g of grades) {
            const s = Number(g.score || 0);
            g.ktqt1 = s;
            g.ktqt2 = s;
            g.exam = s;
            g.midterm = s;
            g.final = s;
            g.assignment = s;

            // Recompute derived fields
            const finalScore = +((((g.ktqt1 + g.ktqt2) / 2) + g.exam) / 2).toFixed(2);
            const gpa = calculateGPA(finalScore);
            const gradeLetter = getGradeLetter(finalScore);
            const classification = getClassification(gradeLetter);
            const status = getStatus(finalScore);

            g.score = finalScore;
            g.gpa = gpa;
            g.grade = gradeLetter;
            g.classification = classification;
            g.status = status;

            await g.save();
            updated++;
        }

        res.status(200).json({ success: true, message: `Updated ${updated} grades`, updated });
    } catch (error) {
        console.error('Error in backfillComponents:', error);
        res.status(500).json({ success: false, message: error.message || 'Error backfilling components' });
    }
};

// Recalculate derived fields (score, gpa, grade, classification, status)
// without overwriting existing component fields. Safe to run on production.
export const recalculateDerived = async (req, res) => {
    try {
        const grades = await Grade.find({});
        let updated = 0;

        for (const g of grades) {
            const m = (g.ktqt1 !== null && g.ktqt1 !== undefined) ? Number(g.ktqt1) : (g.midterm !== null && g.midterm !== undefined ? Number(g.midterm) : undefined);
            const f = (g.ktqt2 !== null && g.ktqt2 !== undefined) ? Number(g.ktqt2) : (g.final !== null && g.final !== undefined ? Number(g.final) : undefined);
            const a = (g.exam !== null && g.exam !== undefined) ? Number(g.exam) : (g.assignment !== null && g.assignment !== undefined ? Number(g.assignment) : undefined);

            let finalScore;
            if (m !== undefined && f !== undefined && a !== undefined) {
                finalScore = +((((m + f) / 2) + a) / 2).toFixed(2);
            } else {
                finalScore = Number(g.score || 0);
            }

            const gpa = calculateGPA(finalScore);
            const gradeLetter = getGradeLetter(finalScore);
            const classification = getClassification(gradeLetter);
            const status = getStatus(finalScore);

            let changed = false;
            if (g.score !== finalScore) { g.score = finalScore; changed = true; }
            if (g.gpa !== gpa) { g.gpa = gpa; changed = true; }
            if (g.grade !== gradeLetter) { g.grade = gradeLetter; changed = true; }
            if (g.classification !== classification) { g.classification = classification; changed = true; }
            if (g.status !== status) { g.status = status; changed = true; }

            if (changed) {
                await g.save();
                updated++;
            }
        }

        res.status(200).json({ success: true, message: `Recalculated ${updated} grades`, updated });
    } catch (error) {
        console.error('Error in recalculateDerived:', error);
        res.status(500).json({ success: false, message: error.message || 'Error recalculating grades' });
    }
};

// Fix grades that are misclassified as 'F' while their score >= 4.0
export const fixMisclassifiedGrades = async (req, res) => {
    try {
        // Find grades labeled 'F' but with score >= 4.0
        const bad = await Grade.find({ grade: 'F', score: { $gte: 4 } });
        let updated = 0;

        for (const g of bad) {
            const m = (g.ktqt1 !== null && g.ktqt1 !== undefined) ? Number(g.ktqt1) : (g.midterm !== null && g.midterm !== undefined ? Number(g.midterm) : undefined);
            const f = (g.ktqt2 !== null && g.ktqt2 !== undefined) ? Number(g.ktqt2) : (g.final !== null && g.final !== undefined ? Number(g.final) : undefined);
            const a = (g.exam !== null && g.exam !== undefined) ? Number(g.exam) : (g.assignment !== null && g.assignment !== undefined ? Number(g.assignment) : undefined);

            let finalScore;
            if (m !== undefined && f !== undefined && a !== undefined) {
                finalScore = +((((m + f) / 2) + a) / 2).toFixed(2);
            } else {
                finalScore = Number(g.score || 0);
            }

            const gradeLetter = getGradeLetter(finalScore);
            const gpa = calculateGPA(finalScore);
            const classification = getClassification(gradeLetter);
            const status = getStatus(finalScore);

            g.score = finalScore;
            g.grade = gradeLetter;
            g.gpa = gpa;
            g.classification = classification;
            g.status = status;

            await g.save();
            updated++;
        }

        res.status(200).json({ success: true, message: `Fixed ${updated} misclassified grades`, updated });
    } catch (error) {
        console.error('Error in fixMisclassifiedGrades:', error);
        res.status(500).json({ success: false, message: error.message || 'Error fixing misclassified grades' });
    }
};

// Lấy chi tiết 1 điểm
export const getGradeById = async (req, res) => {
    try {
        const { id } = req.params;

        const grade = await Grade.findById(id)
            .populate("userId", "name email mssv className majorName")
            .populate("courseId", "courseName code credits semester");

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy điểm"
            });
        }

        res.status(200).json({
            success: true,
            message: "Lấy chi tiết điểm thành công",
            data: grade
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi lấy chi tiết điểm"
        });
    }
};
