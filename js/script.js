const fs = require('fs') 
// const { remote } = require('electron')

// Get Window
// var win = remote.getCurrentWindow()

// Window elements
// const titleBar = document.getElementById('title-bar')
// const fileName = document.getElementById('file-name')
// const minimize = document.getElementById('minimize')
// const maximize = document.getElementById('maximize')
// const restore = document.getElementById('restore')
// const close = document.getElementById('close')

// Supported file types
fileTypes = ['MP4', 'MOV', 'MP3', 'OGG']

// Menu Elements
const menu = document.getElementById('menu')
const backdrop = document.getElementById('backdrop')
const infoKeys = document.getElementById('info-keys')
const closeMenu = document.getElementById('close-menu')

// Video Elements
const fileNameFs = document.getElementById('file-name-fs')
const videoContainer = document.getElementById('video-container');
const video = document.getElementById('video');

// Control elements
const progressBar = document.getElementById('progress-bar')
const progress = document.getElementById('progress')
const progress2 = document.getElementById('progress-2')
const progressBarTooltip = document.getElementById('progress-bar-tooltip')

const open = document.getElementById('open')

const prev = document.getElementById('prev')
const back15 = document.getElementById('back15')
const back5 = document.getElementById('back5')

const playPause = document.getElementById('play-pause')
const playPauseIcon = document.querySelector('#play-pause i')

const forward5 = document.getElementById('forward5')
const forward15 = document.getElementById('forward15')
const next = document.getElementById('next')

const timeInfo = document.getElementById('time-info')

const mute = document.getElementById('mute')
const muteIcon = document.querySelector('#mute i')
const volumeDisplay = document.getElementById('volume-display')

const speedDisplay = document.getElementById('speed-display')

const goFs = document.getElementById('go-fs')
const exitFs = document.getElementById('exit-fs')

const disabledFromStart = document.getElementsByClassName('disabled-from-start')

// Variables
let controlsTimer
let playerVolume = 1
let playerSpeed = 1
let currentFolder
let file
let filePath = ''
let fileString = ''
let fileList = []
let fileIndex = 0
let playList = []

// HANDLERS
function handleLoadedMetadata() {
  progress.setAttribute('max', video.duration);
  progress2.setAttribute('max', video.duration);

  position.textContent = primePositionText(video.duration);
  duration.textContent = composeDurationText(video.duration);
  timeInfo.style.visibility = 'visible';
  
  for (let i = 0; i < disabledFromStart.length; i++) {
    disabledFromStart[i].disabled = false;
  }

  playPause.click();
}

function handleTimeUpdate() {
  progress.value = video.currentTime;
  progress2.value = video.currentTime;
  position.textContent = composePositionText(video.duration, video.currentTime);
}

function handleVolumeChange() {
  if (video.volume == 0) {
    muteIcon.classList.remove('fa-volume-up');
    muteIcon.classList.add('fa-volume-off');
  } else {
    muteIcon.classList.remove('fa-volume-off');
    muteIcon.classList.add('fa-volume-up');
  }
  volume.value = video.volume * 100;
  volumeDisplay.innerText = volume.value;

  console.log(video.volume);
  console.log('Player Volume:', playerVolume);
}

function handlePlaybackRateChange() {
  speed.value = video.playbackRate;
  playerSpeed = video.playbackRate;
  speedDisplay.innerText = parseFloat(speed.value).toFixed(2) + 'x';

  console.log(video.playbackRate);
  console.log('Player Speed:', playerSpeed);
}

function handleEnded(){
  playPauseIcon.classList.remove('fa-pause');
  playPauseIcon.classList.add('fa-play');
}

function handleProgressInput() {
  video.currentTime = progress.value;
  progress2.value = progress.value;
}

function handleSpeedInput() {
  video.playbackRate = speed.value
}

function handleVolumeInput() {
  video.volume = volume.value / 100
  playerVolume = video.volume 
}

function showMenu() {
  menu.style.display = 'block';
  setTimeout(() => infoKeys.style.right = '0', 50); 
}

function hideMenu() {
  infoKeys.style.right = '-33.33vw';
  setTimeout(() => menu.style.display = 'none', 350); 
}

function loadVideoFromList(newIndex) {
  if (newIndex === fileList.length) {
    newIndex = 0
  }
  if (newIndex === -1) {
    newIndex = fileList.length -1
  }

  video.src = fileList[newIndex]
  fileIndex = newIndex
  fileString = getFileName(fileList[newIndex])

  if (document.webkitFullscreenElement) {
    showControls();
  }
      
  // fileName.textContent = '\xa0' + '-' + '\xa0' + fileString
  document.getElementsByTagName('title')[0].innerHTML = 'mp4Player'
  document.getElementsByTagName('title')[0].innerHTML += '\xa0' + '-' + '\xa0' + fileString.replace('%23', '#')

  fileNameFs.textContent = fileString

  video.playbackRate = playerSpeed
}

togglePlayPause = () => {
  if (video.paused || video.ended) {
    playPauseIcon.classList.remove('fa-play')
    playPauseIcon.classList.add('fa-pause')
    video.play();
  } 
  else {
    playPauseIcon.classList.remove('fa-pause')
    playPauseIcon.classList.add('fa-play')
    video.pause();
  } 
}

jump = (value) => {
  video.currentTime += value 
}

jumpToStart = () => {
  video.currentTime = 0 
}

toggleMute = () => {
  if (video.volume == 0) {    
    if (playerVolume === 0) {
      video.volume = 0.5      
    } else {
      video.volume = playerVolume
    }
  } else {
    video.volume = 0
  }
}

increaseVolume = () => {  
  let newVolume = (video.volume + 0.05).toFixed(2)
  if (newVolume > 1) {
    video.volume = 1
  } else {
    video.volume = newVolume
  }
  playerVolume = video.volume    
}

decreaseVolume = () => {
  let newVolume = (video.volume - 0.05).toFixed(2)
  if (newVolume < 0) {
    video.volume = 0
  } else {
    video.volume = newVolume
  }
  playerVolume = video.volume
}

decreaseSpeed = () => {
  if (video.playbackRate > 0.5) {
    video.playbackRate = (video.playbackRate - 0.05).toFixed(2)   
  }
}

increaseSpeed = () => {
  if (video.playbackRate < 2) {
    video.playbackRate = (video.playbackRate + 0.05).toFixed(2)
  }
}

goFullscreen = () => {
  player.webkitRequestFullscreen()
  goFs.style.display = 'none'
  exitFs.style.display = 'inline-block'
}

exitFullscreen = () => {
  document.webkitExitFullscreen()
  exitFs.style.display = 'none'
  goFs.style.display = 'inline-block'
}

toggleFullscreen = () => {
  if (!document.webkitFullscreenElement) {
    goFullscreen()
  } else {
    exitFullscreen()
  }
}

// EVENT LISTENERS
video.addEventListener('loadedmetadata', handleLoadedMetadata);
video.addEventListener('timeupdate', handleTimeUpdate);
video.addEventListener('volumechange', handleVolumeChange);
video.addEventListener('ratechange', handlePlaybackRateChange);
video.addEventListener('ended', handleEnded);

progress.addEventListener('input', handleProgressInput);
speed.addEventListener('input', handleSpeedInput);
volume.addEventListener('input', handleVolumeInput);

keys.addEventListener('click', showMenu);
closeMenu.addEventListener('click', hideMenu);
backdrop.addEventListener('click', hideMenu);

prev.addEventListener('click', () => loadVideoFromList(fileIndex - 1));
back15.addEventListener('click', ()=> jump(-15));
back5.addEventListener('click', ()=> jump(-5));
playPause.addEventListener('click', togglePlayPause);
forward5.addEventListener('click', ()=> jump(5));
forward15.addEventListener('click', ()=> jump(15));
next.addEventListener('click', () => loadVideoFromList(fileIndex + 1));

mute.addEventListener('click', toggleMute);

goFs.addEventListener('click', goFullscreen);
exitFs.addEventListener('click', exitFullscreen);

document.onwebkitfullscreenchange = function ( event ) {
  if (!document.webkitFullscreenElement) {
    clearTimeout(controlsTimer)

    controls.style.backgroundColor = '#333'

    fileNameFs.style.display = 'none';

    videoContainer.style.position = 'static'
    videoContainer.style.height = 'calc(100vh - 50px)'
    video.style.cursor = 'default'

    controls.style.display = 'block'

    // keys.style.display = 'inline-block'

    exitFs.style.display = 'none'
    goFs.style.display = 'inline-block'    
  } else {
    controls.style.backgroundColor = 'rgba(0,0,0,0.33)'

    videoContainer.style.position = 'fixed'
    videoContainer.style.top = '0'
    videoContainer.style.left = '0'
    videoContainer.style.height = '100%'

    // keys.style.display = 'none'

    clearTimeout(controlsTimer)

    hideControlsDelayed()
  }
}

// MOUSE EVENTS
controls.addEventListener('mousemove', () => {
  clearTimeout(controlsTimer);
});

videoContainer.addEventListener('mousemove', () => {
  if (document.webkitFullscreenElement) {
    showControls();
  }
});

videoContainer.addEventListener('click', () => {
  togglePlayPause();
});

videoContainer.addEventListener('dblclick', () => {
  toggleFullscreen();
});

progressBar.addEventListener("mousemove", function(e) {
  if (!progress.disabled) {
    let x = e.pageX;
    let progressWidth = window.innerWidth - 24;
    let position = x - 12; //controls padding
    let calculated = position * progress.max / progressWidth;
    
    // console.log('iw', window.innerWidth);  
    // console.log('x', x);
    // console.log('w', progressWidth);
    // console.log('p', position);
    // console.log('c', calculated);
    // console.log('d', video.duration);
    
    let valueToShow = composePositionText(progress.max, (position * progress.max) / progressWidth);
  
    progressBarTooltip.innerHTML = valueToShow;
    progressBarTooltip.style.top = "-30px";
    progressBarTooltip.style.left = position - 33 + "px";
    if (position < 33) {
      progressBarTooltip.style.left = "0";
    }
    if (position > progressWidth - 33) {
      progressBarTooltip.style.left = progressWidth - 66 + "px";
    }
    progressBarTooltip.style.visibility = "visible";
  }

  progress.style.paddingTop = '4px';
  progress2.style.paddingTop = '4px';
});

progressBar.addEventListener("mouseleave", () => {
  progressBarTooltip.style.visibility = "hidden";
  progress.style.paddingTop = '8x';
  progress2.style.paddingTop = '8px';
});


// WINDOW EVENTS

// maximize.addEventListener('click', () => {
//   win.maximize();
// })
// restore.addEventListener('click', () => {
//   win.unmaximize();
// })
// minimize.addEventListener('click', () => {
//   win.minimize();
// })
// close.addEventListener('click', () => {
//   win.close();
// })

// win.on('maximize', () => {
//   maximize.style.display = 'none';
//   restore.style.display = 'block';
  
// })
// win.on('unmaximize', () => {
//   restore.style.display = 'none';
//   maximize.style.display = 'block';
//   // win.setBounds({
//   //   width: 1280
//   // })
//   appHeight = window.innerHeight;
//   appWidth = window.innerWidth;
//   win.setSize(appWidth, appHeight);
// })

// DRAG & DROP EVENTS

videoContainer.ondragover = () => {
  return false;
};

videoContainer.ondragleave = () => {
  return false;
};

videoContainer.ondragend = () => {
  return false;
};

videoContainer.ondrop = e => {
  e.preventDefault();

  file = e.dataTransfer.files[0];
  filePath = file.path.replace('#', '%23');

  if (isFileTypeSupported(filePath)) {
    currentFolder = getPathFolder(filePath);
    fileList = []
    
    fs.readdirSync(currentFolder)
      .forEach(file => {
          let pathTemp = `${currentFolder}\\${file}`
          if(fs.lstatSync(pathTemp).isFile() && isFileTypeSupported(pathTemp)) {
            console.log('File:', file)
            fileList.push((`${currentFolder}\\${file}`).replace('#', '%23'))
          }
      })  
    console.log('File List:', fileList)
    
    fileIndex = fileList.findIndex(file => file == filePath)
    console.log('File Index:', fileIndex)
  
    video.src = filePath
    console.log('File Path:', filePath)
    console.log('Current Folder:', currentFolder)
    document.getElementsByTagName('title')[0].innerHTML = 'mp4Player'
    document.getElementsByTagName('title')[0].innerHTML += '\xa0' + '-' + '\xa0' + file.name.replace('%23', '#');
    fileNameFs.textContent = file.name;
  
    video.playbackRate = playerSpeed
  }    

  return false;
};

document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

// KEY EVENTS
document.addEventListener("keydown", function(e) {
  e.preventDefault();

  if (!progress.disabled) {
    // Space
    if (e.keyCode == 32) togglePlayPause();

    // Left Arrow
    if (e.keyCode == 37) jump(-5);

    // Right Arrow
    if (e.keyCode == 39) jump(5);

    // A
    if (e.keyCode == 65) jump(-15);

    // D
    if (e.keyCode == 68) jump(15);

    // Page Up
    if (e.keyCode == 33) loadVideoFromList(fileIndex - 1);

    // Page Down
    if (e.keyCode == 34) loadVideoFromList(fileIndex + 1);

    // Home
    if (e.keyCode == 36) jumpToStart();
  }  

  // Up Arrow
  if (e.keyCode == 38) increaseVolume();

  // Down Arrow
  if (e.keyCode == 40) decreaseVolume();

  // M
  if (e.keyCode == 77) toggleMute();

  // W
  if (e.keyCode == 87) increaseSpeed();

  // S
  if (e.keyCode == 83) decreaseSpeed();

  // Enter & F
  if (e.keyCode == 13 || e.keyCode == 70) toggleFullscreen();
})

// FUNCTIONS
function hideControlsDelayed() {
  controlsTimer = setTimeout(() => {
    controls.style.display = 'none';
    video.style.cursor = 'none';
    fileNameFs.style.display = 'none';
  }, 3000);
}

function showControls() {
  controls.style.display = 'block';
  video.style.cursor = 'default';
  fileNameFs.style.display = 'block';
  clearInterval(controlsTimer);
  hideControlsDelayed();
}

function getHours(duration) {
  let result = Math.floor(duration / 3600);
  if (result < 10) result = '0' + result;
  return result;
}

function getMinutes(duration) {
  let result;
  if (duration < 60) result = 0;
  if (duration >= 60 && duration < 3600) result = Math.floor(duration / 60);
  if (duration >= 3600) result = Math.floor((duration % 3600) / 60);
  if (result < 10) result = '0' + result;
  return result;
}

function getSeconds(duration) {  
  let result = Math.floor(duration % 60);
  if (result < 10) result = '0' + result;
  return result;
}

function composeDurationText(duration) { 
  if (duration < 60) return getSeconds(duration);
  if (duration >= 60 && duration < 3600) return getMinutes(duration) + ':' + getSeconds(duration);
  if (duration >= 3600) return getHours(duration) + ':' + getMinutes(duration) + ':' + getSeconds(duration);
}

function composePositionText(duration, position) { 
  if (duration < 60) return getSeconds(position);
  if (duration >= 60 && duration < 3600) return getMinutes(position) + ':' + getSeconds(position);
  if (duration >= 3600) return getHours(position) + ':' + getMinutes(position) + ':' + getSeconds(position);
}
function primePositionText(duration) { 
  if (duration < 60) return '00';
  if (duration >= 60 && duration < 3600) return '00:00';
  if (duration >= 3600) return '00:00:00';
}

function getPathFolder(path) {
  let indexOfLastSlash = path.lastIndexOf('\\');
  let folderPath = path.substring(0, indexOfLastSlash);
  return folderPath;
}

function getFileName(path) {
  let indexOfLastSlash = path.lastIndexOf('\\');
  let fileName = path.substring(indexOfLastSlash + 1, path.length);
  return fileName;
}

function isFileTypeSupported(path) {
  let ext = path.substr(path.length - 3).toUpperCase();
  return fileTypes.includes(ext);
}