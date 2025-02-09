import './App.css'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './components/Navbar.jsx';
import Match from './components/Match.jsx';

function App() {
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

    if (isLoggedIn) {
      return (
        <>
          <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          <Match />
        </>
      );
    } else {
      return (
        <>
          <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          <h1>Welcome to PeerPrep</h1>
        </>
      );
    }
}

export default App
