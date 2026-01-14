import Footer from '../components/Layout/Footer';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Profile(){
  const { user } = useContext(AuthContext);

  return (
    <div>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="mt-3">Name: <strong>{user?.name || '—'}</strong></p>
        <p>Email: <strong>{user?.email || '—'}</strong></p>
      </main>
      <Footer />
    </div>
  )
}
