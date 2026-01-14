import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { useAuth } from '../hooks/useAuth';

export default function Home(){
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4">
        <div className="max-w-5xl w-full text-center py-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-green-700 leading-tight">Leaf AI — Crop Health Diagnostics</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">Analyze leaf images with our AI to detect diseases, get confidence scores and recommended remedies — designed for farmers and agronomists.</p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={handleGetStarted} className="px-8 py-3 rounded-md bg-green-600 text-white font-semibold shadow hover:bg-green-700">Get Started</button>
            <a href="/#learn-more" className="text-green-600">Learn more</a>
          </div>

          <div id="learn-more" className="mt-12 text-left mx-auto max-w-3xl">
            <h3 className="text-lg font-semibold text-green-700">Why Leaf AI?</h3>
            <p className="mt-2 text-sm text-gray-600">Fast, secure plant health diagnostics with session-based history for auditing and review.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}