import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../model/userModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const generateCandidate = () => '110122' + Math.floor(100 + Math.random() * 900).toString();

const backfill = async () => {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { autoIndex: true });
  console.log('Connected to DB');

  try {
    const users = await User.find({ $or: [{ mssv: null }, { mssv: '' }, { mssv: { $exists: false } }] });
    console.log(`Found ${users.length} users without MSSV`);

    const updated = [];

    for (const u of users) {
      let attempts = 0;
      let candidate;
      let ok = false;

      while (attempts < 20 && !ok) {
        candidate = generateCandidate();
        const exists = await User.findOne({ mssv: candidate });
        if (!exists) ok = true;
        attempts++;
      }

      if (!ok) {
        console.warn(`Could not generate unique MSSV for user ${u._id} after attempts`);
        continue;
      }

      try {
        u.mssv = candidate;
        await u.save();
        updated.push({ id: u._id, mssv: candidate });
        console.log(`Updated user ${u._id} -> ${candidate}`);
      } catch (err) {
        console.error(`Failed to update user ${u._id}:`, err.message || err);
      }
    }

    console.log(`Backfill complete. Updated ${updated.length} users.`);
  } catch (err) {
    console.error('Error while backfilling MSSV:', err.message || err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
    process.exit(0);
  }
};

backfill();
