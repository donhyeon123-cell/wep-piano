const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const sampleMap = {};
const notes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'];

const fileNameMap = {
  'C#4': 'C%234',
  'D#4': 'D%234',
  'F#4': 'F%234',
  'G#4': 'G%234',
  'A#4': 'A%234'
};


const bass = audioCtx.createBiquadFilter();
bass.type = "lowshelf";
bass.frequency.value = 200;

const mid = audioCtx.createBiquadFilter();
mid.type = "peaking";
mid.frequency.value = 1000;
mid.Q.value = 1;

const treble = audioCtx.createBiquadFilter();
treble.type = "highshelf";
treble.frequency.value = 3000;

const gainNode = audioCtx.createGain();
gainNode.gain.value = 0.3;

bass.connect(mid);
mid.connect(treble);
treble.connect(gainNode);
gainNode.connect(audioCtx.destination);

async function loadSample(note) {
  const mappedName = fileNameMap[note] || note;  // 매핑 없으면 원래 이름 사용
  const response = await fetch(`${mappedName}.mp3`);
  if (!response.ok) {
    throw new Error(`파일을 불러오지 못했습니다: ${note}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}


async function loadAllSamples() {
  for (const note of notes) {
    sampleMap[note] = await loadSample(note);
  }
}

function playSample(note) {
  const buffer = sampleMap[note];
  if (!buffer) return;

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(bass);
  source.start();
}

function setupKeys() {
  const whiteKeys = document.querySelectorAll('.white-key');
  const whiteNoteNames = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

  whiteKeys.forEach((key, i) => {
    const note = whiteNoteNames[i];
    key.addEventListener('click', () => playSample(note));
  }); 

  const blackKeys = document.querySelectorAll('.black-key');
  const blackNoteNames = ['C#4', 'D#4', null, 'F#4', 'G#4', 'A#4'];

  blackKeys.forEach((key, i) => {
    const note = blackNoteNames[i];
    if (note) {
      key.addEventListener('click', () => playSample(note));
    }
  });
}

document.getElementById('bass').oninput = e => bass.gain.value = parseFloat(e.target.value);
document.getElementById('mid').oninput = e => mid.gain.value = parseFloat(e.target.value);
document.getElementById('treble').oninput = e => treble.gain.value = parseFloat(e.target.value);

loadAllSamples().then(setupKeys);
