import { useEffect, useState } from 'react';
import historyAPI from '../../api/history';
import { Link } from 'react-router-dom';

export default function SessionList(){
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      try{
        const data = await historyAPI.getSessions();
        setSessions(data || []);
      }catch(e){
        console.error(e);
      }finally{
        setLoading(false);
      }
    })();
  },[])

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
      {loading && <p>Loading...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sessions.map(s=> (
          <div key={s._id} className="bg-white p-4 rounded-md shadow-sm hover:transform hover:-translate-y-1 hover:shadow-lg transition">
            <div className="relative">
              <img src={s.thumbnail || s.imageUrl} alt="thumb" className="w-full h-40 object-cover rounded" />
              <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">{(s.confidence*100).toFixed(0)}%</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{s.prediction}</p>
                <p className="text-xs text-gray-500">{(s.confidence*100).toFixed(0)}%</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Link to={`/history/${s._id}`} className="btn border">View</Link>
              <a href={`/api/history/sessions/${s._id}/report`} className="btn">Report</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
