import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentManagement from './pages/StudentManagement';
import ExamCreation from './pages/ExamCreation';
import ExamList from './pages/ExamList';
import ExamConsole from './pages/ExamConsole';
import StudentReport from './pages/StudentReport';
import AdminReport from './pages/AdminReport';
import './App.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 1 ? "/admin/dashboard" : "/student/dashboard"} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/signup" 
            element={
              <PrivateRoute allowedRoles={[1]}>
                <SignUp />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <PrivateRoute allowedRoles={[1]}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/students" 
            element={
              <PrivateRoute allowedRoles={[1]}>
                <StudentManagement />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/exams/create" 
            element={
              <PrivateRoute allowedRoles={[1]}>
                <ExamCreation />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/exams" 
            element={
              <PrivateRoute allowedRoles={[1]}>
                <ExamList />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/exams/:examId/report" 
            element={
              <PrivateRoute allowedRoles={[1]}>
                <AdminReport />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/dashboard" 
            element={
              <PrivateRoute allowedRoles={[2]}>
                <StudentDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/exam/:examId" 
            element={
              <PrivateRoute allowedRoles={[2]}>
                <ExamConsole />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/exam/:examId/report" 
            element={
              <PrivateRoute allowedRoles={[2]}>
                <StudentReport />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

