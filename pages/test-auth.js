import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function TestAuth() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Auth state:', { user: !!user, loading, userEmail: user?.email });
  }, [user, loading]);

  if (loading) {
    return (
      <div style={{ padding: '20px', background: '#000', color: '#fff', minHeight: '100vh' }}>
        <h1>Loading...</h1>
        <p>Checking authentication status...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>Authentication Test</h1>
      
      {user ? (
        <div>
          <h2>✅ User is authenticated!</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
          
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => router.push('/startmenu')}
              style={{ 
                padding: '10px 20px', 
                marginRight: '10px',
                background: '#a8ee48',
                color: '#000',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Go to Start Menu
            </button>
            
            <button 
              onClick={signOut}
              style={{ 
                padding: '10px 20px', 
                background: '#333',
                color: '#fff',
                border: '1px solid #666',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2>❌ User is not authenticated</h2>
          <p>You need to log in to access protected pages.</p>
          
          <button 
            onClick={() => router.push('/login')}
            style={{ 
              padding: '10px 20px', 
              background: '#a8ee48',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
}
