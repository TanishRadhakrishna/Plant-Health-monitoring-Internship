import { Download, RotateCcw, Lock, CheckCircle, Leaf, AlertTriangle, Bug, Droplets, Beaker, Waves } from 'lucide-react'
import { motion } from 'framer-motion'
import Card from '../common/Card'
import Button from '../common/Button'
import ConfidenceGauge from './ConfidenceGauge'
import RecommendationCard from './RecommendationCard'
import { DISEASE_INFO } from '@/utils/constants'
import { generatePDFReport } from '@/utils/pdfGenerator'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'

const iconMap = {
  Leaf,
  AlertTriangle,
  Bug,
  Droplets,
  Beaker,
  Waves
}

const DiagnosisResult = ({ result, imagePreview, onNewDiagnosis }) => {
  const { addToast } = useToast()
  const { user } = useAuth()
  // Handle both 'class' (from new predictions) and 'predicted_class' (from history)
  const diseaseClass = result.class || result.predicted_class
  const diseaseInfo = DISEASE_INFO[diseaseClass] || DISEASE_INFO.Healthy

  const handleDownloadPDF = async () => {
    try {
      await generatePDFReport(result, imagePreview)
      addToast('Report downloaded successfully!', 'success')
    } catch (error) {
      addToast('Failed to generate PDF', 'error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={handleDownloadPDF} icon={<Download size={20} />} size="lg">
          Download PDF Report
        </Button>
        <Button onClick={onNewDiagnosis} variant="secondary" icon={<RotateCcw size={20} />} size="lg">
          New Diagnosis
        </Button>
      </div>

      {/* Main Result Card */}
      <Card className={`p-6 ${diseaseInfo.borderColor} border-2`}>
        <div className="flex items-start gap-4">
          {(() => {
            const IconComponent = iconMap[diseaseInfo.icon]
            return IconComponent ? <IconComponent className={`${diseaseInfo.color} flex-shrink-0`} size={56} /> : null
          })()}
          <div className="flex-1">
            <h2 className={`text-3xl font-bold ${diseaseInfo.color} mb-2`}>
              {diseaseInfo.title}
            </h2>
            <p className="text-gray-700 text-lg mb-4">{diseaseInfo.description}</p>
            
            <div className="flex flex-wrap gap-3">
              <div className={`px-4 py-2 ${diseaseInfo.bgColor} ${diseaseInfo.borderColor} border-2 rounded-xl`}>
                <span className="text-sm font-medium text-gray-600">Category: </span>
                <span className={`font-bold ${diseaseInfo.color}`}>
                  {result.category || 'N/A'}
                </span>
              </div>
              {result.subtype && (
                <div className={`px-4 py-2 ${diseaseInfo.bgColor} ${diseaseInfo.borderColor} border-2 rounded-xl`}>
                  <span className="text-sm font-medium text-gray-600">Subtype: </span>
                  <span className={`font-bold ${diseaseInfo.color}`}>
                    {result.subtype}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Uploaded Image */}
      {imagePreview && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Analyzed Image</h3>
          <img src={imagePreview} alt="Analyzed plant" className="w-full max-h-96 object-contain rounded-xl" />
        </Card>
      )}

      {/* Confidence */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Level</h3>
        <ConfidenceGauge confidence={result.confidence} />
      </Card>

      {/* Recommendations */}
      {diseaseInfo.recommendations && diseaseInfo.recommendations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recommended Actions
          </h3>
          <div className="space-y-3">
            {diseaseInfo.recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} index={index} />
            ))}
          </div>
        </Card>
      )}

      {/* Privacy Notice */}
      <div className={`p-4 border-2 rounded-xl ${user ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
        <p className={`text-sm ${user ? 'text-green-800' : 'text-blue-800'}`}>
          {user ? (
            <>
              <CheckCircle className="inline mr-2 text-green-600" size={18} /> <strong>Saved to History:</strong> This diagnosis has been automatically saved to your account. View it anytime in your{' '}
              <a href="/dashboard" className="underline font-semibold hover:opacity-80">
                Dashboard
              </a>.
            </>
          ) : (
            <>
              <Lock className="inline mr-2 text-blue-600" size={18} /> <strong>Privacy Notice:</strong> This diagnosis was not saved. 
              Download the PDF to keep your results. Want to track your diagnoses?{' '}
              <a href="/register" className="underline font-semibold hover:text-blue-900">
                Create a free account
              </a>.
            </>
          )}
        </p>
      </div>
    </motion.div>
  )
}

export default DiagnosisResult