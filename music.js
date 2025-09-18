// Simple Music Player JS
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playPause');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeEl = document.getElementById('volume');
const playlistEl = document.getElementById('playlist');

const autoplayCheckbox = document.getElementById('autoplay');
const shuffleCheckbox = document.getElementById('shuffle');
const repeatCheckbox = document.getElementById('repeat');

// Playlist - change URLs to your own files or local files in tracks/
const playlist = [
  {
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'SoundHelix Song 1',
    artist: 'SoundHelix'
  },
  {
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    title: 'SoundHelix Song 2',
    artist: 'SoundHelix'
  },
  {
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    title: 'SoundHelix Song 3',
    artist: 'SoundHelix'
  }
];

let currentIndex = 0;
let isPlaying = false;
let updateTimer = null;

// Build playlist UI
function renderPlaylist(){
  playlistEl.innerHTML = '';
  playlist.forEach((s, i) => {
    const item = document.createElement('div');
    item.className = 'song-item';
    item.dataset.index = i;
    item.innerHTML = `<div class="song-meta"><div class="song-title">${s.title}</div><div class="song-artist">${s.artist}</div></div>
                      <div class="song-duration" id="dur-${i}">--:--</div>`;
    item.addEventListener('click', () => {
      loadTrack(i);
      playTrack();
    });
    playlistEl.appendChild(item);
    // optionally prefetch durations
    fetchDuration(s.src, dur-${i});
  });
}

// fetch duration by loading metadata (not ideal if CORS blocked)
function fetchDuration(src, elId){
  const tmp = new Audio();
  tmp.src = src;
  tmp.addEventListener('loadedmetadata', () => {
    const d = formatTime(tmp.duration);
    const el = document.getElementById(elId);
    if(el) el.textContent = d;
    tmp.src = '';
  }, {once:true});
  tmp.addEventListener('error', ()=>{ /* ignore */ }, {once:true});
}

// Load a given track index
function loadTrack(index){
  if(index < 0) index = playlist.length - 1;
  if(index >= playlist.length) index = 0;
  currentIndex = index;

  const track = playlist[currentIndex];
  audio.src = track.src;
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;
  setActivePlaylistItem();

  // reset progress
  progress.value = 0;
  currentTimeEl.textContent = '0:00';
  totalTimeEl.textContent = '--:--';
}

// Play / Pause
function playTrack(){
  audio.play().then(()=> {
    isPlaying = true;
    playBtn.textContent = '⏸';
    startProgressUpdater();
  }).catch(err => {
    console.error('Play failed:', err);
  });
}
function pauseTrack(){
  audio.pause();
  isPlaying = false;
  playBtn.textContent = '▶';
  stopProgressUpdater();
}
playBtn.addEventListener('click', () => {
  if(!isPlaying) playTrack(); else pauseTrack();
});

// Prev / Next
prevBtn.addEventListener('click', () => {
  if(shuffleCheckbox.checked){
    loadTrack(Math.floor(Math.random()*playlist.length));
  } else {
    loadTrack(currentIndex - 1);
  }
  playTrack();
});
nextBtn.addEventListener('click', () => {
  if(shuffleCheckbox.checked){
    loadTrack(Math.floor(Math.random()*playlist.length));
  } else {
    loadTrack(currentIndex + 1);
  }
  playTrack();
});

// progress updates
audio.addEventListener('loadedmetadata', () => {
  totalTimeEl.textContent = formatTime(audio.duration);
  progress.max = Math.floor(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  progress.value = Math.floor(audio.currentTime);
  currentTimeEl.textContent = formatTime(audio.currentTime);
});
progress.addEventListener('input', (e) => {
  audio.currentTime = e.target.value;
});

// volume
volumeEl.addEventListener('input', (e) => {
  audio.volume = e.target.value;
});
audio.volume = parseFloat(volumeEl.value);

// when track ends
audio.addEventListener('ended', () => {
  if(repeatCheckbox.checked){
    loadTrack(currentIndex);
    playTrack();
    return;
  }
  if(shuffleCheckbox.checked){
    loadTrack(Math.floor(Math.random()*playlist.length));
    playTrack();
    return;
  }
  loadTrack(currentIndex + 1);
  if(autoplayCheckbox.checked) playTrack(); else pauseTrack();
});

// helpers
function formatTime(sec){
  if(!isFinite(sec)) return '--:--';
  const m = Math.floor(sec/60);
  const s = Math.floor(sec%60).toString().padStart(2,'0');
  return ${m}:${s};
}
function setActivePlaylistItem(){
  document.querySelectorAll('.song-item').forEach(it => it.classList.remove('active'));
  const el = document.querySelector(.song-item[data-index="${currentIndex}"]);
  if(el) el.classList.add('active');
}
function startProgressUpdater(){
  // not strictly needed because timeupdate event handles progress
  // but keep for safety
  if(updateTimer) clearInterval(updateTimer);
  updateTimer = setInterval(()=> {
    // will be synced by timeupdate event
  }, 500);
}
function stopProgressUpdater(){
  if(updateTimer) clearInterval(updateTimer);
}

// keyboard support (space = play/pause, left/right skip)
document.addEventListener('keydown', (e) => {
  if(e.code === 'Space'){ e.preventDefault(); if(!isPlaying) playTrack(); else pauseTrack(); }
  if(e.code === 'ArrowRight'){ loadTrack(currentIndex+1); playTrack(); }
  if(e.code === 'ArrowLeft'){ loadTrack(currentIndex-1); playTrack(); }
});

// initialize
renderPlaylist();
loadTrack(0);

// autoplay option effect at start if user wants
if(autoplayCheckbox.checked) playTrack();