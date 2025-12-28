import express from "express";
import { 
    createCourse, 
    getAllCourses, 
    getCourseById, 
    updateCourse, 
    deleteCourse,
    getAllCoursesForDropdown 
} from "../controller/courseController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST - Tạo môn học mới (protected)
router.post("/", protectRoute, createCourse);

// GET - Lấy tất cả môn học (phân trang + tìm kiếm)
router.get("/all", getAllCourses);

// GET - Lấy tất cả môn học cho dropdown
router.get("/dropdown", getAllCoursesForDropdown);

// GET - Lấy chi tiết môn học
router.get("/:id", getCourseById);

// PUT - Cập nhật môn học (protected)
router.put("/:id", protectRoute, updateCourse);

// DELETE - Xóa môn học (protected)
router.delete("/:id", protectRoute, deleteCourse);

export default router;
