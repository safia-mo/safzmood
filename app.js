let audio = new Audio();

export async function getPlaylist(playlistId) {
  const res = await fetch(`/.netlify/functions/spotify?id=${playlistId}`);
  if (!res.ok) throw new Error('Failed to fetch playlist');
  const data = await res.json();
  return data; 
}

export function playTrack(track) {
  return new Promise((resolve, reject) => {
    if (!track.previewUrl) {
      console.warn(`No preview available for: ${track.name}`);
      reject('No preview available');
      return;
    }

    audio.pause();
    audio = new Audio(track.previewUrl);

    audio.play()
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

export function pauseTrack() {
  if (audio) {
    audio.pause();
  }
}
 