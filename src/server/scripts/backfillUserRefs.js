import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../model/userModel.js';
import Class from '../model/classModel.js';
import Major from '../model/majorModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // Backfill classId from className
        const usersMissingClassId = await User.find({ $or: [{ classId: { $exists: false } }, { classId: null }], className: { $ne: null } });
        console.log(`Found ${usersMissingClassId.length} users with className but missing classId`);

        let updatedCount = 0;
        for (const u of usersMissingClassId) {
            const cls = await Class.findOne({ className: u.className });
            if (cls) {
                u.classId = cls._id;
                await u.save();
                updatedCount++;
            } else {
                console.warn(`No class found for user ${u._id} with className=${u.className}`);
            }
        }

        // Backfill majorId from majorName
        const usersMissingMajorId = await User.find({ $or: [{ majorId: { $exists: false } }, { majorId: null }], majorName: { $ne: null } });
        console.log(`Found ${usersMissingMajorId.length} users with majorName but missing majorId`);

        let updatedMajorCount = 0;
        for (const u of usersMissingMajorId) {
            const mj = await Major.findOne({ majorName: u.majorName });
            if (mj) {
                u.majorId = mj._id;
                await u.save();
                updatedMajorCount++;
            } else {
                console.warn(`No major found for user ${u._id} with majorName=${u.majorName}`);
            }
        }

        // Recompute class totalStudents to be safe
        const classes = await Class.find();
        for (const c of classes) {
            const count = await User.countDocuments({ classId: c._id });
            if (c.totalStudents !== count) {
                c.totalStudents = count;
                await c.save();
                console.log(`Updated totalStudents for class ${c.className} -> ${count}`);
            }
        }

        console.log(`Backfill complete. Users updated (classId): ${updatedCount}, (majorId): ${updatedMajorCount}`);
    } catch (error) {
        console.error('Error during backfill:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

run();
