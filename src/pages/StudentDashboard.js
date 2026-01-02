import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);

  useEffect(() => {
    loadExams();
  }, [user]);

  const loadExams = () => {
    if (user && user.level) {
      const publishedExams = dataService.getPublishedExamsForLevel(user.level);
      const examsWithStatus = publishedExams.map(exam => {
        const attempt = dataService.getAttemptByStudentAndExam(user.id, exam.id);
        return {
          ...exam,
          status: attempt ? (attempt.submitted ? 'completed' : 'in-progress') : 'not-started',
          attemptId: attempt?.id
        };
      });
      setExams(examsWithStatus);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStartExam = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  const handleViewReport = (examId) => {
    navigate(`/student/exam/${examId}/report`);
  };

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <h1>My Exams</h1>
        <div className="header-actions">
          <span>Welcome, {user?.name} (Level {user?.level})</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>
      <div className="dashboard-content">
        <div className="exams-grid">
          {exams.map((exam) => (
            <div key={exam.id} className="exam-card">
              <div className="exam-header">
                <h3>{exam.name}</h3>
                <span className={`status-badge ${exam.status}`}>
                  {exam.status === 'not-started' && 'Not Started'}
                  {exam.status === 'in-progress' && 'In Progress'}
                  {exam.status === 'completed' && 'Completed'}
                </span>
              </div>
              <div className="exam-info">
                <div className="info-item">
                  <span className="label">Level:</span>
                  <span className="value">{exam.level}</span>
                </div>
                <div className="info-item">
                  <span className="label">Duration:</span>
                  <span className="value">{exam.duration} min</span>
                </div>
                <div className="info-item">
                  <span className="label">Total Questions:</span>
                  <span className="value">{exam.totalQuestions}</span>
                </div>
              </div>
              <div className="exam-actions">
                {exam.status === 'not-started' && (
                  <button
                    onClick={() => handleStartExam(exam.id)}
                    className="btn-start"
                  >
                    Start Exam
                  </button>
                )}
                {exam.status === 'completed' && (
                  <button
                    onClick={() => handleViewReport(exam.id)}
                    className="btn-view-report"
                  >
                    View Report
                  </button>
                )}
                {exam.status === 'in-progress' && (
                  <button
                    onClick={() => handleStartExam(exam.id)}
                    className="btn-continue"
                  >
                    Continue Exam
                  </button>
                )}
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <div className="empty-state">
              <p>No exams available for your level. Please contact your administrator.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

