import Audit from '../model/auditModel.js';

export const createAudit = async (payload) => {
    try {
        // payload should include actorId, actorEmail, action, entity, entityId, entityName, details
        const doc = await Audit.create(payload);
        return doc;
    } catch (error) {
        console.error('Error creating audit:', error);
        // Don't throw to avoid breaking main flows; return null
        return null;
    }
};

export const getAudits = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const entity = req.query.entity || null;
        const entityId = req.query.entityId || null;
        const actorEmail = req.query.actorEmail || null;

        const query = {};
        if (entity) query.entity = entity;
        if (entityId) query.entityId = entityId;
        if (actorEmail) query.actorEmail = actorEmail;

        const total = await Audit.countDocuments(query);
        const audits = await Audit.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({ success: true, data: audits, pagination: { currentPage: page, pageSize: limit, total } });
    } catch (error) {
        console.error('Error fetching audits:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
