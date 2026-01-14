import { useNavigate } from 'react-router-dom';

export default function PredictionResult({ result }){
  const navigate = useNavigate();
  if(!result) return null;

  const { id, label, confidence, remedy, imageUrl } = result;

  return (
    <div className="mt-6 bg-gradient-to-b from-green-50 to-white p-4 rounded-xl shadow-sm max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {imageUrl && <img src={imageUrl} alt="leaf" className="w-20 h-20 object-cover rounded-md shadow-sm" />}
          <div>
            <h3 className="text-lg font-bold">{label}</h3>
            <p className="text-sm text-gray-600">Confidence: {(confidence*100).toFixed(1)}%</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={()=>{/* TODO: implement report generation */}}>Download PDF Report</button>
          {id ? (
            <button className="btn border" onClick={()=>navigate(`/result/${id}`)}>View details</button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        <p><strong>Recommended remedy:</strong></p>
        <p>{remedy}</p>
      </div>
    </div>
  )
}
