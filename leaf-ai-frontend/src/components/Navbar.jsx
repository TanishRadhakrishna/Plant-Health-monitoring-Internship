import { Link } from "react-router-dom";

function Navbar() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="navbar">
      <h2 className="logo">🌿 Leaf AI</h2>

      <ul>
        <li onClick={() => scrollTo("home")}>Home</li>
        <li onClick={() => scrollTo("benefits")}>Benefits</li>
        <li onClick={() => scrollTo("blog")}>Blog</li>
        <li onClick={() => scrollTo("contact")}>Contact</li>
        <li>
          <Link to="/login" className="login-btn">Login</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
