import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from '../model/paymentModel.js';
import Tuition from '../model/tuitionModel.js';
import Scholarship from '../model/scholarshipModel.js';
import User from '../model/userModel.js';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB for seeding payments');

  try {
    const existing = await Payment.countDocuments();
    if (existing > 0) { console.log('Payments already exist, skipping'); return process.exit(0); }

    let user = await User.findOne();
    if (!user) {
      user = await User.create({ name: 'Sinh viên mẫu', email: `sample${Date.now()}@example.com`, mssv: 'SV0001' });
      console.log('Created sample user', user._id);
    }

    const tuitions = await Tuition.find().limit(2);
    const scholarships = await Scholarship.find().limit(2);

    const payments = [];
    if (tuitions.length) {
      payments.push({ studentId: user._id, type: 'tuition', financeId: tuitions[0]._id, amount: tuitions[0].amount || 10000000, note: 'Đóng học phí kỳ 1', createdBy: user._id });
    }
    if (scholarships.length) {
      payments.push({ studentId: user._id, type: 'scholarship', financeId: scholarships[0]._id, amount: scholarships[0].amount || 3000000, note: 'Nhận học bổng', createdBy: user._id });
    }

    if (payments.length) {
      await Payment.insertMany(payments);
      console.log('Inserted payment records');
    } else {
      console.log('No finance items to create payments from');
    }

  } catch (err) {
    console.error('Seeding payments error', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
