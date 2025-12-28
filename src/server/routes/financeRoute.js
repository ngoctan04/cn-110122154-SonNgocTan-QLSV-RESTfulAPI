import express from 'express';
import {
	getTuitions,
	getScholarships,
	createTuition,
	createScholarship,
	updateTuition,
	updateScholarship,
	deleteTuition,
	deleteScholarship,
	recordPayment,
	getPayments
} from '../controller/financeController.js';
import { protectRoute, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public reads
router.get('/tuition', getTuitions);
router.get('/scholarships', getScholarships);
router.get('/payments', protectRoute, isAdmin, getPayments);

// Admin CRUD
router.post('/tuition', protectRoute, isAdmin, createTuition);
router.put('/tuition/:id', protectRoute, isAdmin, updateTuition);
router.delete('/tuition/:id', protectRoute, isAdmin, deleteTuition);

router.post('/scholarships', protectRoute, isAdmin, createScholarship);
router.put('/scholarships/:id', protectRoute, isAdmin, updateScholarship);
router.delete('/scholarships/:id', protectRoute, isAdmin, deleteScholarship);

// Payments (admin or cashier role in future)
router.post('/payments', protectRoute, isAdmin, recordPayment);

export default router;
