import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>
      <div className="dashboard-content">
        <div className="dashboard-menu">
          <div className="menu-card" onClick={() => navigate('/admin/students')}>
            <h2>Student Management</h2>
            <p>Create, enable/disable, and manage student accounts</p>
          </div>
          <div className="menu-card" onClick={() => navigate('/admin/exams/create')}>
            <h2>Create Exam</h2>
            <p>Create new exams with custom question types</p>
          </div>
          <div className="menu-card" onClick={() => navigate('/admin/exams')}>
            <h2>Manage Exams</h2>
            <p>View, publish, and manage all exams</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

