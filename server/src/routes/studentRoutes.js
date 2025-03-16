const express = require('express');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Stats route
router.route('/stats').get(authorize('teacher', 'admin'), getStudentStats);

// Main student routes
router
  .route('/')
  .get(authorize('teacher', 'admin'), getStudents)
  .post(authorize('teacher', 'admin'), createStudent);

router
  .route('/:id')
  .get(authorize('teacher', 'admin', 'student'), getStudent)
  .put(authorize('teacher', 'admin'), updateStudent)
  .delete(authorize('teacher', 'admin'), deleteStudent);

module.exports = router; 