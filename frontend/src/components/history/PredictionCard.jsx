export default function PredictionCard({ item }){
  if(!item) return null;
  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <img src={item.imageUrl} alt="full" className="w-full h-48 object-cover rounded" />
      <div className="mt-3">
        <h4 className="font-semibold">{item.prediction}</h4>
        <p className="text-sm text-gray-600">Confidence: {(item.confidence*100).toFixed(1)}%</p>
        <p className="mt-2 text-sm">{item.remedy}</p>
      </div>
    </div>
  )
}
