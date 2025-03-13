import React, { useState, useEffect } from 'react';

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [projectIdeas] = useState([
    'E-commerce Website',
    'Mobile App Development',
    'AI Chatbot',
    'Weather Application',
    'Task Management System',
    'Social Media Dashboard',
    'Online Learning Platform',
    'Healthcare Management System',
    'Inventory Management System',
    'Real Estate Website'
  ]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleProjectSelect = async (project) => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(`http://localhost:5000/api/students/${selectedStudent}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project,
          projectStatus: 'In Progress'
        }),
      });

      if (response.ok) {
        fetchStudents();
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      {/* Student Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Your Details</h2>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">Select your name</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name} - {student.enrollmentNo}
            </option>
          ))}
        </select>
      </div>

      {/* Project Selection */}
      {selectedStudent && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Select Your Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectIdeas.map((project, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleProjectSelect(project)}
              >
                <h3 className="font-semibold text-lg mb-2">{project}</h3>
                <p className="text-gray-600">Click to select this project</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Project Status */}
      {selectedStudent && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Project Status</h2>
          {students
            .filter((student) => student._id === selectedStudent)
            .map((student) => (
              <div key={student._id}>
                <p className="text-lg">
                  <span className="font-semibold">Current Project:</span>{' '}
                  {student.project}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Status:</span>{' '}
                  <span className={`font-semibold ${
                    student.projectStatus === 'Completed' ? 'text-green-600' :
                    student.projectStatus === 'In Progress' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {student.projectStatus}
                  </span>
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default StudentPage; 