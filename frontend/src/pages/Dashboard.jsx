import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import ImageUpload from '../components/prediction/ImageUpload';
import { useState, useEffect } from 'react';
import PredictionResult from '../components/prediction/PredictionResult';
import historyAPI from '../api/history';
import predictionAPI from '../api/prediction';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Dashboard(){
  const [result, setResult] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Load sessions and create a new session on mount
  useEffect(()=>{
    (async ()=>{
      try{
        const data = await historyAPI.getSessions();
        setSessions(data || []);

        // Create a new session for this dashboard visit
        const s = await predictionAPI.createSession('New analysis');
        setSession(s);
      }catch(e){
        console.error('Failed to load sessions or create session', e);
        toast?.show?.('Could not initialize session', 'error');
      }finally{ setLoading(false) }
    })();
  },[])

  const total = sessions.length;
  const healthyCount = sessions.filter(s => s.prediction === 'Healthy').length;
  const healthyRate = total === 0 ? 0 : Math.round((healthyCount/total)*100);

  const handleResult = async (r) => {
    setResult(r);

    // Refresh recent sessions list so the new prediction is visible
    try{
      const data = await historyAPI.getSessions();
      setSessions(data || []);

      // If response included session id, try to load its predictions
      if (r?.raw?.session_id || r?.raw?.sessionId) {
        const updatedSession = await historyAPI.getSessionPredictions(r.raw.session_id || r.raw.sessionId);
        // update session listing if needed
      }
    }catch(e){
      console.error('Failed to refresh sessions after prediction', e);
    }
  };

  return (
    <div>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-green-700">Leaf Health Analyzer</h2>
          <p className="text-sm text-gray-600">Upload a leaf image and get AI-powered diagnostics and remedies.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Healthy rate</p>
              <p className="text-2xl font-bold text-green-600">{healthyRate}%</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Most recent</p>
              <p className="text-lg font-medium">{sessions[0]?.prediction || '—'}</p>
            </div>
          </div>

          <section className="mt-6">
            <ImageUpload sessionId={session?.id || session?._id || session?.session_id} onResult={handleResult} />
            <PredictionResult result={result} />
          </section>
        </div>

        <section className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Recent Sessions</h3>
          {loading && <p>Loading sessions...</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sessions.map(s => (
              <div key={s._id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                <div className="flex gap-3">
                  <img src={s.thumbnail || s.imageUrl} alt="thumb" className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium">{s.title}</p>
                    <p className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</p>
                    <p className="mt-2 text-sm">{s.prediction} • {(s.confidence*100).toFixed(0)}%</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a href={`/history/${s._id}`} className="btn border">View</a>
                    <a href={`/api/history/sessions/${s._id}/report`} className="btn">Report</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
