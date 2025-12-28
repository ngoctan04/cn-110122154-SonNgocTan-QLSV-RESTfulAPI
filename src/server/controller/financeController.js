import Tuition from '../model/tuitionModel.js';
import Scholarship from '../model/scholarshipModel.js';
import Payment from '../model/paymentModel.js';
import { createAudit } from './auditController.js';

// --- Read
export const getTuitions = async (req, res) => {
  try {
    const items = await Tuition.find().lean();
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export const getScholarships = async (req, res) => {
  try {
    const items = await Scholarship.find().lean();
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// --- Create
export const createTuition = async (req, res) => {
  try {
    const payload = req.body;
    const item = await Tuition.create(payload);
    await createAudit({ actorId: req.userId, actorEmail: req.userEmail, action: 'create', entity: 'Tuition', entityId: item._id, entityName: item.course, details: payload });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo học phí' });
  }
};

export const createScholarship = async (req, res) => {
  try {
    const payload = req.body;
    const item = await Scholarship.create(payload);
    await createAudit({ actorId: req.userId, actorEmail: req.userEmail, action: 'create', entity: 'Scholarship', entityId: item._id, entityName: item.name, details: payload });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo học bổng' });
  }
};

// --- Update
export const updateTuition = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const item = await Tuition.findByIdAndUpdate(id, payload, { new: true });
    await createAudit({ actorId: req.userId, actorEmail: req.userEmail, action: 'update', entity: 'Tuition', entityId: item._id, entityName: item.course, details: payload });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật học phí' });
  }
};

export const updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const item = await Scholarship.findByIdAndUpdate(id, payload, { new: true });
    await createAudit({ actorId: req.userId, actorEmail: req.userEmail, action: 'update', entity: 'Scholarship', entityId: item._id, entityName: item.name, details: payload });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật học bổng' });
  }
};

// --- Delete
export const deleteTuition = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Tuition.findByIdAndDelete(id);
    await createAudit({ actorId: req.userId, actorEmail: req.userEmail, action: 'delete', entity: 'Tuition', entityId: item?._id, entityName: item?.course, details: {} });
    res.json({ success: true, message: 'Đã xóa' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa học phí' });
  }
};

export const deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Scholarship.findByIdAndDelete(id);
    await createAudit({ actorId: req.userId, actorEmail: req.userEmail, action: 'delete', entity: 'Scholarship', entityId: item?._id, entityName: item?.name, details: {} });
    res.json({ success: true, message: 'Đã xóa' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa học bổng' });
  }
};

// --- Payments: record a payment for a student
export const recordPayment = async (req, res) => {
  try {
    const { studentId, type, financeId, amount, note } = req.body; // type: 'tuition'|'scholarship'
    if (!studentId || !type || !amount) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });

    const payment = await Payment.create({ studentId, type, financeId, amount, note, createdBy: req.userId });
    await createAudit({ actorId: req.userId, actorEmail: req.userEmail, action: 'create', entity: 'Payment', entityId: payment._id, entityName: `${type}-${financeId || ''}`, details: payment });
    res.json({ success: true, data: payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi ghi nhận thanh toán' });
  }
};

export const getPayments = async (req, res) => {
  try {
    const items = await Payment.find().lean();
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
