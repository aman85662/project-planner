import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Student from './models/Student.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-planner')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
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

// Update student project
app.patch('/api/students/:id', async (req, res) => {
  try {
    const { project, projectStatus } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const updateData = {};
    if (project !== undefined) updateData.project = project;
    if (projectStatus !== undefined) updateData.projectStatus = projectStatus;

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 