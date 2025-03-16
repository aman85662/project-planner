import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { HiClipboardList, HiCheckCircle, HiClock, HiExclamation } from 'react-icons/hi';
import { projectAPI } from '@services/api';
import LoadingSpinner from '@components/LoadingSpinner';
import { useAuth } from '@context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
  });

  // Fetch student projects
  const { 
    data: projectsData, 
    isLoading, 
    error 
  } = useQuery(['studentProjects', user?._id], () => 
    projectAPI.getStudentProjects(user?._id).then(res => res.data),
    {
      enabled: !!user?._id,
    }
  );

  // Calculate project statistics when data is loaded
  useEffect(() => {
    if (projectsData && projectsData.projects) {
      setProjects(projectsData.projects);
      
      // Calculate stats
      const stats = {
        total: projectsData.projects.length,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
      };
      
      projectsData.projects.forEach(project => {
        if (project.status === 'Not Started') stats.notStarted++;
        else if (project.status === 'In Progress') stats.inProgress++;
        else if (project.status === 'Completed') stats.completed++;
      });
      
      setProjectStats(stats);
    }
  }, [projectsData]);

  // Get upcoming deadlines (projects with deadlines in the next 7 days)
  const getUpcomingDeadlines = () => {
    if (!projects.length) return [];
    
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    return projects
      .filter(project => {
        const deadline = new Date(project.deadline);
        return deadline > now && deadline <= sevenDaysLater && project.status !== 'Completed';
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  };

  const upcomingDeadlines = getUpcomingDeadlines();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
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
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
      </div>
      
      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Welcome, {user?.name || 'Student'}!
        </h2>
        <p className="text-gray-600">
          Track your project progress and manage your assignments from your dashboard.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <HiClipboardList className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Projects</p>
              <h3 className="text-3xl font-bold">{projectStats.total}</h3>
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
              <h3 className="text-3xl font-bold">{projectStats.notStarted}</h3>
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
              <h3 className="text-3xl font-bold">{projectStats.inProgress}</h3>
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
              <h3 className="text-3xl font-bold">{projectStats.completed}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Deadlines</h2>
        
        {upcomingDeadlines.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            <p>No upcoming deadlines in the next 7 days.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingDeadlines.map(project => (
              <div key={project._id} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      <Link to={`/projects/${project._id}`} className="hover:text-primary-600">
                        {project.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Due:</span> {new Date(project.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
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
                    {project.progress}% completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* All Projects */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">My Projects</h2>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <p>No projects assigned yet.</p>
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
                    Deadline
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
                {projects.map((project) => (
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
                      {new Date(project.deadline).toLocaleDateString()}
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
            to="/profile" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <HiClipboardList className="text-primary-500 text-xl mr-2" />
            <span>Update Profile</span>
          </Link>
          {projectStats.inProgress > 0 && (
            <Link 
              to="/projects?status=In%20Progress" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <HiClock className="text-primary-500 text-xl mr-2" />
              <span>Continue Working</span>
            </Link>
          )}
          {upcomingDeadlines.length > 0 && (
            <Link 
              to={`/projects/${upcomingDeadlines[0]._id}`}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <HiExclamation className="text-primary-500 text-xl mr-2" />
              <span>Next Deadline</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 