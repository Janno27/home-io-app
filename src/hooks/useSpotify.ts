import { useState, useEffect, useCallback } from 'react';

const CLIENT_ID = '405d38614af64dff8ed4d998f2ce18a8'; // Client ID public - peut rester côté client
const SCOPES = 'user-read-private user-read-email playlist-read-private user-library-read';

interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface SpotifyUser {
  id: string;
  display_name: string;
  images: Array<{ url: string }>;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  tracks: { total: number };
}

export function useSpotify() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const tokens = getStoredTokens();
    if (!tokens) {
      setIsAuthenticated(false);
      return;
    }

    // Vérifier si le token est expiré
    if (Date.now() >= tokens.expires_at) {
      try {
        await refreshToken();
      } catch (error) {
        logout();
        return;
      }
    }

    setIsAuthenticated(true);
    await fetchUserProfile();
  };

  const getStoredTokens = (): SpotifyTokens | null => {
    const stored = localStorage.getItem('spotify_tokens');
    return stored ? JSON.parse(stored) : null;
  };

  const storeTokens = (tokens: any) => {
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    };
    localStorage.setItem('spotify_tokens', JSON.stringify(tokenData));
  };

  const login = () => {
    const redirectUri = `${window.location.origin}/callback`;
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(SCOPES)}`;
    
    window.location.href = authUrl;
  };

  const handleCallback = async (code: string) => {
    try {
      setLoading(true);
      const redirectUri = `${window.location.origin}/callback`;
      const response = await fetch('/.netlify/functions/spotify-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'exchange_code', 
          code,
          redirect_uri: redirectUri 
        }),
      });

      const tokens = await response.json();
      if (!response.ok) throw new Error(tokens.error);

      storeTokens(tokens);
      setIsAuthenticated(true);
      await fetchUserProfile();
      
      // Rediriger vers la page principale
      window.location.href = '/';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    const tokens = getStoredTokens();
    if (!tokens?.refresh_token) throw new Error('No refresh token');

    const response = await fetch('/.netlify/functions/spotify-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'refresh_token', 
        refresh_token: tokens.refresh_token 
      }),
    });

    const newTokens = await response.json();
    if (!response.ok) throw new Error(newTokens.error);

    storeTokens({
      ...newTokens,
      refresh_token: tokens.refresh_token, // Garder l'ancien refresh_token
    });
  };

  const logout = () => {
    localStorage.removeItem('spotify_tokens');
    setIsAuthenticated(false);
    setUser(null);
    setPlaylists([]);
  };

  const makeAuthenticatedRequest = async (url: string) => {
    const tokens = getStoredTokens();
    if (!tokens) throw new Error('Not authenticated');

    // Vérifier si le token est expiré
    if (Date.now() >= tokens.expires_at) {
      await refreshToken();
      const refreshedTokens = getStoredTokens();
      if (!refreshedTokens) throw new Error('Failed to refresh token');
      tokens.access_token = refreshedTokens.access_token;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  };

  const fetchUserProfile = async () => {
    try {
      const userData = await makeAuthenticatedRequest('https://api.spotify.com/v1/me');
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchPlaylists = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const data = await makeAuthenticatedRequest('https://api.spotify.com/v1/me/playlists?limit=50');
      setPlaylists(data.items || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    user,
    playlists,
    loading,
    error,
    login,
    logout,
    handleCallback,
    fetchPlaylists,
  };
} 