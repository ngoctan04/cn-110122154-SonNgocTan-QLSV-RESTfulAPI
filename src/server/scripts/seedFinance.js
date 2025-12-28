import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tuition from '../model/tuitionModel.js';
import Scholarship from '../model/scholarshipModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

const tuitions = [
  { course: 'Kỹ thuật phần mềm', year: '2023', amount: 12000000 },
  { course: 'Công nghệ thông tin', year: '2023', amount: 10000000 },
  { course: 'Khoa học máy tính', year: '2024', amount: 14000000 }
];

const scholarships = [
  { name: 'Học bổng Khuyến khích', description: 'Dành cho sinh viên có thành tích học tập xuất sắc', amount: 5000000 },
  { name: 'Học bổng Nghèo vượt khó', description: 'Hỗ trợ sinh viên có hoàn cảnh khó khăn', amount: 3000000 },
  { name: 'Học bổng Doanh nghiệp', description: 'Học bổng từ đối tác doanh nghiệp', amount: 8000000 }
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB for seeding finance data');

  try {
    // Insert tuitions if collection empty
    const tCount = await Tuition.countDocuments();
    if (tCount === 0) {
      await Tuition.insertMany(tuitions);
      console.log('Inserted tuition records');
    } else {
      console.log('Tuition collection not empty, skipping insert');
    }

    const sCount = await Scholarship.countDocuments();
    if (sCount === 0) {
      await Scholarship.insertMany(scholarships);
      console.log('Inserted scholarship records');
    } else {
      console.log('Scholarship collection not empty, skipping insert');
    }

    console.log('Seeding finished');
  } catch (err) {
    console.error('Seeding error', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
