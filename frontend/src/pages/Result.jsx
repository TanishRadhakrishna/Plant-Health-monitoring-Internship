import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import historyAPI from '../api/history';
import PredictionCard from '../components/history/PredictionCard';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

export default function Result(){
  const { predictionId } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      try{
        const p = await historyAPI.getPredictionDetails(predictionId);
        setPrediction(p);
      }catch(e){
        console.error('Failed to fetch prediction details', e);
      }finally{ setLoading(false); }
    })();
  },[predictionId]);

  return (
    <div>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold">Result</h2>
        {loading && <p>Loading...</p>}
        {!loading && !prediction && <p>Result not found.</p>}
        {prediction && (
          <div className="mt-6">
            <PredictionCard item={prediction} />
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Prediction ID:</strong> {prediction.id || prediction._id}</p>
              <p><strong>Timestamp:</strong> {new Date(prediction.createdAt || prediction.timestamp || Date.now()).toLocaleString()}</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}