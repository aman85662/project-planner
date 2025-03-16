import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  HiUser, 
  HiCalendar, 
  HiClipboardCheck, 
  HiPencil, 
  HiTrash, 
  HiPlus, 
  HiX,
  HiCheck,
  HiArrowLeft,
  HiClock,
  HiChatAlt,
  HiDocumentText,
  HiExclamation
} from 'react-icons/hi';
import { projectAPI, studentAPI } from '@services/api';
import LoadingSpinner from '@components/LoadingSpinner';
import { useAuth } from '@context/AuthContext';

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editableProject, setEditableProject] = useState(null);
  
  // State for milestones
  const [newMilestone, setNewMilestone] = useState('');
  
  // State for comments
  const [commentText, setCommentText] = useState('');
  
  // State for student assignments
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  
  // Fetch project data
  const { 
    data: projectData, 
    isLoading: projectLoading, 
    error: projectError,
    refetch: refetchProject
  } = useQuery(
    ['project', projectId], 
    () => projectAPI.getById(projectId).then(res => res.data),
    {
      enabled: !!projectId,
      onSuccess: (data) => {
        if (data) {
          setEditableProject(data);
          // Initialize selected students
          if (data.students) {
            setSelectedStudentIds(data.students.map(student => student._id));
          }
        }
      }
    }
  );
  
  // Fetch available students (for teacher assignment)
  const { 
    data: studentsData, 
    isLoading: studentsLoading 
  } = useQuery(
    ['students'], 
    () => studentAPI.getAll().then(res => res.data),
    {
      enabled: user?.role === 'teacher',
    }
  );
  
  // Mutation to update project
  const updateProjectMutation = useMutation(
    (updatedProject) => projectAPI.update(projectId, updatedProject),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', projectId]);
        setIsEditing(false);
      }
    }
  );
  
  // Mutation to delete project
  const deleteProjectMutation = useMutation(
    () => projectAPI.remove(projectId),
    {
      onSuccess: () => {
        navigate('/projects');
      }
    }
  );
  
  // Mutation to add a comment
  const addCommentMutation = useMutation(
    (comment) => projectAPI.addComment(projectId, comment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', projectId]);
        setCommentText('');
      }
    }
  );
  
  // Mutation to toggle milestone completion
  const toggleMilestoneMutation = useMutation(
    ({ milestoneId, completed }) => 
      projectAPI.updateMilestone(projectId, milestoneId, { completed }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', projectId]);
      }
    }
  );
  
  // Mutation to add milestone
  const addMilestoneMutation = useMutation(
    (title) => projectAPI.addMilestone(projectId, { title }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', projectId]);
        setNewMilestone('');
      }
    }
  );
  
  // Mutation to delete milestone
  const deleteMilestoneMutation = useMutation(
    (milestoneId) => projectAPI.deleteMilestone(projectId, milestoneId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', projectId]);
      }
    }
  );
  
  // Mutation to update students
  const updateStudentsMutation = useMutation(
    (studentIds) => projectAPI.updateStudents(projectId, { studentIds }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', projectId]);
        setShowStudentSelector(false);
      }
    }
  );
  
  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditableProject(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle edit submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateProjectMutation.mutate(editableProject);
  };
  
  // Handle project delete confirmation
  const handleDeleteConfirm = () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProjectMutation.mutate();
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      addCommentMutation.mutate({ text: commentText });
    }
  };
  
  // Handle milestone toggle
  const handleMilestoneToggle = (milestoneId, currentStatus) => {
    toggleMilestoneMutation.mutate({ 
      milestoneId, 
      completed: !currentStatus 
    });
  };
  
  // Handle add milestone
  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (newMilestone.trim()) {
      addMilestoneMutation.mutate(newMilestone);
    }
  };
  
  // Handle delete milestone
  const handleDeleteMilestone = (milestoneId) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      deleteMilestoneMutation.mutate(milestoneId);
    }
  };
  
  // Handle student selection
  const handleStudentToggle = (studentId) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };
  
  // Handle student assignment save
  const handleStudentAssignmentSave = () => {
    updateStudentsMutation.mutate(selectedStudentIds);
  };
  
  // Derived variables
  const isTeacher = user?.role === 'teacher';
  const project = projectData || {};
  const students = studentsData?.students || [];
  const completedMilestones = project.milestones?.filter(m => m.completed)?.length || 0;
  const totalMilestones = project.milestones?.length || 0;
  const milestonePercentage = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : 0;
    
  // Calculate days left
  const calculateDaysLeft = () => {
    if (!project.deadline) return null;
    
    const deadline = new Date(project.deadline);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const daysLeft = calculateDaysLeft();
  const isOverdue = daysLeft < 0;
  const isDueSoon = daysLeft >= 0 && daysLeft <= 3;
  
  // Loading state
  if (projectLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // Error state
  if (projectError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p className="font-bold">Error</p>
        <p>Failed to load project details. Please try refreshing the page.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <HiArrowLeft className="mr-2" /> Back to Projects
        </button>
      </div>
      
      {/* Project Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{project.title}</h1>
          <div className="flex flex-wrap gap-4 mt-2">
            <span className="inline-flex items-center text-sm text-gray-600">
              <HiCalendar className="mr-1" /> 
              {new Date(project.deadline).toLocaleDateString()}
              {daysLeft !== null && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  isOverdue 
                    ? 'bg-red-100 text-red-800' 
                    : isDueSoon 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {isOverdue 
                    ? `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} overdue` 
                    : daysLeft === 0 
                      ? 'Due today' 
                      : daysLeft === 1 
                        ? 'Due tomorrow' 
                        : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                </span>
              )}
            </span>
            <span className={`inline-flex items-center text-sm px-2 py-0.5 rounded-full
              ${project.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                'bg-yellow-100 text-yellow-800'}`}
            >
              {project.status}
            </span>
          </div>
        </div>
        
        {isTeacher && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary inline-flex items-center"
            >
              <HiPencil className="mr-2" /> Edit Project
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="btn-danger inline-flex items-center"
            >
              <HiTrash className="mr-2" /> Delete
            </button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        /* Edit Project Form */
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Project</h2>
          <form onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editableProject.title}
                  onChange={handleEditChange}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={editableProject.deadline ? new Date(editableProject.deadline).toISOString().split('T')[0] : ''}
                  onChange={handleEditChange}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={editableProject.status}
                  onChange={handleEditChange}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editableProject.description}
                  onChange={handleEditChange}
                  rows={4}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={updateProjectMutation.isLoading}
              >
                {updateProjectMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Project Details */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Project Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <HiDocumentText className="mr-2" /> Project Description
              </h2>
              <div className="prose prose-sm max-w-none">
                {project.description ? (
                  <p>{project.description}</p>
                ) : (
                  <p className="text-gray-500 italic">No description provided.</p>
                )}
              </div>
            </div>
            
            {/* Milestones */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <HiClipboardCheck className="mr-2" /> 
                  Milestones
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({completedMilestones}/{totalMilestones})
                  </span>
                </h2>
                <div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 rounded-full bg-primary-500"
                      style={{ width: `${milestonePercentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {milestonePercentage}% complete
                  </span>
                </div>
              </div>
              
              {project.milestones && project.milestones.length > 0 ? (
                <ul className="space-y-3">
                  {project.milestones.map((milestone) => (
                    <li key={milestone._id} className="flex items-start gap-3">
                      <button
                        onClick={() => handleMilestoneToggle(milestone._id, milestone.completed)}
                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border ${
                          milestone.completed
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'border-gray-300'
                        } flex items-center justify-center`}
                        disabled={!isTeacher && project.status === 'Completed'}
                      >
                        {milestone.completed && <HiCheck className="h-4 w-4" />}
                      </button>
                      <span className={`flex-grow ${milestone.completed ? 'line-through text-gray-500' : ''}`}>
                        {milestone.title}
                        <span className="text-xs text-gray-500 ml-2">
                          {milestone.updatedAt && milestone.completed && 
                            `Completed on ${new Date(milestone.updatedAt).toLocaleDateString()}`}
                        </span>
                      </span>
                      {isTeacher && (
                        <button
                          onClick={() => handleDeleteMilestone(milestone._id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <HiX />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No milestones added yet.</p>
              )}
              
              {/* Add Milestone Form (teachers only or students if project is not completed) */}
              {(isTeacher || (user?.role === 'student' && project.status !== 'Completed')) && (
                <form onSubmit={handleAddMilestone} className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      placeholder="Add a new milestone..."
                      className="block flex-grow py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="submit"
                      className="btn-primary inline-flex items-center"
                      disabled={!newMilestone.trim() || addMilestoneMutation.isLoading}
                    >
                      <HiPlus className="mr-1" /> Add
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            {/* Comments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <HiChatAlt className="mr-2" /> Comments
              </h2>
              
              {project.comments && project.comments.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {project.comments.map((comment) => (
                    <div key={comment._id} className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mr-2">
                            {comment.author.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{comment.author.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {comment.author.role === 'teacher' ? 'Teacher' : 'Student'}
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic mb-6">No comments yet.</p>
              )}
              
              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="border-t border-gray-200 pt-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 mb-2"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!commentText.trim() || addCommentMutation.isLoading}
                  >
                    {addCommentMutation.isLoading ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div>
            {/* Project Progress */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <HiClock className="mr-2" /> Progress
              </h2>
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div 
                    className={`h-4 rounded-full ${
                      project.progress >= 100 ? 'bg-green-500' : 
                      project.progress > 50 ? 'bg-primary-500' : 
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>{project.progress || 0}%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium ${
                    project.status === 'Completed' ? 'text-green-600' : 
                    project.status === 'In Progress' ? 'text-blue-600' : 
                    'text-yellow-600'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <span className="text-sm">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                
                {daysLeft !== null && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time Remaining:</span>
                    <span className={`text-sm font-medium ${
                      isOverdue ? 'text-red-600' : 
                      isDueSoon ? 'text-orange-600' : 
                      'text-green-600'
                    }`}>
                      {isOverdue 
                        ? `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} overdue` 
                        : daysLeft === 0 
                          ? 'Due today' 
                          : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Assigned Students */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <HiUser className="mr-2" /> Assigned Students
                </h2>
                {isTeacher && (
                  <button
                    onClick={() => setShowStudentSelector(!showStudentSelector)}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    {showStudentSelector ? 'Cancel' : 'Edit'}
                  </button>
                )}
              </div>
              
              {showStudentSelector ? (
                /* Student Selection UI */
                <div>
                  {studentsLoading ? (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner size="small" />
                    </div>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto mb-4">
                        {students.length > 0 ? (
                          <ul className="space-y-2">
                            {students.map(student => (
                              <li key={student._id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`student-${student._id}`}
                                  checked={selectedStudentIds.includes(student._id)}
                                  onChange={() => handleStudentToggle(student._id)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label 
                                  htmlFor={`student-${student._id}`}
                                  className="ml-2 block text-sm text-gray-900"
                                >
                                  {student.name}
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({student.enrollmentNumber})
                                  </span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">No students available.</p>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={handleStudentAssignmentSave}
                          className="btn-primary"
                          disabled={updateStudentsMutation.isLoading}
                        >
                          {updateStudentsMutation.isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Students List */
                <div>
                  {project.students && project.students.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {project.students.map(student => (
                        <li key={student._id} className="py-3 flex items-start">
                          <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{student.name}</h3>
                            <p className="text-xs text-gray-500">
                              Enrollment: {student.enrollmentNumber}
                              {student.rollNumber && ` | Roll No: ${student.rollNumber}`}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">
                      {isTeacher 
                        ? 'No students assigned yet. Click Edit to assign students.' 
                        : 'No students assigned to this project.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage; 