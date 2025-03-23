const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  enrollmentNumber: {
    type: String,
    required: [true, 'Please add an enrollment number'],
    unique: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Please add a roll number'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Please add a department'],
    trim: true
  },
  year: {
    type: String,
    required: [true, 'Please add a year'],
    enum: ['1', '2', '3', '4']
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual field for full name
StudentSchema.virtual('fullName').get(function() {
  return this.name;
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