import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: String,
  content: String,
  color: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Note', noteSchema);