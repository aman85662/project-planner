import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { HiUsers, HiClipboardList, HiCheckCircle, HiClock, HiPlus } from 'react-icons/hi';
import { studentAPI, projectAPI } from '@services/api';
import LoadingSpinner from '@components/LoadingSpinner';
import { useAuth } from '@context/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [recentProjects, setRecentProjects] = useState([]);

  // Fetch student statistics
  const { 
    data: studentStats, 
    isLoading: loadingStudentStats,
    error: studentStatsError
  } = useQuery(['studentStats'], () => 
    studentAPI.getStats().then(res => res.data)
  );

  // Fetch recent projects
  const { 
    data: projectsData, 
    isLoading: loadingProjects,
    error: projectsError 
  } = useQuery(['projects'], () => 
    projectAPI.getAll({ limit: 5, sort: '-createdAt' }).then(res => res.data)
  );

  // Set recent projects when data is loaded
  useEffect(() => {
    if (projectsData && projectsData.projects) {
      setRecentProjects(projectsData.projects);
    }
  }, [projectsData]);

  // Calculate status counts
  const getStatusCounts = () => {
    if (!studentStats) return { total: 0, notStarted: 0, inProgress: 0, completed: 0 };
    
    return {
      total: studentStats.total || 0,
      notStarted: studentStats.statusStats['Not Started'] || 0,
      inProgress: studentStats.statusStats['In Progress'] || 0,
      completed: studentStats.statusStats['Completed'] || 0
    };
  };

  const statusCounts = getStatusCounts();

  const isLoading = loadingStudentStats || loadingProjects;
  const hasError = studentStatsError || projectsError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p className="font-bold">Error</p>
        <p>Failed to load dashboard data. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/projects/new" className="btn-primary flex items-center">
            <HiPlus className="mr-2" /> New Project
          </Link>
          <Link to="/students/new" className="btn-secondary flex items-center">
            <HiPlus className="mr-2" /> Add Student
          </Link>
        </div>
      </div>
      
      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Welcome, {user?.name || 'Teacher'}!
        </h2>
        <p className="text-gray-600">
          Manage your students' projects and track their progress from your dashboard.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <HiUsers className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Students</p>
              <h3 className="text-3xl font-bold">{statusCounts.total}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
              <HiClock className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Not Started</p>
              <h3 className="text-3xl font-bold">{statusCounts.notStarted}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <HiClipboardList className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">In Progress</p>
              <h3 className="text-3xl font-bold">{statusCounts.inProgress}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <HiCheckCircle className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <h3 className="text-3xl font-bold">{statusCounts.completed}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Projects</h2>
          <Link to="/projects" className="text-primary-600 hover:text-primary-700 text-sm">
            View All
          </Link>
        </div>
        
        {recentProjects.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <p>No projects found. Start by creating a new project.</p>
            <Link to="/projects/new" className="btn-primary mt-4 inline-block">
              Create New Project
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentProjects.map((project) => (
                  <tr key={project._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/projects/${project._id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.students.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${project.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            project.progress >= 100 ? 'bg-green-600' : 
                            project.progress > 50 ? 'bg-blue-600' : 
                            'bg-yellow-600'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {project.progress}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/students" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <HiUsers className="text-primary-500 text-xl mr-2" />
            <span>Manage Students</span>
          </Link>
          <Link 
            to="/projects" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <HiClipboardList className="text-primary-500 text-xl mr-2" />
            <span>View All Projects</span>
          </Link>
          <Link 
            to="/profile" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <HiUsers className="text-primary-500 text-xl mr-2" />
            <span>Update Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 