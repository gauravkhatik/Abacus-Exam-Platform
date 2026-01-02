import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import './StudentManagement.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const allStudents = dataService.getStudents();
    setStudents(allStudents);
  };

  const toggleStudentStatus = (id, currentStatus) => {
    dataService.updateUser(id, { enabled: !currentStatus });
    loadStudents();
  };

  const updateStudentLevel = (id, newLevel) => {
    dataService.updateUser(id, { level: parseInt(newLevel) });
    loadStudents();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="student-management">
      <header className="page-header">
        <button onClick={() => navigate('/admin/dashboard')} className="btn-back">
          ← Back
        </button>
        <h1>Student Management</h1>
        <button onClick={() => navigate('/signup')} className="btn-primary">
          + Create Student
        </button>
      </header>
      <div className="content">
        <div className="students-grid">
          {students.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-header">
                <h3>{student.name}</h3>
                <span className={`status-badge ${student.enabled ? 'enabled' : 'disabled'}`}>
                  {student.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="student-info">
                <div className="info-item">
                  <strong>Email:</strong> {student.email}
                  <button
                    onClick={() => copyToClipboard(student.email)}
                    className="btn-copy-small"
                    title="Copy email"
                  >
                    📋
                  </button>
                </div>
                <div className="info-item">
                  <strong>Password:</strong> {student.password}
                  <button
                    onClick={() => copyToClipboard(student.password)}
                    className="btn-copy-small"
                    title="Copy password"
                  >
                    📋
                  </button>
                </div>
                <div className="info-item">
                  <strong>Level:</strong>
                  <select
                    value={student.level}
                    onChange={(e) => updateStudentLevel(student.id, e.target.value)}
                    className="level-select"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="student-actions">
                <button
                  onClick={() => toggleStudentStatus(student.id, student.enabled)}
                  className={`btn-toggle ${student.enabled ? 'btn-disable' : 'btn-enable'}`}
                >
                  {student.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="empty-state">
              <p>No students found. Create your first student account.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;

