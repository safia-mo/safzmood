require('dotenv').config();
const spotifyPreviewFinder = require('spotify-preview-finder');

const fetch = require('node-fetch')

exports.handler = async function handler(event, context) {
  const clientId = process.env.clientId;
  const clientSecret = process.env.clientSecret;

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

   const tracks = await Promise.all(
    playlistData.tracks.items.map(async item => {
    const trackName = item.track.name;
    const artistName = item.track.artists.map(a => a.name).join(', ');
    const cover = item.track.album.images[0]?.url;
    let previewUrl = item.track.preview_url;

    if (!previewUrl) {
      try {
        const result = await spotifyPreviewFinder(trackName, artistName, 1);
        if (result.success && result.results.length > 0) {
          previewUrl = result.results[0].previewUrls[0] || null;
        }
      } catch (err) {
        console.warn(`No preview found for ${trackName}`);
      }
    }

    return { name: trackName, artist: artistName, cover, previewUrl };
  })
);


    return {
      statusCode: 200,
      body: JSON.stringify({ name: playlistData.name, tracks })
    };

  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}