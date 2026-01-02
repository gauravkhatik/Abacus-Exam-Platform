import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './StudentReport.css';

const StudentReport = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [strengthWeakness, setStrengthWeakness] = useState(null);

  useEffect(() => {
    loadReport();
  }, [examId, user]);

  const loadReport = () => {
    const examData = dataService.getExamById(examId);
    const attemptData = dataService.getAttemptByStudentAndExam(user.id, examId);

    if (!examData || !attemptData || !attemptData.submitted) {
      alert('Report not found');
      navigate('/student/dashboard');
      return;
    }

    setExam(examData);
    setAttempt(attemptData);

    // Calculate strength vs weakness by question type
    const typeStats = {};
    examData.questions.forEach((q, index) => {
      const type = q.type;
      if (!typeStats[type]) {
        typeStats[type] = { correct: 0, total: 0 };
      }
      typeStats[type].total++;
      if (attemptData.questionResults[index]?.isCorrect) {
        typeStats[type].correct++;
      }
    });

    const sw = {};
    Object.keys(typeStats).forEach(type => {
      const stats = typeStats[type];
      sw[type] = Math.round((stats.correct / stats.total) * 100);
    });

    setStrengthWeakness(sw);
  };

  if (!exam || !attempt) {
    return <div className="loading">Loading report...</div>;
  }

  const pieData = [
    { name: 'Correct', value: attempt.correctCount, color: '#4caf50' },
    { name: 'Wrong', value: attempt.wrongCount, color: '#e74c3c' }
  ];

  const avgTimePerQuestion = attempt.totalTime / exam.questions.length;

  const getTypeName = (type) => {
    if (type === 'addition_subtraction') return 'Addition/Subtraction';
    if (type === 'multiplication') return 'Multiplication';
    if (type === 'division') return 'Division';
    return type;
  };

  return (
    <div className="student-report">
      <header className="report-header">
        <button onClick={() => navigate('/student/dashboard')} className="btn-back">
          ← Back to My Exams
        </button>
        <h1>Exam Report: {exam.name}</h1>
      </header>
      <div className="report-content">
        <div className="overview-section">
          <h2>Overview</h2>
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
            <h3>Correct vs Wrong</h3>
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
          <h2>Question-wise Review</h2>
          <div className="questions-table">
            <table>
              <thead>
                <tr>
                  <th>Q#</th>
                  <th>Question</th>
                  <th>Your Answer</th>
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
          <h2>Strength vs Weakness Summary</h2>
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
  );
};

export default StudentReport;

