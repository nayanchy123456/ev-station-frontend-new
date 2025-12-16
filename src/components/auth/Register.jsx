import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../css/register.css";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER"); // default role
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const navigate = useNavigate();

  // Validate Nepal phone number format
  const validatePhone = (value) => {
    if (!value) {
      setPhoneError("");
      return;
    }

    // Remove all non-digits except + at the start
    const cleaned = value.replace(/\D/g, "");
    
    if (!cleaned) {
      setPhoneError("");
      return;
    }
    
    // Extract just the 10 digits (remove country code if present)
    let lastTenDigits = cleaned;
    if (cleaned.startsWith("977")) {
      lastTenDigits = cleaned.substring(3);
    }
    
    // Validate length
    if (lastTenDigits.length !== 10) {
      setPhoneError(`Phone must be exactly 10 digits (currently ${lastTenDigits.length})`);
      return;
    }
    
    // Validate starting digit (must be 8 or 9 for Nepal mobile)
    if (!["8", "9"].includes(lastTenDigits[0])) {
      setPhoneError("Phone must start with 8 or 9");
      return;
    }
    
    setPhoneError("");
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    validatePhone(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // Final validation before submit
    if (phoneError) {
      setError("Please fix the phone number error");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    try {
      const res = await api.post("/auth/register", { firstName, lastName, email, phone, password, role });
      console.log("Register response:", res.data);

      const { role: userRole, message } = res.data;

      if (userRole === "PENDING_HOST") {
        setSuccessMsg(message || "Your host registration is pending admin approval.");
        // Clear form
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setRole("USER");
        return;
      }

      setSuccessMsg(message || "Registration successful! Please login.");
      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("USER");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-card">
      <h2>Register</h2>

      {error && <p className="register-error">{error}</p>}
      {successMsg && <p className="register-success">{successMsg}</p>}

      <form onSubmit={handleSubmit}>
        <div className="register-input-container">
          <input 
            type="text" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            placeholder=" " 
            required 
          />
          <label>First Name</label>
        </div>

        <div className="register-input-container">
          <input 
            type="text" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            placeholder=" " 
            required 
          />
          <label>Last Name</label>
        </div>

        <div className="register-input-container">
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder=" " 
            required 
          />
          <label>Email</label>
        </div>

        <div className="register-input-container">
          <input 
            type="tel" 
            value={phone} 
            onChange={handlePhoneChange}
            placeholder=" " 
            pattern="^[8-9]\d{9}$|^\+?977[8-9]\d{9}$|^977[8-9]\d{9}$"
            title="Phone must be 10 digits starting with 8 or 9 (Nepal format)"
            required 
          />
          <label>Phone Number (Nepal - 10 digits)</label>
          {phoneError && <p className="phone-error-message" style={{ color: "#dc3545", fontSize: "0.85rem", marginTop: "0.25rem" }}>{phoneError}</p>}
        </div>

        <div className="register-input-container">
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder=" " 
            required 
          />
          <label>Password</label>
        </div>

        {/* Role select */}
        <div className="register-input-container">
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            required
          >
            <option value="USER">User</option>
            <option value="HOST">Host (Charger Owner)</option>
          </select>
          <label>Role</label>
        </div>

        <button 
          type="submit" 
          className="register-btn"
          disabled={phoneError ? true : false}
        >
          Register
        </button>
      </form>

      <p className="register-redirect">
        Already have an account? <span className="register-link" onClick={() => navigate("/login")}>Login</span>
      </p>
    </div>
  );
};

export default Register;
