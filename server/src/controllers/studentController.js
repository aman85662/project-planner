const Student = require('../models/Student');

// @desc    Get all students with filtering
// @route   GET /api/students
// @access  Private/Teacher
exports.getStudents = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Remove fields from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Student.find(JSON.parse(queryStr));

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { name: searchRegex },
        { enrollmentNumber: searchRegex },
        { rollNumber: searchRegex },
        { email: searchRegex }
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
    const total = await Student.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate user field
    query = query.populate('user', 'name email');

    // Executing query
    const students = await query;

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
      count: students.length,
      pagination,
      totalStudents: total,
      totalPages: Math.ceil(total / limit),
      data: students
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private/Teacher
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email')
      .populate('projects');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private/Teacher
exports.createStudent = async (req, res) => {
  try {
    // Check if student with same enrollment number already exists
    const existingStudent = await Student.findOne({ 
      enrollmentNumber: req.body.enrollmentNumber 
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this enrollment number already exists'
      });
    }

    // Create student
    const student = await Student.create(req.body);

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Teacher
exports.updateStudent = async (req, res) => {
  try {
    // Check if changing enrollment and if it already exists
    if (req.body.enrollmentNumber) {
      const existingStudent = await Student.findOne({ 
        enrollmentNumber: req.body.enrollmentNumber,
        _id: { $ne: req.params.id }
      });

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student with this enrollment number already exists'
        });
      }
    }

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Teacher
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await student.remove();

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
};

// @desc    Get student statistics
// @route   GET /api/students/stats
// @access  Private/Teacher
exports.getStudentStats = async (req, res) => {
  try {
    // Get total students count
    const total = await Student.countDocuments();

    // Get status stats
    const statusStats = await Student.aggregate([
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
}; 