import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  HiPlus, 
  HiSearch, 
  HiFilter, 
  HiArrowNarrowRight, 
  HiChevronLeft, 
  HiChevronRight 
} from 'react-icons/hi';
import { projectAPI } from '@services/api';
import LoadingSpinner from '@components/LoadingSpinner';
import { useAuth } from '@context/AuthContext';

// Helper function to parse query params
const getQueryParams = (search) => {
  const params = new URLSearchParams(search);
  return {
    page: params.get('page') ? Number(params.get('page')) : 1,
    limit: params.get('limit') ? Number(params.get('limit')) : 10,
    status: params.get('status') || '',
    search: params.get('search') || '',
    sortBy: params.get('sortBy') || 'createdAt',
    sortOrder: params.get('sortOrder') || 'desc',
  };
};

const ProjectsListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get query params from URL
  const queryParams = getQueryParams(location.search);
  
  // State for filters and pagination
  const [page, setPage] = useState(queryParams.page);
  const [limit, setLimit] = useState(queryParams.limit);
  const [status, setStatus] = useState(queryParams.status);
  const [searchTerm, setSearchTerm] = useState(queryParams.search);
  const [sortBy, setSortBy] = useState(queryParams.sortBy);
  const [sortOrder, setSortOrder] = useState(queryParams.sortOrder);
  const [debouncedSearch, setDebouncedSearch] = useState(queryParams.search);
  const [showFilters, setShowFilters] = useState(false);
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Update URL with current filters when they change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (page !== 1) params.set('page', page.toString());
    if (limit !== 10) params.set('limit', limit.toString());
    if (status) params.set('status', status);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    
    navigate({ search: params.toString() }, { replace: true });
  }, [page, limit, status, debouncedSearch, sortBy, sortOrder, navigate]);
  
  // Query for projects with current filters
  const { 
    data: projectsData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['projects', page, limit, status, debouncedSearch, sortBy, sortOrder],
    () => {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      
      if (status) params.status = status;
      if (debouncedSearch) params.search = debouncedSearch;
      
      // If user is a student, only fetch their projects
      if (user?.role === 'student') {
        return projectAPI.getStudentProjects(user._id, params);
      }
      
      return projectAPI.getAll(params);
    },
    {
      keepPreviousData: true
    }
  );

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch, sortBy, sortOrder]);
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };
  
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };
  
  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split(':');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
  };
  
  const handleClearFilters = () => {
    setStatus('');
    setSearchTerm('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Derived values
  const isTeacher = user?.role === 'teacher';
  const totalProjects = projectsData?.totalProjects || 0;
  const totalPages = projectsData?.totalPages || 1;
  const projects = projectsData?.projects || [];
  const isFiltered = status || debouncedSearch || sortBy !== 'createdAt' || sortOrder !== 'desc';

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
        <p>Failed to load projects. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {isTeacher ? 'All Projects' : 'My Projects'}
        </h1>
        {isTeacher && (
          <Link to="/projects/new" className="btn-primary flex items-center">
            <HiPlus className="mr-2" /> New Project
          </Link>
        )}
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search projects..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </form>
          
          {/* Filter Toggle */}
          <button
            onClick={toggleFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <HiFilter className="mr-2 h-5 w-5 text-gray-500" /> Filters
          </button>
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={handleStatusChange}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            {/* Sort Filter */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort"
                value={`${sortBy}:${sortOrder}`}
                onChange={handleSortChange}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="deadline:asc">Deadline (Soonest)</option>
                <option value="deadline:desc">Deadline (Latest)</option>
                <option value="title:asc">Title (A-Z)</option>
                <option value="title:desc">Title (Z-A)</option>
                <option value="progress:asc">Progress (Low to High)</option>
                <option value="progress:desc">Progress (High to Low)</option>
              </select>
            </div>
            
            {/* Items per page */}
            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
                Items Per Page
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            
            {/* Clear Filters Button */}
            {isFiltered && (
              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Projects List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {projects.length === 0 ? (
          <div className="text-center py-16 px-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-6">
              {isFiltered 
                ? "Try adjusting your search or filter criteria"
                : isTeacher 
                  ? "Get started by creating your first project" 
                  : "You don't have any projects assigned yet"}
            </p>
            {isTeacher && !isFiltered && (
              <Link to="/projects/new" className="btn-primary inline-flex items-center">
                <HiPlus className="mr-2" /> Create New Project
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Title
                    </th>
                    {isTeacher && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{project.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{project.description}</div>
                      </td>
                      {isTeacher && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{project.students.length}</div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(project.deadline).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(() => {
                            const deadline = new Date(project.deadline);
                            const today = new Date();
                            const diffTime = deadline - today;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays < 0) {
                              return 'Overdue';
                            } else if (diffDays === 0) {
                              return 'Due today';
                            } else if (diffDays === 1) {
                              return 'Due tomorrow';
                            } else {
                              return `${diffDays} days left`;
                            }
                          })()}
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/projects/${project._id}`} 
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        >
                          View <HiArrowNarrowRight className="ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{projects.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(page * limit, totalProjects)}
                    </span>{' '}
                    of <span className="font-medium">{totalProjects}</span> projects
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {/* Previous Page */}
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        page === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <HiChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(totalPages).keys()].map((pageNum) => {
                      const pageNumber = pageNum + 1;
                      
                      // Show only current page, first and last page, and one page before and after current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= page - 1 && pageNumber <= page + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNumber
                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      
                      // Show ellipsis
                      if (
                        (pageNumber === 2 && page > 3) ||
                        (pageNumber === totalPages - 1 && page < totalPages - 2)
                      ) {
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      
                      return null;
                    })}
                    
                    {/* Next Page */}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        page === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <HiChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectsListPage; 