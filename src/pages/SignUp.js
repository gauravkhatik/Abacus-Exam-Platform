import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    level: 1
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if email already exists
    const users = dataService.getUsers();
    if (users.find(u => u.email === formData.email)) {
      setError('Email already exists');
      return;
    }

    const newStudent = dataService.createUser(formData);
    setSuccess(`Student created successfully! Email: ${newStudent.email}, Password: ${newStudent.password}`);
    setFormData({ name: '', email: '', password: '', level: 1 });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Create Student Account</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter student name"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter student email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
            />
          </div>
          <div className="form-group">
            <label>Level</label>
            <input
              type="number"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
              min="1"
              placeholder="Enter level"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">
              {success}
              <div className="copy-buttons">
                <button
                  type="button"
                  onClick={() => copyToClipboard(formData.email || '')}
                  className="btn-copy"
                >
                  Copy Email
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(formData.password || '')}
                  className="btn-copy"
                >
                  Copy Password
                </button>
              </div>
            </div>
          )}
          <button type="submit" className="btn-primary">Create Student</button>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;

