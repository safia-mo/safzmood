import { clientId, clientSecret } from './config.js';

async function getToken() {
       const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    if (!response.ok){
        throw new Error('Failed to get token');
    }
    const data = await response.json();
    return data.access_token;

}

export async function getPlaylist(playlistId) {
    const token = await getToken();

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`,{
        headers:{
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok){
        throw new Error('Failed to fetch playlist');
    }
    const data= await response.json();


    const tracks = data.tracks.items.map(item => ({
        name: item.track.name,
        artist: item.track.artists.map(artist => artist.name).join(','),
        cover: item.track.album.images[0].url,
        url:item.track.preview_url

    }));

    return {
        name: data.name,
        tracks
    }
}

