import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  enrollmentNo: {
    type: String,
    required: true,
    unique: true,
  },
  rollNo: {
    type: String,
    required: true,
    unique: true,
  },
  project: {
    type: String,
    default: 'Not Assigned',
  },
  projectStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Student', studentSchema); 