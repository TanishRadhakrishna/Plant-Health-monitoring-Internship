  // src/App.jsx
  import React from 'react';
  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import { AuthProvider } from './context/AuthContext';
  import PrivateRoute from './components/auth/PrivateRoute';
  import LoginForm from './components/auth/LoginForm';
  import RegisterForm from './components/auth/RegisterForm';
  import Dashboard from './pages/Dashboard';
  import Predict from './pages/Predict';
  import History from './pages/History';
  import Profile from './pages/Profile';
  import Home from './pages/Home';
  import Result from './pages/Result';
  import Navbar from './components/Layout/Navbar';

  function App() {
    return (
      <AuthProvider>
        <Router>
          <Navbar />
          {/* Add top padding so fixed header doesn't overlap content */}
          <div className="pt-20">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/predict"
                element={
                  <PrivateRoute>
                    <Predict />
                  </PrivateRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <PrivateRoute>
                    <History />
                  </PrivateRoute>
                }
              />
              <Route
                path="/history/:sessionId"
                element={
                  <PrivateRoute>
                    <History />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/result/:predictionId"
                element={
                  <PrivateRoute>
                    <Result />
                  </PrivateRoute>
                }
              />

              {/* 404 Not Found */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    );
  }
  export default App;

