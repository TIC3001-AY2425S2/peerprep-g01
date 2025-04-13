import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
//import Navbar from "./Navbar";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const registerResponse = await fetch("http://localhost:3001/users ", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!registerResponse.ok) throw new Error("Registration failed");

      const loginResponse = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!loginResponse.ok) throw new Error("Login after registration failed");

      const loginResult = await loginResponse.json();
      localStorage.setItem("token", loginResult.data.accessToken); // Save the JWT token

      navigate("/"); // Redirect to home page after successful login
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
          <Link to="/" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>Home</Link>
          <Link to="/about" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>About</Link>
          <Link to="/contact" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>Contact</Link>
          <Link to="/login" style={{textDecoration: "none",color: "#333",fontWeight: "500"}}>Login</Link>
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
          maxWidth: "450px",
          padding: "30px"
        }}>
          <h1 style={{
            fontSize: "36px",
            fontWeight: "500",
            textAlign: "center",
            marginBottom: "40px",
            color: "#333"
          }}>Register</h1>
          
          {error && <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>{error}</p>}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
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
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{display: "block",marginBottom: "8px",color: "#333",fontWeight: "500",fontSize: "18px",textAlign: "left"}}>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
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
            
            <div style={{ marginBottom: "20px" }}>
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
            
            <div style={{ marginBottom: "30px" }}>
              <label style={{display: "block",marginBottom: "8px",color: "#333",fontWeight: "500",fontSize: "18px",textAlign: "left"}}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? "👁️" : "👁️"}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              style={{width: "100%",padding: "14px",backgroundColor: "#4285f4",color: "white",border: "none",borderRadius: "4px",fontSize: "16px",fontWeight: "500",cursor: "pointer",marginBottom: "20px"}}>
              Register
            </button>
            
            <div style={{
              textAlign: "center"
            }}>
              <span style={{ fontSize: "16px", color: "#333" }}>
                Already have an account?{" "}
                <a href="/login" style={{
                  color: "#4285f4",
                  textDecoration: "none"
                }}>Log in</a>
              </span>
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

export default Register;
