export const CONFIDENCE_LEVELS = {
  VERY_HIGH: 'Very High',
  HIGH: 'High',
  MODERATE: 'Moderate',
  LOW: 'Low',
};

export const PLANT_CLASSES = {
  HEALTHY: 'Healthy',
  PEST_FUNGAL: 'Pest_Fungal',
  PEST_BACTERIAL: 'Pest_Bacterial',
  PEST_INSECT: 'Pest_Insect',
  NUTRIENT_NITROGEN: 'Nutrient_Nitrogen',
  NUTRIENT_POTASSIUM: 'Nutrient_Potassium',
  WATER_STRESS: 'Water_Stress',
};

export const CLASS_COLORS = {
  Healthy: 'bg-green-100 text-green-800 border-green-200',
  Pest: 'bg-red-100 text-red-800 border-red-200',
  Nutrient: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Water: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];