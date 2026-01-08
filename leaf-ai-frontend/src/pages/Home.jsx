import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";

function Home() {
  useEffect(() => {
    const sections = document.querySelectorAll(".fade-section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 }
    );

    sections.forEach((section) => observer.observe(section));
  }, []);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section id="home">
        <Hero />
      </section>

      {/* ABOUT */}
      <section id="about" className="section fade-section">
        <h2>About Leaf AI</h2>
        <p>
          Leaf AI helps farmers and researchers detect crop health issues early
          using AI-powered leaf image analysis. Our goal is to improve crop
          productivity and reduce losses through smart technology.
        </p>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="section fade-section">
        <Features />
      </section>

      {/* BLOG */}
      <section id="blog" className="section fade-section">
        <h2>Blog</h2>
        <p>
          Farmers and researchers share their experiences using the Leaf AI
          platform to improve crop health and yield.
        </p>
      </section>

      {/* CONTACT / FOOTER */}
      <section id="contact">
        <Footer />
      </section>
    </>
  );
}

export default Home;
