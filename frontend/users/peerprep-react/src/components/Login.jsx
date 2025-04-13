import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
//import Navbar from "./Navbar";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Both fields are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Invalid credentials");
      const result = await response.json();
      localStorage.setItem("token", result.data.accessToken);
      
      navigate("/"); // Redirect on success
    } catch (err) {
      setError(err.message);
    }
  };

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
          <Link to="/login" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>Sign In</Link>
          <Link to="/about" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>About</Link>
          <Link to="/contact" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>Contact</Link>
          <Link to="/register" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>Sign Up</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 20px"
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          padding: "30px"
        }}>
          <h1 style={{fontSize: "36px",fontWeight: "500",textAlign: "center",marginBottom: "40px",color: "#333"}}>Login</h1>
          
          {error && <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>{error}</p>}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "25px" }}>
              <label style={{display: "block",marginBottom: "8px",color: "#333",fontWeight: "500",fontSize: "18px",textAlign: "left"}}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                  backgroundColor: "white",
                  color: "black",
                  boxSizing: "border-box"
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: "30px" }}>
              <label style={{display: "block",marginBottom: "8px",color: "#333",fontWeight: "500",fontSize: "18px",textAlign: "left"}}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "16px",
                    backgroundColor: "white",
                    color: "black",
                    boxSizing: "border-box"
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}
                >
                  {showPassword ? "👁️" : "👁️"}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#4285f4",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                marginBottom: "25px"
              }}
            >
              Log In
            </button>
            
            <div style={{
              display: "flex",
              justifyContent: "space-between"
            }}>
              <a href="/forgot-password" style={{color: "#4285f4",textDecoration: "none",fontSize: "16px"}}>Forgot Password?</a>
              <a href="/register" style={{color: "#4285f4",textDecoration: "none",fontSize: "16px"}}>Sign Up</a>
            </div>
          </form>
        </div>
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
};

export default Login;

