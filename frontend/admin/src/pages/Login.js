import React, { useState, useContext} from 'react';
import './LoginPage.css';
// import bcrypt from 'bcryptjs'
import { useNavigate } from 'react-router-dom';
import AuthContext from "../context/AuthProvider";

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
     
        if (!username || !password) {
            
            return;
            
        }
        try {
            const response = await fetch("http://localhost:3001/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
    
            
            const data = await response.json();
    
            if (!response.ok) {
                const err = data?.message || "Unknown error";
                console.error("Login failed:", err);
                alert(`Login failed: ${err}`);
                return;
            }
    
            console.log("Login successful:", data);
            login(username, data.data?.accessToken);

            localStorage.setItem("username", data.data?.username)
            localStorage.setItem("token", data.data?.accessToken); // Store token
    
        } catch (error) {
            console.error("Error during login:", error.message);
        }

        alert("You have logged in successfully");

        console.log('Logging in with', { username, password });
        navigate("/");
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="login-form">
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