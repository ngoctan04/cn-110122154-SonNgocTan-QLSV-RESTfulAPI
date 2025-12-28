import express from 'express';
import { getAudits } from '../controller/auditController.js';
import { protectRoute, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admins can view audit logs
router.get('/', protectRoute, isAdmin, getAudits);

export default router;
