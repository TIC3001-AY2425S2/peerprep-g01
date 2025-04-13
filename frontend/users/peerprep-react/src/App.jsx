import './App.css'
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Match from './components/Match.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        <div style={{
          fontFamily: "'Poppins', sans-serif",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}>
          {/* Header */}
          <header style={{
            backgroundColor: "white",
            padding: "15px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #eee"
          }}>
            <Link to="/" style={{fontSize: "30px",fontWeight: "bold",textDecoration: "none",color: "#333"}}>PeerPrep</Link>
            <nav style={{display: "flex",gap: "25px"}}>
              <Link to="/" onClick={() => {localStorage.removeItem("token");setIsLoggedIn(false);}}
                style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>
                Logout
              </Link>

              <Link to="/about" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>About</Link>
              <Link to="/contact" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>Contact Us</Link>
            </nav>
          </header>

          {/* Main Content */}
          <main style={{
            flex: 1,
            backgroundColor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 20px"
          }}>
            <Match />
          </main>
          
          <footer style={{
            backgroundColor: "#ffffff",
            textAlign: "center",
            padding: "10px",
            color: "#777",
            fontSize: "14px",
            borderTop: "1px solid #eee"
          }}>
            © 2025 PeerPrep. All rights reserved.
          </footer>
        </div>
      );
    } else {
      return (
        <div style={{
          fontFamily: "'Poppins', sans-serif",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}>
          {/* Header */}
          <header style={{
            backgroundColor: "white",
            padding: "15px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #eee"
          }}>
            <Link to="/" style={{fontSize: "30px",fontWeight: "bold",textDecoration: "none",color: "#333"}}>PeerPrep</Link>
            <nav style={{display: "flex",gap: "25px"}}>
              <Link to="/login" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>Login</Link>
              <Link to="/about" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>About</Link>
              <Link to="/contact" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>Contact Us</Link>
            </nav>
          </header>

          {/* Main Content */}
          <main style={{
            flex: 1,
            backgroundColor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 20px"
          }}>
            <h1 style={{fontSize: "48px",fontWeight: "600",marginBottom: "20px",color: "#333",textAlign: "center"}}>Welcome to PeerPrep</h1>
          </main>
          
          <footer style={{backgroundColor: "#ffffff",textAlign: "center",padding: "10px",color: "#777",fontSize: "14px",borderTop: "1px solid #eee"}}>
            © 2025 PeerPrep. All rights reserved.
          </footer>
        </div>
      );
    }
}

export default App
