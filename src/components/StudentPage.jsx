import React, { useState, useEffect } from 'react';

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
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
    // Set up polling for real-time updates
    const interval = setInterval(fetchStudents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
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

      if (!response.ok) throw new Error('Failed to update project');
      
      setSuccessMessage('Project selected successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchStudents();
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(`http://localhost:5000/api/students/${selectedStudent}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectStatus: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      setSuccessMessage('Status updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchStudents();
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentStudent = students.find(student => student._id === selectedStudent);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Student Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Your Details</h2>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Your Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectIdeas.map((project, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  currentStudent?.project === project
                    ? 'bg-blue-50 border-blue-500'
                    : 'hover:shadow-lg hover:border-blue-300'
                }`}
                onClick={() => handleProjectSelect(project)}
              >
                <h3 className="font-semibold text-lg mb-2">{project}</h3>
                <p className="text-gray-600">
                  {currentStudent?.project === project ? 'Selected' : 'Click to select'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Project Status */}
      {selectedStudent && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Project Status</h2>
          {currentStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Current Project:</p>
                  <p className="font-semibold text-lg">{currentStudent.project}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status:</p>
                  <select
                    value={currentStudent.projectStatus}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="mt-1 block w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">Last Updated:</p>
                <p className="font-semibold">
                  {new Date(currentStudent.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPage; 