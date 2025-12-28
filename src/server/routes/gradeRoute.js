import express from "express";
import { 
    createGrade, 
    getAllGrades, 
    getGradeById, 
    updateGrade, 
    deleteGrade,
    getStudentTranscript,
    backfillComponents,
    recalculateDerived,
    fixMisclassifiedGrades
} from "../controller/gradeController.js";

const router = express.Router();

// POST - Tạo điểm mới
router.post("/", createGrade);

// GET - Lấy tất cả điểm (phân trang)
router.get("/all", getAllGrades);

// GET - Lấy bảng điểm của 1 sinh viên
router.get("/transcript/:userId", getStudentTranscript);

// GET - Lấy chi tiết 1 điểm
router.get("/:id", getGradeById);

// PUT - Cập nhật điểm
router.put("/:id", updateGrade);

// DELETE - Xóa điểm
router.delete("/:id", deleteGrade);

// POST - Backfill components (one-time migration)
router.post('/backfill-components', backfillComponents);
router.post('/recalculate-derived', recalculateDerived);
router.post('/fix-misclassified', fixMisclassifiedGrades);

export default router;
