import express from "express";
import {
    createMajor,
    getAllMajors,
    getMajorById,
    updateMajor,
    deleteMajor,
    getAllMajorsForDropdown
} from "../controller/majorController.js";

const router = express.Router();

// Public routes (không cần auth)
router.get("/all", getAllMajors);
router.get("/dropdown", getAllMajorsForDropdown);
router.get("/:id", getMajorById);

// Các routes cần auth (có thể thêm sau)
router.post("/", createMajor);
router.put("/:id", updateMajor);
router.delete("/:id", deleteMajor);

export default router;
