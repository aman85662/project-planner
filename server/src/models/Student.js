const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add student name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  enrollmentNumber: {
    type: String,
    required: [true, 'Please add enrollment number'],
    unique: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Please add roll number'],
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Please add department']
  },
  year: {
    type: Number,
    required: [true, 'Please add year'],
    min: 1,
    max: 5
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phoneNumber: {
    type: String,
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated'],
    default: 'active'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  ]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Cascade delete projects when a student is deleted
StudentSchema.pre('remove', async function(next) {
  await this.model('Project').updateMany(
    { students: this._id },
    { $pull: { students: this._id } }
  );
  next();
});

module.exports = mongoose.model('Student', StudentSchema); 