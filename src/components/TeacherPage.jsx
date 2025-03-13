import React, { useState, useEffect, useCallback, useRef } from 'react';

// Define API base URL - could be moved to a config file
const API_BASE_URL = 'http://localhost:5000/api';

// Create a reusable timeout controller for fetch requests
const createTimeoutController = (timeoutMs) => {
  // For browsers that don't support AbortSignal.timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId)
  };
};

const TeacherPage = () => {
  // State management
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: '',
    enrollmentNo: '',
    rollNo: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [serverOnline, setServerOnline] = useState(true);
  
  // Refs to track mounted state and store interval ID
  const isMounted = useRef(true);
  const intervalRef = useRef(null);

  // Set isMounted to false when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Memoized function to check server status
  const checkServerStatus = useCallback(async () => {
    if (!isMounted.current) return false;
    
    const timeoutController = createTimeoutController(3000);
    
    try {
      const response = await fetch(`${API_BASE_URL}/statistics`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: timeoutController.signal
      });
      
      const isOnline = response.ok;
      
      if (isMounted.current) {
        setServerOnline(isOnline);
        
        if (!isOnline) {
          setError('Cannot connect to server. Please check if the server is running.');
        }
      }
      
      return isOnline;
    } catch (error) {
      console.error('Server connection error:', error);
      
      if (isMounted.current) {
        setServerOnline(false);
        setError('Cannot connect to server. Please check if the server is running.');
      }
      
      return false;
    } finally {
      timeoutController.clear();
    }
  }, []);

  // Memoized function to fetch students
  const fetchStudents = useCallback(async () => {
    if (!isMounted.current || !serverOnline) return;
    
    const timeoutController = createTimeoutController(5000);
    
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`${API_BASE_URL}/students?${queryParams}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: timeoutController.signal
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (isMounted.current) {
        setStudents(data.students || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      
      if (isMounted.current) {
        // Don't override connection errors with fetch errors
        if (serverOnline) {
          setError(error.message);
        }
        setLoading(false);
      }
    } finally {
      timeoutController.clear();
    }
  }, [currentPage, searchTerm, statusFilter, serverOnline]);

  // Memoized function to fetch statistics
  const fetchStatistics = useCallback(async () => {
    if (!isMounted.current || !serverOnline) return;
    
    const timeoutController = createTimeoutController(5000);
    
    try {
      const response = await fetch(`${API_BASE_URL}/statistics`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: timeoutController.signal
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (isMounted.current) {
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Not setting error state here to avoid overriding more important errors
    } finally {
      timeoutController.clear();
    }
  }, [serverOnline]);

  // Initial server status check on mount
  useEffect(() => {
    checkServerStatus();
  }, [checkServerStatus]);
  
  // Set up data fetching and polling with proper dependencies
  useEffect(() => {
    // Don't fetch if server is offline
    if (!serverOnline) return;
    
    // Initial data fetch
    fetchStudents();
    fetchStatistics();
    
    // Set up polling
    intervalRef.current = setInterval(async () => {
      const isOnline = await checkServerStatus();
      if (isOnline && isMounted.current) {
        fetchStudents();
        fetchStatistics();
      }
    }, 5000);
    
    // Clean up interval on unmount or deps change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [serverOnline, fetchStudents, fetchStatistics, checkServerStatus]);

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');
    
    const timeoutController = createTimeoutController(5000);

    try {
      // Validate form data
      if (!newStudent.name.trim() || !newStudent.enrollmentNo.trim() || !newStudent.rollNo.trim()) {
        throw new Error('All fields are required');
      }

      // Check server status before submitting
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      }

      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newStudent.name.trim(),
          enrollmentNo: newStudent.enrollmentNo.trim(),
          rollNo: newStudent.rollNo.trim(),
        }),
        signal: timeoutController.signal
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to add student: ${response.status} ${response.statusText}`);
      }
      
      if (isMounted.current) {
        // Clear form and show success message
        setNewStudent({ name: '', enrollmentNo: '', rollNo: '' });
        setSuccessMessage('Student added successfully!');
        setTimeout(() => {
          if (isMounted.current) {
            setSuccessMessage('');
          }
        }, 3000);
        
        // Fetch updated data
        fetchStudents();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error adding student:', error);
      
      if (isMounted.current) {
        setError(error.message);
        setTimeout(() => {
          if (isMounted.current) {
            setError(null);
          }
        }, 3000);
      }
    } finally {
      timeoutController.clear();
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  // Handler for status updates
  const handleStatusUpdate = async (studentId, newStatus) => {
    if (!isMounted.current) return;
    
    setError(null);
    const timeoutController = createTimeoutController(5000);
    
    try {
      // Check server status before updating
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      }

      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectStatus: newStatus }),
        signal: timeoutController.signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update status: ${response.status} ${response.statusText}`);
      }
      
      if (isMounted.current) {
        setSuccessMessage('Status updated successfully!');
        setTimeout(() => {
          if (isMounted.current) {
            setSuccessMessage('');
          }
        }, 3000);
        
        // Fetch updated data
        fetchStudents();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      
      if (isMounted.current) {
        setError(error.message);
        setTimeout(() => {
          if (isMounted.current) {
            setError(null);
          }
        }, 3000);
      }
    } finally {
      timeoutController.clear();
    }
  };

  // Handler for deleting students
  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?') || !isMounted.current) return;

    setError(null);
    const timeoutController = createTimeoutController(5000);
    
    try {
      // Check server status before deleting
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      }

      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: timeoutController.signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete student: ${response.status} ${response.statusText}`);
      }
      
      if (isMounted.current) {
        setSuccessMessage('Student deleted successfully!');
        setTimeout(() => {
          if (isMounted.current) {
            setSuccessMessage('');
          }
        }, 3000);
        
        // Fetch updated data
        fetchStudents();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      
      if (isMounted.current) {
        setError(error.message);
        setTimeout(() => {
          if (isMounted.current) {
            setError(null);
          }
        }, 3000);
      }
    } finally {
      timeoutController.clear();
    }
  };

  // Loading spinner
  if (loading && serverOnline) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handlers for input changes
  const handleNameChange = (e) => setNewStudent({ ...newStudent, name: e.target.value });
  const handleEnrollmentChange = (e) => setNewStudent({ ...newStudent, enrollmentNo: e.target.value });
  const handleRollNoChange = (e) => setNewStudent({ ...newStudent, rollNo: e.target.value });
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
      
      {/* Server Status */}
      {!serverOnline && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Server Connection Error</p>
          <p>Cannot connect to server. Please check if the server is running at http://localhost:5000</p>
          <button 
            onClick={checkServerStatus}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      )}
      
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
      
      {/* Statistics Section */}
      {statistics && serverOnline && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600">{statistics.totalStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Not Started</h3>
            <p className="text-3xl font-bold text-gray-600">{statistics.statusBreakdown['Not Started'] || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">In Progress</h3>
            <p className="text-3xl font-bold text-blue-600">{statistics.statusBreakdown['In Progress'] || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{statistics.statusBreakdown['Completed'] || 0}</p>
          </div>
        </div>
      )}
      
      {/* Add New Student Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={newStudent.name}
                onChange={handleNameChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting || !serverOnline}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Number
              </label>
              <input
                type="text"
                value={newStudent.enrollmentNo}
                onChange={handleEnrollmentChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting || !serverOnline}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number
              </label>
              <input
                type="text"
                value={newStudent.rollNo}
                onChange={handleRollNoChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting || !serverOnline}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !serverOnline}
            className={`bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors ${
              (isSubmitting || !serverOnline) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Adding...' : 'Add Student'}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name, enrollment, or roll number"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={!serverOnline}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={!serverOnline}
            >
              <option value="">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Students List</h2>
        {serverOnline ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Enrollment No.</th>
                    <th className="px-6 py-3 text-left">Roll No.</th>
                    <th className="px-6 py-3 text-left">Project</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{student.name}</td>
                        <td className="px-6 py-4">{student.enrollmentNo}</td>
                        <td className="px-6 py-4">{student.rollNo}</td>
                        <td className="px-6 py-4">{student.project || 'Not assigned'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            student.projectStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                            student.projectStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {student.projectStatus || 'Not Started'}
                          </span>
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          <select
                            value={student.projectStatus || 'Not Started'}
                            onChange={(e) => handleStatusUpdate(student._id, e.target.value)}
                            className="border rounded p-1 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <button
                            onClick={() => handleDelete(student._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No students found. Add some students to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-red-600">
            <p className="mb-2">Cannot load students data.</p>
            <p>Please check if the server is running at http://localhost:5000</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPage; 