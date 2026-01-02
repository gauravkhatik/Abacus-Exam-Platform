import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './AdminReport.css';

const AdminReport = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadReport();
  }, [examId]);

  const loadReport = () => {
    const examData = dataService.getExamById(examId);
    if (!examData) {
      alert('Exam not found');
      navigate('/admin/exams');
      return;
    }

    setExam(examData);
    const examAttempts = dataService.getAttemptsByExam(examId);
    setAttempts(examAttempts);
  };

  const handleStudentClick = (attempt) => {
    setSelectedStudent(attempt);
  };

  const closeStudentDetail = () => {
    setSelectedStudent(null);
  };

  if (!exam) {
    return <div className="loading">Loading report...</div>;
  }

  const overallStats = attempts.reduce((acc, attempt) => {
    acc.totalAttempted += attempt.correctCount + attempt.wrongCount;
    acc.totalCorrect += attempt.correctCount;
    acc.totalWrong += attempt.wrongCount;
    acc.totalMarks += attempt.marksObtained;
    acc.totalTime += attempt.totalTime;
    return acc;
  }, { totalAttempted: 0, totalCorrect: 0, totalWrong: 0, totalMarks: 0, totalTime: 0 });

  const avgMarks = attempts.length > 0 ? (overallStats.totalMarks / attempts.length).toFixed(2) : 0;
  const avgTime = attempts.length > 0 ? Math.round(overallStats.totalTime / attempts.length / exam.questions.length) : 0;

  const pieData = [
    { name: 'Correct', value: overallStats.totalCorrect, color: '#4caf50' },
    { name: 'Wrong', value: overallStats.totalWrong, color: '#e74c3c' }
  ];

  return (
    <div className="admin-report">
      <header className="report-header">
        <button onClick={() => navigate('/admin/exams')} className="btn-back">
          ← Back
        </button>
        <h1>Exam Report: {exam.name}</h1>
      </header>
      <div className="report-content">
        <div className="overview-section">
          <h2>Overall Statistics</h2>
          <div className="overview-grid">
            <div className="stat-card">
              <div className="stat-label">Students Appeared</div>
              <div className="stat-value">{attempts.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Attempted Questions</div>
              <div className="stat-value">{overallStats.totalAttempted}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average Marks</div>
              <div className="stat-value">{avgMarks} / {exam.questions.length * exam.marksPerQuestion}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average Time per Question</div>
              <div className="stat-value">{avgTime}s</div>
            </div>
          </div>
          <div className="pie-chart-container">
            <h3>Overall Correct vs Wrong</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="students-section">
          <h2>Students List</h2>
          <div className="students-table">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Attempted</th>
                  <th>Correct vs Wrong</th>
                  <th>Marks Obtained</th>
                  <th>Avg Time/Question</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => {
                  const student = dataService.getUserById(attempt.studentId);
                  const studentPieData = [
                    { name: 'Correct', value: attempt.correctCount, color: '#4caf50' },
                    { name: 'Wrong', value: attempt.wrongCount, color: '#e74c3c' }
                  ];
                  return (
                    <tr key={attempt.id}>
                      <td>{student?.name || 'Unknown'}</td>
                      <td>{student?.email || 'Unknown'}</td>
                      <td>{attempt.correctCount + attempt.wrongCount} / {exam.questions.length}</td>
                      <td>
                        <div className="mini-pie">
                          <ResponsiveContainer width={60} height={60}>
                            <PieChart>
                              <Pie
                                data={studentPieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={25}
                                dataKey="value"
                              >
                                {studentPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </td>
                      <td>{attempt.marksObtained} / {exam.questions.length * exam.marksPerQuestion}</td>
                      <td>{Math.round(attempt.totalTime / exam.questions.length)}s</td>
                      <td>
                        <button
                          onClick={() => handleStudentClick(attempt)}
                          className="btn-view-detail"
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <StudentDetailModal
          exam={exam}
          attempt={selectedStudent}
          onClose={closeStudentDetail}
        />
      )}
    </div>
  );
};

const StudentDetailModal = ({ exam, attempt, onClose }) => {
  const student = dataService.getUserById(attempt.studentId);

  const pieData = [
    { name: 'Correct', value: attempt.correctCount, color: '#4caf50' },
    { name: 'Wrong', value: attempt.wrongCount, color: '#e74c3c' }
  ];

  const avgTimePerQuestion = attempt.totalTime / exam.questions.length;

  // Calculate strength vs weakness
  const typeStats = {};
  exam.questions.forEach((q, index) => {
    const type = q.type;
    if (!typeStats[type]) {
      typeStats[type] = { correct: 0, total: 0 };
    }
    typeStats[type].total++;
    if (attempt.questionResults[index]?.isCorrect) {
      typeStats[type].correct++;
    }
  });

  const strengthWeakness = {};
  Object.keys(typeStats).forEach(type => {
    const stats = typeStats[type];
    strengthWeakness[type] = Math.round((stats.correct / stats.total) * 100);
  });

  const getTypeName = (type) => {
    if (type === 'addition_subtraction') return 'Addition/Subtraction';
    if (type === 'multiplication') return 'Multiplication';
    if (type === 'division') return 'Division';
    return type;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detailed Report: {student?.name}</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>
        <div className="modal-body">
          <div className="overview-section">
            <h3>Overview</h3>
            <div className="overview-grid">
              <div className="stat-card">
                <div className="stat-label">Total Questions</div>
                <div className="stat-value">{exam.questions.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Attempted Questions</div>
                <div className="stat-value">{attempt.correctCount + attempt.wrongCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Marks Obtained</div>
                <div className="stat-value">{attempt.marksObtained} / {exam.questions.length * exam.marksPerQuestion}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Average Time per Question</div>
                <div className="stat-value">{Math.round(avgTimePerQuestion)}s</div>
              </div>
            </div>
            <div className="pie-chart-container">
              <h4>Correct vs Wrong</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="question-review-section">
            <h3>Question-wise Review</h3>
            <div className="questions-table">
              <table>
                <thead>
                  <tr>
                    <th>Q#</th>
                    <th>Question</th>
                    <th>Student Answer</th>
                    <th>Correct Answer</th>
                    <th>Time Taken</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.questions.map((question, index) => {
                    const result = attempt.questionResults[index];
                    return (
                      <tr key={index} className={result?.isCorrect ? 'correct' : 'wrong'}>
                        <td>{index + 1}</td>
                        <td className="question-cell">
                          {question.type === 'addition_subtraction' && (
                            <div className="question-preview">
                              {question.numbers.map((n, i) => (
                                <div key={i}>{i === 0 ? '+' : n >= 0 ? '+' : ''}{n}</div>
                              ))}
                            </div>
                          )}
                          {question.type === 'multiplication' && (
                            <div className="question-preview">{question.num1} × {question.num2}</div>
                          )}
                          {question.type === 'division' && (
                            <div className="question-preview">{question.dividend} ÷ {question.divisor}</div>
                          )}
                        </td>
                        <td>{result?.selectedOption || 'Not answered'}</td>
                        <td>{result?.correctOption}</td>
                        <td>{result?.timeTaken || 0}s</td>
                        <td>
                          <span className={`result-badge ${result?.isCorrect ? 'correct' : 'wrong'}`}>
                            {result?.isCorrect ? '✓ Correct' : '✗ Wrong'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="strength-weakness-section">
            <h3>Strength vs Weakness Summary</h3>
            <div className="sw-grid">
              {Object.entries(strengthWeakness).map(([type, accuracy]) => (
                <div key={type} className="sw-card">
                  <div className="sw-type">{getTypeName(type)}</div>
                  <div className="sw-accuracy">{accuracy}% accuracy</div>
                  <div className="sw-bar">
                    <div
                      className="sw-bar-fill"
                      style={{ width: `${accuracy}%`, background: accuracy >= 70 ? '#4caf50' : accuracy >= 50 ? '#ff9800' : '#e74c3c' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReport;

