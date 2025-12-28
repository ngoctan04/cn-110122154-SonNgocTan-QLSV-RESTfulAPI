import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Auth from '../model/authModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in environment. Set it in .env before running.');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/createAdmin.js <email> <password>');
  process.exit(1);
}

const [email, password] = args;

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('DB connected');

    // Try find existing user
    let user = await Auth.findOne({ email: email.toLowerCase() }).select('+password');
    if (user) {
      user.role = 'admin';
      user.password = password; // will be hashed by pre-save hook
      await user.save();
      console.log(`Updated existing user ${email} to role=admin`);
    } else {
      const newAdmin = new Auth({ email: email.toLowerCase(), password, role: 'admin' });
      await newAdmin.save();
      console.log(`Created new admin ${email}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
};

run();
