import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import MainLayout from '@layouts/MainLayout';
import ProtectedRoute from '@components/ProtectedRoute';
import LoadingSpinner from '@components/LoadingSpinner';

// Lazy-loaded pages for better performance
const HomePage = lazy(() => import('@pages/HomePage'));
const LoginPage = lazy(() => import('@pages/LoginPage'));
const RegisterPage = lazy(() => import('@pages/RegisterPage'));
const TeacherDashboard = lazy(() => import('@pages/TeacherDashboard'));
const StudentDashboard = lazy(() => import('@pages/StudentDashboard'));
const ProjectDetailsPage = lazy(() => import('@pages/ProjectDetailsPage'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="flex h-screen justify-center items-center"><LoadingSpinner size="large" /></div>}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="teacher" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="projects/:id" element={
              <ProtectedRoute allowedRoles={['teacher', 'student']}>
                <ProjectDetailsPage />
              </ProtectedRoute>
            } />
            
            {/* Fallback routes */}
            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App; 