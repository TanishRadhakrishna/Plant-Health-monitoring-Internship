import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Activity, TrendingUp, Plus, Search, Calendar, Trash2, Leaf } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Modal from '../components/common/Modal'
import Loader from '../components/common/Loader'
import DiagnosisResult from '../components/diagnosis/DiagnosisResult'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { historyService } from '../services/historyService'
import { formatDate } from '@/utils/helpers'
import { DISEASE_INFO } from '@/utils/constants'

const Dashboard = () => {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [sessionPredictions, setSessionPredictions] = useState([])

  useEffect(() => {
    loadSessions()
    
    // Set up auto-refresh interval (every 10 seconds)
    const interval = setInterval(loadSessions, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const loadSessions = async () => {
    try {
      const data = await historyService.getSessions(100, 0)
      setSessions(data.sessions || [])
    } catch (error) {
      addToast('Failed to load sessions', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadSessionPredictions = async (sessionId) => {
    try {
      const data = await historyService.getSessionPredictions(sessionId)
      setSessionPredictions(data.predictions || [])
      setModalOpen(true)
    } catch (error) {
      addToast('Failed to load predictions', 'error')
    }
  }

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return
    }

    try {
      await historyService.deleteSession(sessionId)
      setSessions(sessions.filter(s => s.id !== sessionId))
      addToast('Session deleted successfully', 'success')
    } catch (error) {
      addToast('Failed to delete session', 'error')
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = [
    {
      icon: <Activity className="text-primary-600" size={32} />,
      label: 'Total Diagnoses',
      value: sessions.length,
      bgColor: 'from-primary-50 to-primary-100',
      borderColor: 'border-primary-200'
    },
    {
      icon: <TrendingUp className="text-forest-600" size={32} />,
      label: 'This Week',
      value: sessions.filter(s => {
        const date = new Date(s.created_at)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 7
      }).length,
      bgColor: 'from-forest-50 to-forest-100',
      borderColor: 'border-forest-200'
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}! <Leaf className="inline ml-2 text-forest-600" size={32} />
          </h1>
          <p className="text-gray-600 text-lg">
            View your diagnosis history and track your plants over time
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-8 bg-gradient-to-br ${stat.bgColor} border-2 ${stat.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-2">
                      {stat.label}
                    </p>
                    <p className="text-5xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-lg">
                    {stat.icon}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Link to="/">
            <Card className="p-8 bg-gradient-to-r from-primary-500 to-forest-600 text-white hover:shadow-2xl transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">New Diagnosis</h3>
                  <p className="text-primary-100">Upload an image to diagnose your plant</p>
                </div>
                <Plus size={48} />
              </div>
            </Card>
          </Link>
        </motion.div>

        {/* Search */}
        <Card className="p-6 mb-6">
          <Input
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={20} />}
          />
        </Card>

        {/* Sessions */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Diagnosis History</h2>
        
        {loading ? (
          <Loader />
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6"><Leaf size={80} className="mx-auto text-primary-600" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm ? 'No matching sessions' : 'No diagnoses yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm ? 'Try a different search term' : 'Start by diagnosing your first plant'}
            </p>
            {!searchTerm && (
              <Link to="/">
                <Button size="lg">Diagnose Your First Plant</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSessions.map((session, index) => {
              const lastPrediction = session.last_prediction
              const diseaseInfo = lastPrediction ? DISEASE_INFO[lastPrediction.predicted_class] : null

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 cursor-pointer group hover:shadow-xl" onClick={() => loadSessionPredictions(session.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                          {session.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>{formatDate(session.created_at)}</span>
                          </div>
                          {lastPrediction && diseaseInfo && (
                            <div className={`flex items-center gap-2 px-3 py-1 ${diseaseInfo.bgColor} ${diseaseInfo.borderColor} border-2 rounded-lg`}>
                              <span className="text-xl">{diseaseInfo.icon}</span>
                              <span className={`font-medium ${diseaseInfo.color}`}>
                                {lastPrediction.predicted_class.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSession(session.id)
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      {/* Session Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Session Predictions"
        size="lg"
      >
        {sessionPredictions.length > 0 ? (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {sessionPredictions.map((pred) => (
              <Card key={pred.id} className="p-6">
                <DiagnosisResult result={pred} imagePreview={null} onNewDiagnosis={() => setModalOpen(false)} />
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No predictions found in this session</p>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  )
}

export default Dashboard