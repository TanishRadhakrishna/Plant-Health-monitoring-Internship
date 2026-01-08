import { Link } from "react-router-dom";

function Hero() {
  return (
    <div className="hero">
      <h1>Revolutionize Crop Health Monitoring</h1>
      <p>AI-powered leaf analysis for farmers & researchers</p>

      <Link to="/login" className="btn">
        Get Started
      </Link>
    </div>
  );
}

export default Hero;
