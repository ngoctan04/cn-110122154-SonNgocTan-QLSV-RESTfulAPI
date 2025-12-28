import mongoose from 'mongoose';

const ScholarshipSchema = new mongoose.Schema({
  name: String,
  description: String,
  amount: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Scholarship', ScholarshipSchema);
