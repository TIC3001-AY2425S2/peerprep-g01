import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthProvider'; // Import AuthContext
import logo from '../assets/images/react-logo.png';
import './Header.css';

export default function Header() {
    const { isLoggedIn, username, logout } = useContext(AuthContext);

    return (
        <nav className="nav-bar">
            <p><a href="/"><img src={logo} alt="logo" height="50" /></a></p>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/QuestionService">Question Service</Link></li>
                <li><Link to="/contact-us">Contact</Link></li>

                {!isLoggedIn ? (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Sign Up</Link></li>
                    </>
                ) : (
                    <>
                        <li>Hello, {username}!</li>
                        <li><button onClick={logout}>Logout</button></li>
                    </>
                )}
            </ul>
        </nav>
    );
}