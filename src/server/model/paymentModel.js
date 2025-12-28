import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['tuition', 'scholarship'], required: true },
  financeId: { type: mongoose.Schema.Types.ObjectId },
  amount: { type: Number, required: true },
  note: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', PaymentSchema);
