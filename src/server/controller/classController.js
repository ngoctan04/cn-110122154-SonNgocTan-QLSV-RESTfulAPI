import Class from "../model/classModel.js";
import Major from "../model/majorModel.js";
import { createAudit } from './auditController.js';

// Hàm helper xử lý lỗi MongoDB
const handleValidationError = (error) => {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return { status: 400, message: messages.join(', ') };
    }
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return { status: 400, message: `${field} này đã tồn tại trong hệ thống` };
    }
    return { status: 500, message: error.message };
};

// TẠO LỚP MỚI
export const createClass = async (req, res) => {
    try {
        const { className, description, majorId } = req.body;

        // Validation cơ bản
        if (!className) {
            return res.status(400).json({
                success: false,
                message: "Tên lớp là bắt buộc"
            });
        }

        // Kiểm tra majorId có hợp lệ không (nếu có)
        if (majorId) {
            const majorExists = await Major.findById(majorId);
            if (!majorExists) {
                return res.status(404).json({
                    success: false,
                    message: "Chuyên ngành không tồn tại"
                });
            }
        }

        const newClass = new Class({
            className,
            description: description || "",
            majorId: majorId || null,
            totalStudents: 0
        });

        const saveData = await newClass.save();

        // Cập nhật totalClasses trong Major
        if (majorId) {
            await Major.findByIdAndUpdate(majorId, { $inc: { totalClasses: 1 } });
        }

        // Audit
        try {
            await createAudit({
                actorId: req.userId || null,
                actorEmail: req.userEmail || null,
                action: 'create',
                entity: 'Class',
                entityId: saveData._id,
                entityName: saveData.className,
                details: { createdFields: { className, description, majorId } }
            });
        } catch (e) {
            console.error('Audit creation failed:', e);
        }

        res.status(201).json({
            success: true,
            message: "Tạo lớp thành công",
            data: saveData
        });
    } catch (error) {
        const errorResponse = handleValidationError(error);
        res.status(errorResponse.status).json({
            success: false,
            message: errorResponse.message
        });
    }
};

// LẤY TẤT CẢ LỚP
export const getAllClasses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: "Page hoặc limit không hợp lệ"
            });
        }

        // Tìm kiếm theo className
        let query = {};
        if (search) {
            query.className = { $regex: search, $options: 'i' };
        }

        const skip = (page - 1) * limit;
        const total = await Class.countDocuments(query);

        const classes = await Class.find(query)
            .populate('majorId', 'majorName code')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            message: "Lấy danh sách lớp thành công",
            data: classes,
            pagination: {
                currentPage: page,
                pageSize: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// LẤY CHI TIẾT MỘT LỚP
export const getClassById = async (req, res) => {
    try {
        const { id } = req.params;

        const classData = await Class.findById(id).populate('majorId');

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Lớp không tồn tại"
            });
        }

        res.status(200).json({
            success: true,
            message: "Lấy thông tin lớp thành công",
            data: classData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CẬP NHẬT LỚP
export const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { className, description, majorId } = req.body;

        if (!className) {
            return res.status(400).json({
                success: false,
                message: "Tên lớp là bắt buộc"
            });
        }

        const classData = await Class.findById(id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Lớp không tồn tại"
            });
        }

        // Nếu thay đổi majorId
        if (majorId && majorId !== classData.majorId?.toString()) {
            // Kiểm tra majorId mới có hợp lệ
            const majorExists = await Major.findById(majorId);
            if (!majorExists) {
                return res.status(404).json({
                    success: false,
                    message: "Chuyên ngành không tồn tại"
                });
            }

            // Giảm totalClasses của major cũ
            if (classData.majorId) {
                await Major.findByIdAndUpdate(classData.majorId, { $inc: { totalClasses: -1 } });
            }

            // Tăng totalClasses của major mới
            await Major.findByIdAndUpdate(majorId, { $inc: { totalClasses: 1 } });
        }

        const updatedClass = await Class.findByIdAndUpdate(
            id,
            {
                className,
                description: description || "",
                majorId: majorId || null,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        ).populate('majorId');

        // Audit
        try {
            await createAudit({
                actorId: req.userId || null,
                actorEmail: req.userEmail || null,
                action: 'update',
                entity: 'Class',
                entityId: updatedClass._id,
                entityName: updatedClass.className,
                details: { changes: { className, description, majorId } }
            });
        } catch (e) {
            console.error('Audit creation failed:', e);
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật lớp thành công",
            data: updatedClass
        });
    } catch (error) {
        const errorResponse = handleValidationError(error);
        res.status(errorResponse.status).json({
            success: false,
            message: errorResponse.message
        });
    }
};

// XÓA LỚP
export const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        const classData = await Class.findById(id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Lớp không tồn tại"
            });
        }

        // Nếu còn sinh viên trong lớp, không xóa
        const studentCount = await (await import('../model/userModel.js')).default.countDocuments({ classId: id });
        if (studentCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Không thể xóa lớp vì còn sinh viên. Vui lòng chuyển hoặc xóa sinh viên trước khi xóa lớp."
            });
        }

        // Giảm totalClasses của major
        if (classData.majorId) {
            await Major.findByIdAndUpdate(classData.majorId, { $inc: { totalClasses: -1 } });
        }

        await Class.findByIdAndDelete(id);

        // Audit delete
        try {
            await createAudit({
                actorId: req.userId || null,
                actorEmail: req.userEmail || null,
                action: 'delete',
                entity: 'Class',
                entityId: classData._id,
                entityName: classData.className,
                details: { deletedRecord: classData }
            });
        } catch (e) {
            console.error('Audit creation failed:', e);
        }

        res.status(200).json({
            success: true,
            message: "Xóa lớp thành công"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// LẤY TẤT CẢ LỚP (KHÔNG PHÂN TRANG) - Dùng cho dropdown
export const getAllClassesForDropdown = async (req, res) => {
    try {
        const classes = await Class.find()
            .populate('majorId', 'majorName')
            .sort({ className: 1 });

        res.status(200).json({
            success: true,
            message: "Lấy danh sách lớp thành công",
            data: classes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
