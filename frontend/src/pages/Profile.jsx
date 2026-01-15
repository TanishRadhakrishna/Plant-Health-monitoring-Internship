import { useState, useEffect } from 'react'
import { User, Mail, Calendar, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { historyService } from '../services/historyService'

const Profile = () => {
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalPredictions: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await historyService.getSessions(1000, 0)
      setStats({
        totalSessions: data.total || 0,
        totalPredictions: data.sessions?.length || 0,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      addToast('Logged out successfully', 'success')
      navigate('/')
    } catch (error) {
      addToast('Failed to logout', 'error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Profile Settings 👤
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account and view your statistics
          </p>
        </motion.div>

        {/* Profile Info */}
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-forest-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                {user?.username}
              </h2>
              <p className="text-gray-600 flex items-center gap-2">
                <Mail size={16} />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200">
              <p className="text-gray-600 text-sm font-medium mb-1">Total Sessions</p>
              <p className="text-3xl font-bold text-primary-700">{stats.totalSessions}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-forest-50 to-forest-100 rounded-xl border-2 border-forest-200">
              <p className="text-gray-600 text-sm font-medium mb-1">Total Diagnoses</p>
              <p className="text-3xl font-bold text-forest-700">{stats.totalPredictions}</p>
            </div>
          </div>
        </Card>

        {/* Account Information */}
        <Card className="p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Account Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <User className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-semibold text-gray-900">{user?.username}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-semibold text-gray-900">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-semibold text-gray-900">
                    {user?.created_at && new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Actions</h3>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              icon={<LogOut size={20} />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Version Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Leafora v2.0.0</p>
          <p>© 2024 All rights reserved</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Profile