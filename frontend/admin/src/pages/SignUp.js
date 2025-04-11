import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SignUpPage.css';
// import userService from '../services/user-service';
// import bcrypt from 'bcryptjs'
import { useNavigate } from 'react-router-dom';
const SignUpPage = () => {
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate(); 

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/users');
      setUsers(response.data.data);
      console.log(response.data.data);
    }
    catch (error) {
      console.error("Error fetching questions", error);
    }
  };

    useEffect(() => {
      fetchUsers();
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !username || !password) {
        setErrorMessage("Email, username, and password are required");
        return;
    }

    if (password.length <8) {
      alert("Password length must be more than 8");
      return;
    }
    
    const foundUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
        alert("Email is taken");
        return;
    }
    
    const foundUsername = users.find(user => user.username.toLowerCase() === username.toLowerCase());
    if (foundUsername) {
        alert("Username is taken");
        return;
    }

    try {
      const response = await axios.post("http://localhost:3001/users", {
        username,
        email,
        password,
      });

      console.log(response)

      alert("Signup successful!");
      navigate("/login"); // Redirect user after signup
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Signup failed!");
    }
  

  }

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-btn">Sign Up</button>
      </form>
      <p className="login-link">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default SignUpPage;