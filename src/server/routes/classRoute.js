import express from "express";
import {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass,
    getAllClassesForDropdown
} from "../controller/classController.js";

const router = express.Router();

// Public routes (không cần auth)
router.get("/all", getAllClasses);
router.get("/dropdown", getAllClassesForDropdown);
router.get("/:id", getClassById);

// Các routes cần auth (có thể thêm sau)
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;
