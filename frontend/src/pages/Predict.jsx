import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import ImageUpload from '../components/prediction/ImageUpload';
import { useState, useEffect } from 'react';
import PredictionResult from '../components/prediction/PredictionResult';
import predictionAPI from '../api/prediction';
import { useToast } from '../context/ToastContext';

export default function Predict(){
  const [result, setResult] = useState(null);
  const [session, setSession] = useState(null);
  const toast = useToast();

  useEffect(()=>{
    (async ()=>{
      try{
        const s = await predictionAPI.createSession('Quick analysis');
        setSession(s);
      }catch(e){
        console.error('Failed to create session', e);
        toast?.show?.('Failed to create session', 'error');
      }
    })();
  },[])

  return (
    <div>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold">Analyze a Leaf</h2>
        <p className="text-sm text-gray-600">Quick analysis for your crops.</p>

        <section className="mt-6">
          <ImageUpload sessionId={session?.id || session?._id || session?.session_id} onResult={(r)=>setResult(r)} />
          <PredictionResult result={result} />
        </section>
      </main>
      <Footer />
    </div>
  )
}
