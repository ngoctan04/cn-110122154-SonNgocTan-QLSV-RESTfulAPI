import Course from "../model/courseModel.js";

const handleValidationError = (errors) => {
    return Object.values(errors)
        .map(err => err.message)
        .join(", ");
};

// Tạo môn học mới
export const createCourse = async (req, res) => {
    try {
        const { courseName, code, credits, semester, description, instructor } = req.body;

        // Validate
        if (!courseName || !code || !credits || !semester) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền tất cả trường bắt buộc"
            });
        }

        // Kiểm tra duplicate
        const existingCourse = await Course.findOne({
            $or: [{ courseName }, { code: code.toUpperCase() }]
        });

        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: "Tên môn học hoặc mã môn học đã tồn tại"
            });
        }

        const newCourse = new Course({
            courseName,
            code: code.toUpperCase(),
            credits,
            semester,
            description: description || "",
            instructor: instructor || ""
        });

        await newCourse.save();

        res.status(201).json({
            success: true,
            message: "Tạo môn học thành công",
            data: newCourse
        });
    } catch (error) {
        const message = error.errors ? handleValidationError(error.errors) : error.message;
        res.status(500).json({
            success: false,
            message: message || "Lỗi tạo môn học"
        });
    }
};

// Lấy tất cả môn học (phân trang + tìm kiếm)
export const getAllCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const semester = req.query.semester || "";

        const skip = (page - 1) * limit;

        // Build filter
        let filter = {};
        if (search) {
            filter.$or = [
                { courseName: { $regex: search, $options: "i" } },
                { code: { $regex: search, $options: "i" } }
            ];
        }
        if (semester) {
            filter.semester = parseInt(semester);
        }

        const courses = await Course.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ semester: 1, courseName: 1 });

        const total = await Course.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Lấy danh sách môn học thành công",
            data: courses,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi lấy danh sách môn học"
        });
    }
};

// Lấy tất cả môn học cho dropdown
export const getAllCoursesForDropdown = async (req, res) => {
    try {
        const courses = await Course.find({})
            .select("_id courseName code credits semester")
            .sort({ semester: 1, courseName: 1 });

        res.status(200).json({
            success: true,
            message: "Lấy danh sách môn học thành công",
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi lấy danh sách môn học"
        });
    }
};

// Lấy chi tiết môn học
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy môn học"
            });
        }

        res.status(200).json({
            success: true,
            message: "Lấy chi tiết môn học thành công",
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi lấy chi tiết môn học"
        });
    }
};

// Cập nhật môn học
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseName, code, credits, semester, description, instructor } = req.body;

        let course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy môn học"
            });
        }

        // Kiểm tra duplicate name/code (nếu thay đổi)
        if (courseName !== course.courseName || code !== course.code) {
            const existing = await Course.findOne({
                _id: { $ne: id },
                $or: [
                    { courseName: courseName || course.courseName },
                    { code: (code || course.code).toUpperCase() }
                ]
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Tên môn học hoặc mã môn học đã tồn tại"
                });
            }
        }

        // Update
        course.courseName = courseName || course.courseName;
        course.code = code ? code.toUpperCase() : course.code;
        course.credits = credits !== undefined ? credits : course.credits;
        course.semester = semester !== undefined ? semester : course.semester;
        course.description = description !== undefined ? description : course.description;
        course.instructor = instructor !== undefined ? instructor : course.instructor;
        course.updatedAt = Date.now();

        await course.save();

        res.status(200).json({
            success: true,
            message: "Cập nhật môn học thành công",
            data: course
        });
    } catch (error) {
        const message = error.errors ? handleValidationError(error.errors) : error.message;
        res.status(500).json({
            success: false,
            message: message || "Lỗi cập nhật môn học"
        });
    }
};

// Xóa môn học
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByIdAndDelete(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy môn học"
            });
        }

        res.status(200).json({
            success: true,
            message: "Xóa môn học thành công",
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi xóa môn học"
        });
    }
};
