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

// TẠO CHUYÊN NGÀNH MỚI
export const createMajor = async (req, res) => {
    try {
        const { majorName, code, description } = req.body;

        // Validation cơ bản
        if (!majorName || !code) {
            return res.status(400).json({
                success: false,
                message: "Tên chuyên ngành và mã là bắt buộc"
            });
        }

        const newMajor = new Major({
            majorName,
            code: code.toUpperCase(),
            description: description || "",
            totalClasses: 0
        });

        const saveData = await newMajor.save();

        // Audit
        try {
            await createAudit({
                actorId: req.userId || null,
                actorEmail: req.userEmail || null,
                action: 'create',
                entity: 'Major',
                entityId: saveData._id,
                entityName: saveData.majorName,
                details: { createdFields: { majorName, code, description } }
            });
        } catch (e) {
            console.error('Audit creation failed:', e);
        }

        res.status(201).json({
            success: true,
            message: "Tạo chuyên ngành thành công",
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

// LẤY TẤT CẢ CHUYÊN NGÀNH
export const getAllMajors = async (req, res) => {
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

        // Tìm kiếm theo majorName hoặc code
        let query = {};
        if (search) {
            query.$or = [
                { majorName: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const total = await Major.countDocuments(query);

        const majors = await Major.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            message: "Lấy danh sách chuyên ngành thành công",
            data: majors,
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

// LẤY CHI TIẾT MỘT CHUYÊN NGÀNH
export const getMajorById = async (req, res) => {
    try {
        const { id } = req.params;

        const majorData = await Major.findById(id);

        if (!majorData) {
            return res.status(404).json({
                success: false,
                message: "Chuyên ngành không tồn tại"
            });
        }

        res.status(200).json({
            success: true,
            message: "Lấy thông tin chuyên ngành thành công",
            data: majorData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CẬP NHẬT CHUYÊN NGÀNH
export const updateMajor = async (req, res) => {
    try {
        const { id } = req.params;
        const { majorName, code, description } = req.body;

        if (!majorName || !code) {
            return res.status(400).json({
                success: false,
                message: "Tên chuyên ngành và mã là bắt buộc"
            });
        }

        const majorData = await Major.findById(id);

        if (!majorData) {
            return res.status(404).json({
                success: false,
                message: "Chuyên ngành không tồn tại"
            });
        }

        const updatedMajor = await Major.findByIdAndUpdate(
            id,
            {
                majorName,
                code: code.toUpperCase(),
                description: description || "",
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        // Audit
        try {
            await createAudit({
                actorId: req.userId || null,
                actorEmail: req.userEmail || null,
                action: 'update',
                entity: 'Major',
                entityId: updatedMajor._id,
                entityName: updatedMajor.majorName,
                details: { changes: { majorName, code, description } }
            });
        } catch (e) {
            console.error('Audit creation failed:', e);
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật chuyên ngành thành công",
            data: updatedMajor
        });
    } catch (error) {
        const errorResponse = handleValidationError(error);
        res.status(errorResponse.status).json({
            success: false,
            message: errorResponse.message
        });
    }
};

// XÓA CHUYÊN NGÀNH
export const deleteMajor = async (req, res) => {
    try {
        const { id } = req.params;

        const majorData = await Major.findById(id);

        if (!majorData) {
            return res.status(404).json({
                success: false,
                message: "Chuyên ngành không tồn tại"
            });
        }

        // Kiểm tra còn lớp liên kết không
        if (majorData.totalClasses > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa chuyên ngành vì còn ${majorData.totalClasses} lớp liên kết`
            });
        }

        await Major.findByIdAndDelete(id);

        // Audit
        try {
            await createAudit({
                actorId: req.userId || null,
                actorEmail: req.userEmail || null,
                action: 'delete',
                entity: 'Major',
                entityId: majorData._id,
                entityName: majorData.majorName,
                details: { deletedRecord: majorData }
            });
        } catch (e) {
            console.error('Audit creation failed:', e);
        }

        res.status(200).json({
            success: true,
            message: "Xóa chuyên ngành thành công"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// LẤY TẤT CẢ CHUYÊN NGÀNH (KHÔNG PHÂN TRANG) - Dùng cho dropdown
export const getAllMajorsForDropdown = async (req, res) => {
    try {
        const majors = await Major.find()
            .sort({ majorName: 1 });

        res.status(200).json({
            success: true,
            message: "Lấy danh sách chuyên ngành thành công",
            data: majors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
