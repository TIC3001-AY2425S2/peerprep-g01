import React, { useState, useContext} from 'react';
import './LoginPage.css';
// import bcrypt from 'bcryptjs'
import { useNavigate } from 'react-router-dom';
import AuthContext from "../context/AuthProvider";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
     
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        try {
            const response = await fetch("http://localhost:3001/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                const err = data?.message || "Unknown error";
                console.error("Login failed:", err);
                alert(`Login failed: ${err}`);
                return;
            }
    
            console.log("Login successful:", data);
            login(data.data?.username, data.data?.accessToken);

            localStorage.setItem("username", data.data?.username)
            localStorage.setItem("token", data.data?.accessToken); // Store token
            
            alert("You have logged in successfully");
            navigate("/");
        } catch (error) {
            console.error("Error during login:", error.message);
            alert("Error during login: " + error.message);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="login-form">
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
                <button type="submit" className="submit-btn">Login</button>
            </form>
            <p className="signup-link">
                Don't have an account? <a href="/signup">Sign up</a>
            </p>
        </div>
    );
};

export default LoginPage;