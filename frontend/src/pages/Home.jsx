import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Upload, Download, History, Shield, Zap, Lock, Camera, Check, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'
import ImageUploader from '../components/diagnosis/ImageUploader'
import DiagnosisResult from '../components/diagnosis/DiagnosisResult'
import { diagnosisService } from '../services/diagnosisService'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'

const Home = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [diagnosing, setDiagnosing] = useState(false)
  const [result, setResult] = useState(null)
  const { addToast } = useToast()
  const { user } = useAuth()

  const handleImageSelect = (file) => {
    setSelectedImage(file)
    setResult(null)
    
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setResult(null)
  }

  const handleDiagnose = async () => {
    if (!selectedImage) {
      addToast('Please upload an image first', 'warning')
      return
    }

    setDiagnosing(true)
    try {
      let data
      if (user) {
        // For logged-in users: save to history
        data = await diagnosisService.diagnoseWithHistory(selectedImage)
        setResult(data.prediction)
        addToast('Diagnosis completed and saved to history!', 'success')
      } else {
        // For guests: stateless diagnosis
        data = await diagnosisService.diagnoseStateless(selectedImage)
        setResult(data.prediction)
        addToast('Diagnosis completed!', 'success')
      }
    } catch (error) {
      addToast(error.response?.data?.error || 'Diagnosis failed', 'error')
    } finally {
      setDiagnosing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-forest-50 to-sage-50 opacity-50" />
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-6xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary-600 via-forest-600 to-sage-600 bg-clip-text text-transparent">
                  Leafora
                </span>
                <br />
                <span className="text-2xl md:text-5xl text-gray-900">AI Plant Health Diagnosis</span>
              </h1>
              <p className="text-xl text-gray-700 mb-4 max-w-3xl mx-auto">
                Instant plant disease detection powered by AI. No signup required.
              </p>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                {user ? (
                  <>
                    <CheckCircle className="inline mr-2 text-green-600" size={18} /> <strong>Secure & Saved:</strong> Your diagnosis history is safely stored in your account.
                  </>
                ) : (
                  <>
                    <Lock className="inline mr-2 text-primary-600" size={18} /> <strong>Privacy First:</strong> Your images are analyzed instantly and nothing is stored. 
                    {' '}<Link to="/register" className="text-primary-600 hover:underline font-semibold">
                      Create an account
                    </Link> if you want to save your diagnosis history.
                  </>
                )}
              </p>
            </motion.div>

            {/* Diagnosis Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              {diagnosing ? (
                <Card className="p-12">
                  <Loader size="lg" />
                  <p className="text-center text-gray-600 mt-6 text-lg">
                    Analyzing your plant... This may take a few seconds
                  </p>
                </Card>
              ) : result ? (
                <DiagnosisResult 
                  result={result} 
                  imagePreview={imagePreview}
                  onNewDiagnosis={handleRemoveImage}
                />
              ) : (
                <Card className="p-8">
                  <ImageUploader
                    onImageSelect={handleImageSelect}
                    selectedImage={selectedImage}
                    imagePreview={imagePreview}
                    onRemove={handleRemoveImage}
                  />

                  {selectedImage && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 flex justify-center"
                    >
                      <Button onClick={handleDiagnose} size="lg" icon={<Upload size={20} />}>
                        Diagnose Plant
                      </Button>
                    </motion.div>
                  )}

                  <div className="mt-8 p-6 bg-gradient-to-br from-primary-50 to-forest-50 rounded-xl border-2 border-primary-100">
                    <h3 className="font-semibold text-gray-900 mb-3"><Camera className="inline mr-2 text-primary-600" size={20} />Tips for Best Results</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li><Check className="inline mr-2 text-primary-600" size={18} />Take photos in good lighting</li>
                      <li><Check className="inline mr-2 text-primary-600" size={18} />Focus on affected areas</li>
                      <li><Check className="inline mr-2 text-primary-600" size={18} />Avoid blurry images</li>
                      <li><Check className="inline mr-2 text-primary-600" size={18} />Include leaves clearly</li>
                    </ul>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Use Leafora?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="text-primary-600" size={40} />,
                  title: 'Instant Results',
                  description: 'Get AI-powered diagnosis in seconds. No waiting, no signup required.'
                },
                {
                  icon: <Shield className="text-forest-600" size={40} />,
                  title: 'Privacy First',
                  description: 'Your images are analyzed instantly and never stored without permission.'
                },
                {
                  icon: <Download className="text-sage-600" size={40} />,
                  title: 'Download Reports',
                  description: 'Get detailed PDF reports with treatment recommendations.'
                },
                {
                  icon: <History className="text-primary-600" size={40} />,
                  title: 'Optional History',
                  description: 'Create an account to save and track your diagnoses over time.'
                },
                {
                  icon: <Upload className="text-forest-600" size={40} />,
                  title: 'Easy Upload',
                  description: 'Simple drag & drop interface. Works on mobile and desktop.'
                },
                {
                  icon: <Leaf className="text-sage-600" size={40} />,
                  title: 'Multiple Conditions',
                  description: 'Detect diseases, pests, and nutrient deficiencies accurately.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-8 bg-gradient-to-br from-primary-50 to-forest-50 border-2 border-primary-100">
                    <div className="bg-white p-4 rounded-xl inline-block mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="py-20 px-4 bg-gradient-to-br from-primary-50 to-forest-50">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Want to Track Your Plants?
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Create a free account to save your diagnosis history and re-download reports anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg">Create Free Account</Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg">Sign In</Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Home