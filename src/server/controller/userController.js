import e from 'express';
import mongoose from 'mongoose';
import User from '../model/userModel.js';
import Class from '../model/classModel.js';
import Major from '../model/majorModel.js';
import path from 'path';
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

export const create = async (req, res) => {
    try {
        const { name, email, phone, address, gender, classId, majorId, joinDate } = req.body;

        // Validation cơ bản
        if (!name || !email || !address) {
            return res.status(400).json({ 
                success: false,
                message: "Tên, email và địa chỉ là bắt buộc" 
            });
        }

        // If mssv not provided, generate one using prefix 110122 + random 3 digits and ensure uniqueness
        if (!req.body.mssv) {
            let attempts = 0;
            let candidate;
            do {
                candidate = '110122' + Math.floor(100 + Math.random() * 900).toString();
                const exists = await User.findOne({ mssv: candidate });
                if (!exists) break;
                attempts++;
            } while (attempts < 10);
            req.body.mssv = candidate;
        }

        // Validate classId and majorId if provided
        if (classId) {
            const classDoc = await Class.findById(classId);
            if (!classDoc) {
                return res.status(404).json({ success: false, message: 'Lớp học không tồn tại' });
            }
            req.body.className = classDoc.className;
        }

        if (majorId) {
            const majorDoc = await Major.findById(majorId);
            if (!majorDoc) {
                return res.status(404).json({ success: false, message: 'Chuyên ngành không tồn tại' });
            }
            req.body.majorName = majorDoc.majorName;
        }

        const newUser = new User(req.body);
        const saveData = await newUser.save();

        // If assigned to a class, increment the class totalStudents
        if (saveData.classId) {
            await Class.findByIdAndUpdate(saveData.classId, { $inc: { totalStudents: 1 } });
        }

        // Create audit entry
        try {
            await createAudit({
                actorId: req.userId || null,
                actorEmail: req.userEmail || null,
                action: 'create',
                entity: 'User',
                entityId: saveData._id,
                entityName: saveData.name,
                details: { createdFields: req.body }
            });
        } catch (e) {
            console.error('Audit creation failed:', e);
        }
        
        res.status(201).json({
            success: true,
            message: "Thêm sinh viên thành công",
            data: saveData
        });
    } catch (error) {
        const errorResponse = handleValidationError(error);
        res.status(errorResponse.status).json({ 
            success: false,
            message: errorResponse.message
        });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        // Lấy query params từ request
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const filter = req.query.filter || '';
        const sort = req.query.sort || '-createdAt';
        
        // Validate page và limit
        if (page < 1) {
            return res.status(400).json({ 
                success: false, 
                message: "Page phải lớn hơn 0" 
            });
        }
        
        if (limit < 1 || limit > 1000) {
            return res.status(400).json({ 
                success: false, 
                message: "Limit phải từ 1 đến 1000" 
            });
        }

        // Xây dựng query filter
        let query = {};

        // Search: tìm kiếm theo tên hoặc email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter: hỗ trợ lọc theo classId (ObjectId) hoặc className (backward compatible)
        if (filter && filter !== 'all') {
            if (mongoose.Types.ObjectId.isValid(filter)) {
                query.classId = filter;
            } else {
                query.className = filter;
            }
        }

        // Tính số document cần skip
        const skip = (page - 1) * limit;

        // Lấy tổng số document sau filter
        const total = await User.countDocuments(query);

        // Parse sort parameter (format: "field" hoặc "-field" cho descending)
        let sortObj = {};
        if (sort) {
            if (sort.startsWith('-')) {
                sortObj[sort.slice(1)] = -1;
            } else {
                sortObj[sort] = 1;
            }
        } else {
            sortObj = { createdAt: -1 };
        }

        // Lấy dữ liệu với filter, sort, và pagination - populate class/major
        const userData = await User.find(query)
            .populate('classId', 'className')
            .populate('majorId', 'majorName')
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        if (!userData || userData.length === 0) {
            return res.status(200).json({ 
                success: true,
                message: "Chưa có dữ liệu sinh viên phù hợp",
                data: [],
                pagination: {
                    currentPage: page,
                    pageSize: limit,
                    total: total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }

        // Tính tổng số trang
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            message: "Lấy danh sách sinh viên thành công",
            data: userData,
            pagination: {
                currentPage: page,
                pageSize: limit,
                total: total,
                totalPages: totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {    
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserById = async (req, res) => {   
    try {
        const id = req.params.id;
        const userExists = await User.findById(id)
            .populate('classId', 'className')
            .populate('majorId', 'majorName');
        if (!userExists) {
            return res.status(404).json({ 
                success: false,
                message: "Sinh viên không tồn tại" 
            });
        }
        res.status(200).json({
            success: true,
            message: "Lấy thông tin sinh viên thành công",
            data: userExists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const update = async (req, res) => {
    try {
        const id = req.params.id;
        const userExists = await User.findById(id);
        if (!userExists) {
            return res.status(404).json({ 
                success: false,
                message: "Sinh viên không tồn tại" 
            });
        }

        // Handle class change: adjust class totalStudents counts
        if (req.body.classId && req.body.classId !== userExists.classId?.toString()) {
            // validate new class
            const newClass = await Class.findById(req.body.classId);
            if (!newClass) {
                return res.status(404).json({ success: false, message: 'Lớp học không tồn tại' });
            }
            // increment new class
            await Class.findByIdAndUpdate(req.body.classId, { $inc: { totalStudents: 1 } });
            // decrement old class if exists
            if (userExists.classId) {
                await Class.findByIdAndUpdate(userExists.classId, { $inc: { totalStudents: -1 } });
            }
            // ensure className is in sync
            req.body.className = newClass.className;
        }

        // Handle major change: keep majorName in sync
        if (req.body.majorId && req.body.majorId !== userExists.majorId?.toString()) {
            const newMajor = await Major.findById(req.body.majorId);
            if (!newMajor) {
                return res.status(404).json({ success: false, message: 'Chuyên ngành không tồn tại' });
            }
            req.body.majorName = newMajor.majorName;
        }

        const updateData = await User.findByIdAndUpdate(id, req.body, { 
            new: true,
            runValidators: true 
        });

        // Audit
        try {
            await createAudit({
                actorId: req.userId || null,
                actorEmail: req.userEmail || null,
                action: 'update',
                entity: 'User',
                entityId: updateData._id,
                entityName: updateData.name,
                details: { changes: req.body }
            });
        } catch (e) {
            console.error('Audit creation failed:', e);
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật sinh viên thành công",
            data: updateData
        });
    } catch (error) {
        const errorResponse = handleValidationError(error);
        res.status(errorResponse.status).json({
            success: false,
            message: errorResponse.message
        });
    }
};



    // Upload avatar cho sinh viên
    export const uploadAvatar = async (req, res) => {
        try {
            const userId = req.params.id;
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh!' });
            }
            const avatarPath = path.join('uploads', req.file.filename);
            const user = await User.findByIdAndUpdate(userId, { avatar: avatarPath, updatedAt: Date.now() }, { new: true });
            if (!user) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên!' });
            }
            res.status(200).json({
                success: true,
                message: 'Upload ảnh đại diện thành công!',
                data: user
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const userExists = await User.findById(id);
        if (!userExists) {
            return res.status(404).json({ 
                success: false,
                message: "Sinh viên không tồn tại" 
            });
        }

        // If assigned to a class, decrement totalStudents
        if (userExists.classId) {
            await Class.findByIdAndUpdate(userExists.classId, { $inc: { totalStudents: -1 } });
        }

        await User.findByIdAndDelete(id);

        // Audit delete
        try {
            await createAudit({
                actorId: req.userId || null,
                actorEmail: req.userEmail || null,
                action: 'delete',
                entity: 'User',
                entityId: userExists._id,
                entityName: userExists.name,
                details: { deletedRecord: userExists }
            });
        } catch (e) {
            console.error('Audit creation failed:', e);
        }

        res.status(200).json({ 
            success: true,
            message: "Xóa sinh viên thành công" 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
