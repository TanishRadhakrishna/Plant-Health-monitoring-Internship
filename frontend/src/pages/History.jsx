import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import SessionList from '../components/history/SessionList';
import SessionDetail from '../components/history/SessionDetail';
import { useParams } from 'react-router-dom';

export default function History(){
  const { sessionId } = useParams();

  return (
    <div>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold">History</h2>
        <p className="text-sm text-gray-600">View past analyses and download reports.</p>

        <section className="mt-6">
          {!sessionId && <SessionList />}
          {sessionId && <SessionDetail />}
        </section>
      </main>
      <Footer />
    </div>
  )
}
