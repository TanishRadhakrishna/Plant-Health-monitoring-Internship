export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getClassColor = (predictedClass) => {
  if (!predictedClass) return 'bg-gray-100 text-gray-800';
  
  if (predictedClass === 'Healthy') {
    return 'bg-green-100 text-green-800';
  }
  
  const category = predictedClass.split('_')[0];
  const colors = {
    Pest: 'bg-red-100 text-red-800',
    Nutrient: 'bg-yellow-100 text-yellow-800',
    Water: 'bg-blue-100 text-blue-800',
  };
  
  return colors[category] || 'bg-gray-100 text-gray-800';
};