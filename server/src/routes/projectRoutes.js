const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  addComment,
  getProjectStats
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Stats route
router.route('/stats').get(authorize('teacher', 'admin'), getProjectStats);

// Main project routes
router
  .route('/')
  .get(getProjects)
  .post(authorize('teacher', 'admin'), createProject);

router
  .route('/:id')
  .get(getProject)
  .put(authorize('teacher', 'admin'), updateProject)
  .delete(authorize('teacher', 'admin'), deleteProject);

// Status update route
router.route('/:id/status').patch(updateProjectStatus);

// Milestone routes
router
  .route('/:id/milestones')
  .post(authorize('teacher', 'admin'), addMilestone);

router
  .route('/:id/milestones/:milestoneId')
  .patch(updateMilestone)
  .delete(authorize('teacher', 'admin'), deleteMilestone);

// Comment routes
router.route('/:id/comments').post(addComment);

module.exports = router; 