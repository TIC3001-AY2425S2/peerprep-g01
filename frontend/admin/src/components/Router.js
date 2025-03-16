import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthProvider'
import Header from './Header';
import Footer from './Footer';
import Home from '../pages/Home';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import QuestionService from '../pages/QuestionService';

// Layout Component (Shared Header & Footer)
const Layout = () => {
    return (
        <>
            <Header />
            <div className="content"><Outlet /></div>
            <Footer />
        </>
    );
};

// Protected Route Component (Only logged-in users can access)
const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useContext(AuthContext);
    return isLoggedIn ? children : <Navigate to="/login" />;
};

// Browser Routes
export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<SignUp />} />
                    
                    {/* Protected Route Example */}
                    <Route path="QuestionService" element={
                        <ProtectedRoute>
                            <QuestionService />
                        </ProtectedRoute>
                    } />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}