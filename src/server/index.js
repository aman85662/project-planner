import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Student from './models/Student.js';

// Load environment variables
dotenv.config();

// Define variables for connection - using hardcoded values to avoid 'process is not defined' errors
const MONGODB_URI = 'mongodb://127.0.0.1:27017/project-planner';
const PORT = 5000;

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Routes
// Get all students with filtering and pagination
app.get('/api/students', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    // Add status filter if provided
    if (status) {
      query.projectStatus = status;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { enrollmentNo: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Get single student by ID
app.get('/api/students/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Failed to fetch student' });
  }
});

// Add new student
app.post('/api/students', async (req, res) => {
  try {
    const { name, enrollmentNo, rollNo } = req.body;

    // Validate required fields
    if (!name || !enrollmentNo || !rollNo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for duplicate enrollment number
    const existingEnrollment = await Student.findOne({ enrollmentNo });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Enrollment number already exists' });
    }

    // Check for duplicate roll number
    const existingRollNo = await Student.findOne({ rollNo });
    if (existingRollNo) {
      return res.status(400).json({ message: 'Roll number already exists' });
    }

    const student = new Student({
      name: name.trim(),
      enrollmentNo: enrollmentNo.trim(),
      rollNo: rollNo.trim(),
      projectStatus: 'Not Started', // Default status
      project: '' // Empty project initially
    });

    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error adding student:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to add student' });
  }
});

// Update student
app.patch('/api/students/:id', async (req, res) => {
  try {
    const { project, projectStatus, name, enrollmentNo, rollNo } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check for duplicate enrollment number if being updated
    if (enrollmentNo && enrollmentNo !== student.enrollmentNo) {
      const existingEnrollment = await Student.findOne({ enrollmentNo });
      if (existingEnrollment) {
        return res.status(400).json({ message: 'Enrollment number already exists' });
      }
    }

    // Check for duplicate roll number if being updated
    if (rollNo && rollNo !== student.rollNo) {
      const existingRollNo = await Student.findOne({ rollNo });
      if (existingRollNo) {
        return res.status(400).json({ message: 'Roll number already exists' });
      }
    }

    const updateData = {};
    if (project !== undefined) updateData.project = project;
    if (projectStatus !== undefined) updateData.projectStatus = projectStatus;
    if (name !== undefined) updateData.name = name.trim();
    if (enrollmentNo !== undefined) updateData.enrollmentNo = enrollmentNo.trim();
    if (rollNo !== undefined) updateData.rollNo = rollNo.trim();

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to update student' });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

// Get statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const statusCounts = await Student.aggregate([
      {
        $group: {
          _id: '$projectStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusBreakdown = statusCounts.reduce((acc, curr) => {
      acc[curr._id || 'Not Started'] = curr.count;
      return acc;
    }, {});

    // Ensure all status types are represented even if zero
    if (!statusBreakdown['Not Started']) statusBreakdown['Not Started'] = 0;
    if (!statusBreakdown['In Progress']) statusBreakdown['In Progress'] = 0;
    if (!statusBreakdown['Completed']) statusBreakdown['Completed'] = 0;

    const statistics = {
      totalStudents,
      statusBreakdown
    };

    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 