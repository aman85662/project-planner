const mongoose = require('mongoose');

// Milestone Schema (subdocument)
const MilestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a milestone title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a milestone description']
  },
  dueDate: {
    type: Date
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
});

// Comment Schema (subdocument)
const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: [true, 'Please add comment text'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Project Schema
const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a project title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a project description']
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    deadline: {
      type: Date,
      required: [true, 'Please add a project deadline']
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Delayed'],
      default: 'Not Started'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    tags: [String],
    milestones: [MilestoneSchema],
    comments: [CommentSchema],
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Calculate progress based on completed milestones
ProjectSchema.pre('save', function(next) {
  if (this.milestones && this.milestones.length > 0) {
    const completedCount = this.milestones.filter(m => m.completed).length;
    this.progress = Math.round((completedCount / this.milestones.length) * 100);
  }
  
  // Set completedAt date if status is changed to Completed
  if (this.status === 'Completed' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.status !== 'Completed') {
    this.completedAt = undefined;
  }
  
  next();
});

module.exports = mongoose.model('Project', ProjectSchema); 