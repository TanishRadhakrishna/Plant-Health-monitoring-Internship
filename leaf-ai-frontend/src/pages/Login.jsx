import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p>Sign in to access your dashboard</p>

        <input type="text" placeholder="Email / Username" />
        <input type="password" placeholder="Password" />

        <div className="auth-actions">
          <span className="forgot">Forgot password?</span>
        </div>

        <button className="btn full">Login</button>

        <p className="switch">
          New user? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
