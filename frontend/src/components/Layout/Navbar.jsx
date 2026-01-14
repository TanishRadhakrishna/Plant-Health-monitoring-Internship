import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold"><Link to="/">Leaf AI</Link> <span className="ml-2">🌱</span></h1>
          {/* Desktop nav */}
          <nav className="hidden md:flex gap-4 text-sm">
            <Link to="/" className="hover:underline">Home</Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                <Link to="/predict" className="hover:underline">Analyze</Link>
                <Link to="/history" className="hover:underline">History</Link>
                <Link to="/profile" className="hover:underline">Profile</Link>
              </>
            )}
          </nav>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <button onClick={()=>navigate('/login')} className="px-3 py-2 rounded-md font-semibold bg-white text-green-600">Login</button>
              <button onClick={()=>navigate('/register')} className="px-3 py-2 rounded-md font-semibold bg-white/30">Register</button>
              <button onClick={()=>navigate('/login')} className="px-3 py-2 rounded-md font-semibold bg-white/20">Get Started</button>
            </>
          ) : (
            <>
              <span className="text-sm">{user?.name || user?.email}</span>
              <button onClick={handleLogout} className="px-3 py-2 rounded-md font-semibold bg-white text-green-600">Logout</button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={()=>setMobileOpen(v=>!v)} aria-label="Open menu" className="p-2 rounded-md bg-white/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden bg-green-600 border-t border-green-500">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link to="/" className="text-white">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-white">Dashboard</Link>
                <Link to="/predict" className="text-white">Analyze</Link>
                <Link to="/history" className="text-white">History</Link>
                <Link to="/profile" className="text-white">Profile</Link>
                <button onClick={handleLogout} className="mt-2 px-3 py-2 rounded-md bg-white text-green-600 font-semibold">Logout</button>
              </>
            ) : (
              <>
                <button onClick={()=>navigate('/login')} className="px-3 py-2 rounded-md bg-white text-green-600 font-semibold">Login</button>
                <button onClick={()=>navigate('/register')} className="px-3 py-2 rounded-md bg-white/30 font-semibold">Register</button>
                <button onClick={()=>navigate('/login')} className="px-3 py-2 rounded-md bg-white/20 font-semibold">Get Started</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
