import { Leaf, Github, Twitter, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white border-t-2 border-primary-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary-500 to-forest-600 p-2 rounded-xl">
                <Leaf className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-forest-700 bg-clip-text text-transparent">
                Leafora
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              AI-powered plant disease detection. Keep your plants healthy with advanced technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">Home</Link></li>
              <li><Link to="/dashboard" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">Dashboard</Link></li>
              <li><Link to="/login" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 text-sm">Instant Diagnosis</li>
              <li className="text-gray-600 text-sm">PDF Reports</li>
              <li className="text-gray-600 text-sm">History Tracking</li>
              <li className="text-gray-600 text-sm">Privacy First</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-primary-100 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2024 Leafora. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Made with  for plant lovers everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer