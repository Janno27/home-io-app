const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

exports.handler = async (event, context) => {
  // Activer CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  // Vérifier que les variables d'environnement sont configurées
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.' 
      }),
    };
  }

  try {
    console.log('Received request:', {
      method: event.httpMethod,
      headers: event.headers,
      body: event.body
    });

    const { action, code, refresh_token } = JSON.parse(event.body || '{}');

    if (action === 'exchange_code') {
      console.log('Exchanging code for tokens');
      
      const redirectUri = event.headers.origin ? `${event.headers.origin}/callback` : 'http://localhost:5173/callback';
      console.log('Using redirect URI:', redirectUri);
      
      // Échanger le code d'autorisation contre des tokens
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log('Spotify token response status:', tokenResponse.status);
      
      if (!tokenResponse.ok) {
        console.error('Spotify token error:', tokenData);
        throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange code');
      }

      console.log('Successfully exchanged code for tokens');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(tokenData),
      };
    }

    if (action === 'refresh_token') {
      // Rafraîchir le token d'accès
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refresh_token,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || 'Failed to refresh token');
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(tokenData),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' }),
    };
  } catch (error) {
    console.error('Spotify auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}; 