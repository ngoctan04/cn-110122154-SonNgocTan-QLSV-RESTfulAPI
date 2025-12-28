import mongoose from 'mongoose';

const TuitionSchema = new mongoose.Schema({
  course: String,
  year: String,
  amount: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Tuition', TuitionSchema);
