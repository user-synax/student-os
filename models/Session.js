import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  duration: { type: Number, required: true },
  type: { type: String, enum: ['focus', 'short_break', 'long_break'], default: 'focus' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  taskTitle: { type: String, default: '' },
  wasCompleted: { type: Boolean, default: true },
  completedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
