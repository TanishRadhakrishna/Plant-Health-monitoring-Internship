export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const DISEASE_INFO = {
  Healthy: {
    title: 'Healthy Plant',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Your plant is in excellent health! Keep up the good care.',
    icon: 'Leaf',
    recommendations: [
      'Continue current watering schedule',
      'Maintain proper light exposure',
      'Monitor regularly for any changes',
      'Keep the environment clean'
    ]
  },
  Pest_Fungal: {
    title: 'Fungal Pest Detected',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Fungal infection detected. Immediate treatment recommended.',
    icon: 'AlertTriangle',
    recommendations: [
      'Apply fungicide immediately',
      'Remove affected leaves',
      'Improve air circulation',
      'Reduce watering frequency',
      'Avoid overhead watering'
    ]
  },
  Pest_Bacterial: {
    title: 'Bacterial Pest Detected',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Bacterial infection detected. Quick action required.',
    icon: 'Bug',
    recommendations: [
      'Isolate affected plant immediately',
      'Apply copper-based bactericide',
      'Remove and destroy infected parts',
      'Avoid overhead watering',
      'Sterilize tools after use'
    ]
  },
  Pest_Insect: {
    title: 'Insect Infestation',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Insect pests detected on your plant.',
    icon: 'Bug',
    recommendations: [
      'Apply appropriate insecticide',
      'Use neem oil spray',
      'Check for eggs under leaves',
      'Introduce beneficial insects',
      'Remove visible pests manually'
    ]
  },
  Nutrient_Nitrogen: {
    title: 'Nitrogen Deficiency',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Plant shows signs of nitrogen deficiency.',
    icon: 'Droplets',
    recommendations: [
      'Apply nitrogen-rich fertilizer',
      'Use compost or manure',
      'Consider organic fertilizers',
      'Monitor leaf color changes',
      'Ensure proper soil pH'
    ]
  },
  Nutrient_Potassium: {
    title: 'Potassium Deficiency',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Potassium deficiency detected in your plant.',
    icon: 'Beaker',
    recommendations: [
      'Apply potassium fertilizer',
      'Use banana peels as natural source',
      'Ensure proper soil pH',
      'Monitor leaf edges for browning',
      'Add wood ash to soil'
    ]
  },
  Water_Stress: {
    title: 'Water Stress',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    description: 'Plant is experiencing water-related stress.',
    icon: 'Waves',
    recommendations: [
      'Adjust watering schedule',
      'Check soil moisture regularly',
      'Ensure proper drainage',
      'Consider mulching',
      'Water deeply but less frequently'
    ]
  }
}

export const getConfidenceLevel = (confidence) => {
  if (confidence >= 0.85) return { label: 'Very High', color: 'text-green-700' }
  if (confidence >= 0.70) return { label: 'High', color: 'text-green-600' }
  if (confidence >= 0.55) return { label: 'Moderate', color: 'text-yellow-600' }
  return { label: 'Low', color: 'text-red-600' }
}