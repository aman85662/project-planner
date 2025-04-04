const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});

    // Create teachers
    const teachers = await User.create([
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'teacher',
        department: 'Computer Science',
        designation: 'Professor'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'teacher',
        department: 'Information Technology',
        designation: 'Associate Professor'
      }
    ]);

    // Create students
    const students = await User.create([
      {
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'student',
        enrollmentNumber: 'CS2021001',
        rollNumber: '21/CS/001',
        department: 'Computer Science',
        semester: 3
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'student',
        enrollmentNumber: 'CS2021002',
        rollNumber: '21/CS/002',
        department: 'Computer Science',
        semester: 3
      },
      {
        name: 'Carol Davis',
        email: 'carol.davis@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'student',
        enrollmentNumber: 'IT2021001',
        rollNumber: '21/IT/001',
        department: 'Information Technology',
        semester: 3
      }
    ]);

    // Create projects
    const projects = await Project.create([
      {
        title: 'E-Commerce Website Development',
        description: 'Build a full-stack e-commerce website using MERN stack',
        teacher: teachers[0]._id,
        students: [students[0]._id, students[1]._id],
        deadline: new Date('2024-06-30'),
        status: 'In Progress',
        progress: 45,
        milestones: [
          { title: 'Frontend Design', completed: true },
          { title: 'Backend API Development', completed: true },
          { title: 'Database Integration', completed: false },
          { title: 'Payment Gateway Integration', completed: false },
          { title: 'Testing and Deployment', completed: false }
        ]
      },
      {
        title: 'AI Chatbot Development',
        description: 'Create an intelligent chatbot using Python and TensorFlow',
        teacher: teachers[1]._id,
        students: [students[2]._id],
        deadline: new Date('2024-07-15'),
        status: 'Not Started',
        progress: 0,
        milestones: [
          { title: 'Data Collection', completed: false },
          { title: 'Model Training', completed: false },
          { title: 'API Development', completed: false },
          { title: 'Frontend Integration', completed: false },
          { title: 'Testing and Optimization', completed: false }
        ]
      },
      {
        title: 'Mobile App Development',
        description: 'Develop a cross-platform mobile app using React Native',
        teacher: teachers[0]._id,
        students: [students[0]._id],
        deadline: new Date('2024-08-01'),
        status: 'Completed',
        progress: 100,
        milestones: [
          { title: 'UI Design', completed: true },
          { title: 'Core Features Implementation', completed: true },
          { title: 'Backend Integration', completed: true },
          { title: 'Testing', completed: true },
          { title: 'App Store Deployment', completed: true }
        ]
      }
    ]);

    console.log('Sample data seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('Teachers:');
    teachers.forEach(teacher => {
      console.log(`Email: ${teacher.email}, Password: password123`);
    });
    console.log('\nStudents:');
    students.forEach(student => {
      console.log(`Email: ${student.email}, Password: password123`);
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

module.exports = seedData; 