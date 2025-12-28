import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
    actorId: { type: mongoose.Schema.Types.ObjectId, default: null },
    actorEmail: { type: String, default: null },
    action: { type: String, required: true }, // e.g., 'create', 'update', 'delete'
    entity: { type: String, required: true }, // e.g., 'User', 'Class'
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    entityName: { type: String, default: null }, // e.g., user name or className
    details: { type: mongoose.Schema.Types.Mixed, default: null }, // optional extra data/json
    createdAt: { type: Date, default: Date.now }
});

const Audit = mongoose.model('Audit', auditSchema);
export default Audit;
