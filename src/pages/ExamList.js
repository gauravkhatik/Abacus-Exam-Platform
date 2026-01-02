import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import './ExamList.css';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = () => {
    const allExams = dataService.getExams();
    setExams(allExams);
  };

  const handlePublish = (examId) => {
    if (window.confirm('Are you sure you want to publish this exam? It will become visible to students.')) {
      dataService.publishExam(examId);
      loadExams();
    }
  };

  return (
    <div className="exam-list">
      <header className="page-header">
        <button onClick={() => navigate('/admin/dashboard')} className="btn-back">
          ← Back
        </button>
        <h1>Manage Exams</h1>
        <button onClick={() => navigate('/admin/exams/create')} className="btn-primary">
          + Create Exam
        </button>
      </header>
      <div className="content">
        <div className="exams-grid">
          {exams.map((exam) => (
            <div key={exam.id} className="exam-card">
              <div className="exam-header">
                <h3>{exam.name}</h3>
                <span className={`status-badge ${exam.published ? 'published' : 'draft'}`}>
                  {exam.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="exam-info">
                <div className="info-row">
                  <span className="label">Level:</span>
                  <span className="value">{exam.level}</span>
                </div>
                <div className="info-row">
                  <span className="label">Questions:</span>
                  <span className="value">{exam.totalQuestions}</span>
                </div>
                <div className="info-row">
                  <span className="label">Duration:</span>
                  <span className="value">{exam.duration} min</span>
                </div>
                <div className="info-row">
                  <span className="label">Marks per Question:</span>
                  <span className="value">{exam.marksPerQuestion}</span>
                </div>
              </div>
              <div className="exam-actions">
                {!exam.published && (
                  <button
                    onClick={() => handlePublish(exam.id)}
                    className="btn-publish"
                  >
                    Publish
                  </button>
                )}
                <button
                  onClick={() => navigate(`/admin/exams/${exam.id}/report`)}
                  className="btn-view-report"
                >
                  View Report
                </button>
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <div className="empty-state">
              <p>No exams found. Create your first exam.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamList;

