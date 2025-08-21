import { getPlaylist, playTrack, pauseTrack } from './app.js';

const moodButtons = document.querySelectorAll('.mood-btn');
const trackList = document.getElementById('track-list');
const playlistName = document.getElementById('playlist-name');
const playButton = document.querySelector('.play-button');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');
const albumCover = document.querySelector('.album-cover');
const trackName = document.querySelector('.track-name');
const artistName = document.querySelector('.artist-name');

let currentPlaylist = [];
let currentIndex = 0;
let isPlaying = false;
 
init();

async function init() {
    const playlist = await getPlaylist('YOUR_DEFAULT_PLAYLIST_ID');
    displayPlaylist(playlist);
}

moodButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
        const playlistKey = btn.dataset.playlist;
        const playlist = await getPlaylist(playlistKey);
        displayPlaylist(playlist);
    });
});

function displayPlaylist(playlist) {
    currentPlaylist = playlist.tracks;
    playlistName.textContent = playlist.name;
    currentIndex = 0;
    trackList.innerHTML = '';

    currentPlaylist.forEach((track, index) => {
        const li = document.createElement('li');
        li.textContent = `${track.name} - ${track.artist}`;
        li.dataset.index = index;

        li.addEventListener('click', async () => {
            currentIndex = index;
            await playCurrentTrack();
        });

        trackList.appendChild(li);
    });

    updateNowPlaying();
    updatePlayButton();
}

async function playCurrentTrack() {
    const track = currentPlaylist[currentIndex];
    if (!track) return;
    await playTrack(track);
    isPlaying = true;
    updateNowPlaying();
    updatePlayButton();
}

function updateNowPlaying() {
    const track = currentPlaylist[currentIndex];
    if (!track) return;

    albumCover.src = track.cover;
    trackName.textContent = track.name;
    artistName.textContent = track.artist;

    highlightCurrentTrack();
}

function highlightCurrentTrack() {
    const listItems = trackList.querySelectorAll('li');
    listItems.forEach((li, index) => {
        li.classList.toggle('playing', index === currentIndex);
    });
}
function updatePlayButton() {
    const img = playButton.querySelector('img');
    img.src = isPlaying ? 'pause-button.png' : 'play-button.png';
}

playButton.addEventListener('click', async () => {
    if (isPlaying) {
        pauseTrack();
        isPlaying = false;
    } else {
        await playCurrentTrack();
    }
    updatePlayButton();
});

prevButton.addEventListener('click', async () => {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : currentPlaylist.length - 1;
    await playCurrentTrack();
});

nextButton.addEventListener('click', async () => {
    currentIndex = currentIndex < currentPlaylist.length - 1 ? currentIndex + 1 : 0;
    await playCurrentTrack();
});