import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="auth-container">
      <h2>Create Account</h2>

      <input placeholder="Full Name" />
      <input placeholder="Email" />
      <input type="password" placeholder="Password" />

      <button className="btn">Register</button>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;
