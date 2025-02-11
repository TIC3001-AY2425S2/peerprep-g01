// import React from "react";
// import { Link } from "react-router-dom";

// const Navbar = () => {
//     return (
//         <div>
//             <Link to="/">Home</Link>
//             <Link to="/login">Login</Link>
//         </div>
//     );
// };

// export default Navbar;  

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      }, []);

    const handleLogout = () => {
      localStorage.removeItem("token"); // Remove the JWT token
      setIsLoggedIn(false); // Update the state to reflect logged-out status
      navigate("/login"); // Redirect to the login page
    };

    return (
      <nav className="w-full bg-blue-600 p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-white text-xl font-bold">PeerPrep</h1>
          <div>
            {(() => {
              if (isLoggedIn) {
                return (
                  <button
                    onClick={handleLogout}
                    className="text-white hover:underline"
                  >
                    Logout
                  </button>
                );
              } else {
                return (
                  <Link to="/login" className="text-white hover:underline">Login</Link>
                );
              }
            })()}
          </div>
            <Link to="/about" className="text-white hover:underline">About</Link>
          <div>
          </div>
            <Link to="/contact" className="text-white hover:underline">Contact Us</Link>
          <div>
          </div>
        </div>
      </nav>
    );
  };
  
  export default Navbar;