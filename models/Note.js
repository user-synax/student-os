import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'Untitled', trim: true },
  content: { type: String, default: '' },
  tags: [{ type: String }],
  folder: { type: String, default: 'General' },
  isPinned: { type: Boolean, default: false },
  wordCount: { type: Number, default: 0 },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
