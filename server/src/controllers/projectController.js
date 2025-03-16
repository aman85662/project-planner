const Project = require('../models/Project');
const Student = require('../models/Student');
const asyncHandler = require('express-async-handler');

// @desc    Get all projects with filtering
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Remove fields from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // For students, only show their own projects
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      reqQuery.student = student._id;
    }

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Project.find(JSON.parse(queryStr));

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { title: searchRegex },
        { description: searchRegex }
      ]);
    }

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Project.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate fields
    query = query.populate({
      path: 'student',
      select: 'name enrollmentNumber rollNumber'
    });

    // Executing query
    const projects = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      pagination,
      totalProjects: total,
      totalPages: Math.ceil(total / limit),
      data: projects
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate({
      path: 'student',
      select: 'name enrollmentNumber rollNumber email',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is authorized to view this project
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (!student || project.student.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this project'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Teacher
exports.createProject = asyncHandler(async (req, res) => {
  try {
    // Check if student exists
    const student = await Student.findById(req.body.student);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Create project
    const project = await Project.create(req.body);

    // Add project to student's projects array
    student.projects.push(project._id);
    await student.save();

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Teacher
exports.updateProject = asyncHandler(async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update project
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Teacher
exports.deleteProject = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Remove project from student's projects array
    const student = await Student.findById(project.student);
    if (student) {
      student.projects = student.projects.filter(
        projId => projId.toString() !== project._id.toString()
      );
      await student.save();
    }

    await project.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Update project status
// @route   PATCH /api/projects/:id/status
// @access  Private
exports.updateProjectStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // For students, only allow status updates on their own projects
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (!student || project.student.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this project'
        });
      }
    }

    project.status = status;
    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Add milestone to project
// @route   POST /api/projects/:id/milestones
// @access  Private/Teacher
exports.addMilestone = asyncHandler(async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and description'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Add milestone
    project.milestones.push({
      title,
      description,
      dueDate,
      completed: false
    });

    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Update milestone
// @route   PATCH /api/projects/:id/milestones/:milestoneId
// @access  Private
exports.updateMilestone = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is authorized to update this project
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (!student || project.student.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this project'
        });
      }
    }

    // Find milestone
    const milestone = project.milestones.id(req.params.milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Update milestone fields
    const fieldsToUpdate = ['title', 'description', 'dueDate', 'completed'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        // If user is student, only allow updating 'completed' status
        if (req.user.role === 'student' && field !== 'completed') {
          return;
        }
        milestone[field] = req.body[field];
      }
    });

    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Delete milestone
// @route   DELETE /api/projects/:id/milestones/:milestoneId
// @access  Private/Teacher
exports.deleteMilestone = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Find milestone
    const milestone = project.milestones.id(req.params.milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Remove milestone
    milestone.remove();
    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Add comment to project
// @route   POST /api/projects/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide comment text'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is authorized to comment on this project
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (!student || project.student.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to comment on this project'
        });
      }
    }

    // Add comment
    project.comments.push({
      user: req.user.id,
      name: req.user.name,
      role: req.user.role,
      text,
      createdAt: Date.now()
    });

    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private/Teacher
exports.getProjectStats = asyncHandler(async (req, res) => {
  try {
    // Get total projects count
    const total = await Project.countDocuments();

    // Get status stats
    const statusStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object format
    const formattedStatusStats = {};
    statusStats.forEach(stat => {
      formattedStatusStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      total,
      statusStats: formattedStatusStats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}); 