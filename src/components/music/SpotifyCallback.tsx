import { useEffect } from 'react';
import { useSpotify } from '@/hooks/useSpotify';

export function SpotifyCallback() {
  const { handleCallback, loading, error } = useSpotify();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    
    console.log('Callback page loaded');
    console.log('URL:', window.location.href);
    console.log('Code:', code);
    console.log('Error:', errorParam);

    if (errorParam) {
      console.error('Spotify authentication error:', errorParam);
      window.location.href = '/';
      return;
    }

    if (code) {
      console.log('Found authorization code, starting exchange...');
      handleCallback(code);
    } else {
      console.log('No code found, redirecting to home');
      // Pas de code, rediriger vers l'accueil
      window.location.href = '/';
    }
  }, [handleCallback]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1DB954] mx-auto mb-4"></div>
          <p className="text-gray-600">Connexion à Spotify en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur de connexion : {error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return null;
} 