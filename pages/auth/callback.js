import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      // Wait a moment for the auth state to update
      setTimeout(() => {
        if (!loading) {
          if (user) {
            // Successfully authenticated, redirect to startmenu
            router.push('/startmenu');
          } else {
            // Authentication failed, redirect to login with error
            router.push('/login?error=auth_failed');
          }
        }
      }, 1000);
    };

    handleAuthCallback();
  }, [user, loading, router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#000000',
      color: '#ffffff',
      flexDirection: 'column'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid #3a3a3a',
        borderTop: '4px solid #a8ee48',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }}></div>
      <h2>Completing sign in...</h2>
      <p>Please wait while we finish setting up your account.</p>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
