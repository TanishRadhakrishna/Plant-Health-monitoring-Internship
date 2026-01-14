import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import historyAPI from '../../api/history';
import PredictionCard from './PredictionCard';

export default function SessionDetail(){
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    (async ()=>{
      try{
        const s = await historyAPI.getSessionPredictions(sessionId);
        setSession(s);
        setTitle(s.title || 'Session');
      }catch(e){
        console.error(e);
      }finally{ setLoading(false); }
    })();
  },[sessionId]);

  const rename = async ()=>{
    try{
      await historyAPI.updateSessionTitle(sessionId, title);
      setEditing(false);
      // Refresh
      const s = await historyAPI.getSessionPredictions(sessionId);
      setSession(s);
    }catch(e){ console.error(e) }
  };

  const remove = async ()=>{
    if(!confirm('Delete this session?')) return;
    try{
      await historyAPI.deleteSession(sessionId);
      navigate('/history');
    }catch(e){ console.error(e) }
  };

  if(loading) return <p>Loading...</p>;
  if(!session) return <p>Not found.</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          {!editing ? <h2 className="text-xl font-semibold">{session.title}</h2> : <input value={title} onChange={(e)=>setTitle(e.target.value)} className="border rounded px-2 py-1" />}
          <p className="text-xs text-gray-500">{new Date(session.createdAt).toLocaleString()}</p>
        </div>

        <div className="flex gap-2">
          {!editing && <button onClick={()=>setEditing(true)} className="btn border">Rename</button>}
          {editing && <button onClick={rename} className="btn">Save</button>}
          <button onClick={remove} className="btn border">Delete</button>
          <Link to={`/api/history/sessions/${sessionId}/report`} className="btn">Download Report</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <PredictionCard item={session} />
      </div>
    </div>
  )
}