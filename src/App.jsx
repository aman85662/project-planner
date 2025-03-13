import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import TeacherPage from './components/TeacherPage';
import StudentPage from './components/StudentPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <Routes>
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/student" element={<StudentPage />} />
          <Route path="/" element={
            <div className="container mx-auto px-4 py-8">
              {/* Hero Section */}
              <div className="text-center mb-16">
                <h1 className="text-5xl font-bold text-blue-600 mb-4">
                  Project Management Portal
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  A comprehensive platform for managing student projects, tracking progress, and facilitating collaboration between teachers and students.
                </p>
              </div>

              {/* Features Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-blue-600 text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">Project Tracking</h3>
                  <p className="text-gray-600">
                    Real-time tracking of project progress and status updates
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-blue-600 text-4xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold mb-2">User Management</h3>
                  <p className="text-gray-600">
                    Efficient management of student profiles and project assignments
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-blue-600 text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-2">Project Selection</h3>
                  <p className="text-gray-600">
                    Wide range of project ideas for students to choose from
                  </p>
                </div>
              </div>

              {/* Access Portals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl mb-4">👨‍🏫</div>
                  <h2 className="text-2xl font-semibold mb-4">Teacher Portal</h2>
                  <ul className="text-gray-600 mb-6 space-y-2">
                    <li>✓ Add and manage student profiles</li>
                    <li>✓ Track project progress</li>
                    <li>✓ View all student assignments</li>
                    <li>✓ Monitor project status</li>
                  </ul>
                  <a
                    href="/teacher"
                    className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-700 transition-colors"
                  >
                    Access Teacher Dashboard
                  </a>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl mb-4">👨‍🎓</div>
                  <h2 className="text-2xl font-semibold mb-4">Student Portal</h2>
                  <ul className="text-gray-600 mb-6 space-y-2">
                    <li>✓ Select project topics</li>
                    <li>✓ Update project status</li>
                    <li>✓ Track personal progress</li>
                    <li>✓ View project details</li>
                  </ul>
                  <a
                    href="/student"
                    className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-700 transition-colors"
                  >
                    Access Student Dashboard
                  </a>
                </div>
              </div>

              {/* Footer Section */}
              <div className="text-center mt-16 text-gray-600">
                <p>© 2024 Project Management Portal. All rights reserved.</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
