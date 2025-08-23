import fetch from 'node-fetch';

export async function handler(event, context) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      body: 'Spotify client ID/secret not set in environment variables'
    };
  }

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    const playlistId = event.queryStringParameters?.id;
    if (!playlistId) {
      return { statusCode: 400, body: 'Missing playlist ID' };
    }

    const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const playlistData = await playlistRes.json();

    const tracks = playlistData.tracks.items.map(item => ({
      name: item.track.name,
      artist: item.track.artists.map(a => a.name).join(', '),
      cover: item.track.album.images[0]?.url,
      previewUrl: item.track.preview_url
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ name: playlistData.name, tracks })
    };

  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}