const notesInput = document.getElementById("notes-input");
const playBtn = document.getElementById("play-btn");
const stopBtn = document.getElementById("stop-btn");
const sampleBtn = document.getElementById("sample-btn");
const studioTabButtons = document.querySelectorAll(".studio-tab");
const studioPanels = document.querySelectorAll(".studio-panel");
const kuthuOutput = document.getElementById("kuthu-output");
const kuthuGenerateBtn = document.getElementById("kuthu-generate");
const kuthuApplyBtn = document.getElementById("kuthu-apply");
const kuthuPresetBtn = document.getElementById("kuthu-preset");
const themeButtons = document.querySelectorAll(".mode-btn");
const playgroundButtons = document.querySelectorAll(".playground-btn");
const notationButtons = document.querySelectorAll(".notation-btn");
const rangeButtons = document.querySelectorAll(".range-btn");
const keyHint = document.querySelector(".key-hint");
const noteFormat = document.getElementById("note-format");
const tempoRange = document.getElementById("tempo");
const tempoValue = document.getElementById("tempo-value");
const fallRange = document.getElementById("fall");
const fallValue = document.getElementById("fall-value");
const audioToggle = document.getElementById("audio-toggle");
const volumeRange = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");
const soundSelect = document.getElementById("sound-select");
const loopToggle = document.getElementById("loop");
const mapToggle = document.getElementById("map-toggle");
const statusEl = document.getElementById("status");
const fallZone = document.getElementById("fall-zone");

const SAMPLE = "C4:1 D4:1 E4:1 F4:1 G4:1 A4:1 B4:1 C5:2";
const CARNATIC_SAMPLE = "S4:1 R4:1 G4:1 M4:1 P4:1 D4:1 N4:1 S5:2";
const KUTHU_PRESET = { tempo: 128, fall: 950, sound: "saw-lead" };
const KUTHU_PULSE = 0.5;
const DEFAULT_SOUND = "grand-piano";
const DEFAULT_ENVELOPE = {
  attack: 0.01,
  decay: 0.2,
  sustain: 0.6,
  release: 0.2,
  peak: 0.9,
};
const SOUND_PRESETS = {
  "grand-piano": {
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.35, peak: 0.9 },
    oscillators: [
      { type: "triangle", gain: 0.6 },
      { type: "sine", gain: 0.35 },
      { type: "triangle", gain: 0.12, detune: -6 },
      { type: "triangle", gain: 0.12, detune: 6 },
    ],
    filter: { type: "lowpass", frequency: 8000, Q: 0.8 },
  },
  "bright-piano": {
    envelope: { attack: 0.005, decay: 0.25, sustain: 0.2, release: 0.3, peak: 0.95 },
    oscillators: [
      { type: "sawtooth", gain: 0.45 },
      { type: "triangle", gain: 0.35 },
      { type: "square", gain: 0.1, detune: 5 },
    ],
    filter: { type: "lowpass", frequency: 10000, Q: 0.7 },
  },
  "electric-piano": {
    envelope: { attack: 0.01, decay: 0.4, sustain: 0.4, release: 0.6, peak: 0.85 },
    oscillators: [
      { type: "sine", gain: 0.6 },
      { type: "triangle", gain: 0.35 },
      { type: "sine", gain: 0.2, detune: -7 },
      { type: "sine", gain: 0.2, detune: 7 },
    ],
    filter: { type: "lowpass", frequency: 6000, Q: 0.9 },
    tremolo: { rate: 4.5, depth: 0.2 },
  },
  "honky-tonk": {
    envelope: { attack: 0.005, decay: 0.28, sustain: 0.15, release: 0.25, peak: 0.9 },
    oscillators: [
      { type: "triangle", gain: 0.5, detune: -18 },
      { type: "triangle", gain: 0.5, detune: 18 },
      { type: "sine", gain: 0.2 },
    ],
    filter: { type: "lowpass", frequency: 7500, Q: 0.7 },
  },
  "acoustic-guitar": {
    envelope: { attack: 0.005, decay: 0.45, sustain: 0.05, release: 0.15, peak: 0.9 },
    oscillators: [
      { type: "triangle", gain: 0.5 },
      { type: "sine", gain: 0.25 },
      { type: "triangle", gain: 0.2, detune: 5 },
    ],
    filter: { type: "lowpass", frequency: 4000, Q: 0.8 },
  },
  "electric-guitar": {
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.25, peak: 0.8 },
    oscillators: [
      { type: "sawtooth", gain: 0.45 },
      { type: "triangle", gain: 0.3 },
      { type: "square", gain: 0.15, detune: 4 },
    ],
    filter: { type: "lowpass", frequency: 5000, Q: 0.9 },
  },
  "distortion-guitar": {
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.2, peak: 0.8 },
    oscillators: [
      { type: "square", gain: 0.55 },
      { type: "sawtooth", gain: 0.35 },
    ],
    filter: { type: "lowpass", frequency: 3500, Q: 1.2 },
    drive: 0.6,
  },
  "bass-guitar": {
    envelope: { attack: 0.005, decay: 0.25, sustain: 0.6, release: 0.3, peak: 0.85 },
    oscillators: [
      { type: "triangle", gain: 0.6 },
      { type: "sine", gain: 0.35 },
      { type: "square", gain: 0.12, octave: -1 },
    ],
    filter: { type: "lowpass", frequency: 1200, Q: 0.8 },
  },
  flute: {
    envelope: { attack: 0.08, decay: 0.1, sustain: 0.85, release: 0.25, peak: 0.7 },
    oscillators: [
      { type: "sine", gain: 0.8 },
      { type: "triangle", gain: 0.15 },
    ],
    filter: { type: "lowpass", frequency: 5200, Q: 0.7 },
    vibrato: { rate: 5.2, depth: 12 },
  },
  recorder: {
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.75, release: 0.2, peak: 0.65 },
    oscillators: [
      { type: "triangle", gain: 0.6 },
      { type: "sine", gain: 0.2 },
    ],
    filter: { type: "lowpass", frequency: 4200, Q: 0.7 },
    vibrato: { rate: 5, depth: 8 },
  },
  "pan-flute": {
    envelope: { attack: 0.07, decay: 0.1, sustain: 0.8, release: 0.3, peak: 0.7 },
    oscillators: [
      { type: "sine", gain: 0.7 },
      { type: "triangle", gain: 0.2 },
    ],
    filter: { type: "lowpass", frequency: 4800, Q: 0.7 },
    vibrato: { rate: 4.2, depth: 10 },
  },
  oboe: {
    envelope: { attack: 0.03, decay: 0.2, sustain: 0.6, release: 0.22, peak: 0.7 },
    oscillators: [
      { type: "sawtooth", gain: 0.5 },
      { type: "square", gain: 0.15 },
    ],
    filter: { type: "lowpass", frequency: 3800, Q: 1.1 },
  },
  clarinet: {
    envelope: { attack: 0.03, decay: 0.2, sustain: 0.6, release: 0.22, peak: 0.7 },
    oscillators: [
      { type: "square", gain: 0.55 },
      { type: "triangle", gain: 0.2 },
    ],
    filter: { type: "lowpass", frequency: 3200, Q: 1.0 },
  },
  saxophone: {
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.65, release: 0.25, peak: 0.75 },
    oscillators: [
      { type: "sawtooth", gain: 0.5 },
      { type: "square", gain: 0.2 },
    ],
    filter: { type: "lowpass", frequency: 4200, Q: 1.0 },
    drive: 0.2,
  },
  violin: {
    envelope: { attack: 0.06, decay: 0.2, sustain: 0.75, release: 0.35, peak: 0.75 },
    oscillators: [
      { type: "sawtooth", gain: 0.45 },
      { type: "triangle", gain: 0.25 },
      { type: "sawtooth", gain: 0.2, detune: 4 },
    ],
    filter: { type: "lowpass", frequency: 6000, Q: 0.8 },
    vibrato: { rate: 5.3, depth: 14 },
  },
  viola: {
    envelope: { attack: 0.07, decay: 0.22, sustain: 0.7, release: 0.35, peak: 0.7 },
    oscillators: [
      { type: "sawtooth", gain: 0.45 },
      { type: "triangle", gain: 0.25 },
    ],
    filter: { type: "lowpass", frequency: 5000, Q: 0.85 },
    vibrato: { rate: 5.1, depth: 12 },
  },
  cello: {
    envelope: { attack: 0.08, decay: 0.25, sustain: 0.7, release: 0.4, peak: 0.7 },
    oscillators: [
      { type: "sawtooth", gain: 0.4 },
      { type: "triangle", gain: 0.3 },
      { type: "sine", gain: 0.2, octave: -1 },
    ],
    filter: { type: "lowpass", frequency: 3500, Q: 0.9 },
    vibrato: { rate: 4.8, depth: 10 },
  },
  "string-ensemble": {
    envelope: { attack: 0.12, decay: 0.3, sustain: 0.8, release: 0.5, peak: 0.7 },
    oscillators: [
      { type: "sawtooth", gain: 0.35 },
      { type: "sawtooth", gain: 0.35, detune: -6 },
      { type: "sawtooth", gain: 0.35, detune: 6 },
      { type: "triangle", gain: 0.2 },
    ],
    filter: { type: "lowpass", frequency: 4500, Q: 0.8 },
    vibrato: { rate: 5, depth: 8 },
  },
  "pizzicato-strings": {
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.1, release: 0.12, peak: 0.85 },
    oscillators: [
      { type: "triangle", gain: 0.5 },
      { type: "sine", gain: 0.2 },
    ],
    filter: { type: "lowpass", frequency: 4200, Q: 0.8 },
  },
  trumpet: {
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.65, release: 0.2, peak: 0.8 },
    oscillators: [
      { type: "sawtooth", gain: 0.5 },
      { type: "square", gain: 0.2 },
    ],
    filter: { type: "lowpass", frequency: 5000, Q: 0.9 },
    vibrato: { rate: 5, depth: 8 },
  },
  trombone: {
    envelope: { attack: 0.04, decay: 0.2, sustain: 0.65, release: 0.25, peak: 0.75 },
    oscillators: [
      { type: "sawtooth", gain: 0.5 },
      { type: "triangle", gain: 0.2 },
    ],
    filter: { type: "lowpass", frequency: 3500, Q: 0.9 },
    vibrato: { rate: 4.5, depth: 6 },
  },
  "french-horn": {
    envelope: { attack: 0.06, decay: 0.25, sustain: 0.6, release: 0.3, peak: 0.7 },
    oscillators: [
      { type: "triangle", gain: 0.45 },
      { type: "sawtooth", gain: 0.25 },
    ],
    filter: { type: "lowpass", frequency: 2600, Q: 0.9 },
    vibrato: { rate: 4.2, depth: 6 },
  },
  "brass-section": {
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.3, peak: 0.75 },
    oscillators: [
      { type: "sawtooth", gain: 0.4 },
      { type: "sawtooth", gain: 0.35, detune: -5 },
      { type: "sawtooth", gain: 0.35, detune: 5 },
      { type: "square", gain: 0.15 },
    ],
    filter: { type: "lowpass", frequency: 4800, Q: 0.9 },
  },
  "synth-lead": {
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.18, peak: 0.85 },
    oscillators: [
      { type: "square", gain: 0.45 },
      { type: "sawtooth", gain: 0.35 },
    ],
    filter: { type: "lowpass", frequency: 8000, Q: 0.8 },
    vibrato: { rate: 5, depth: 5 },
  },
  "warm-pad": {
    envelope: { attack: 0.4, decay: 0.3, sustain: 0.85, release: 0.6, peak: 0.6 },
    oscillators: [
      { type: "sawtooth", gain: 0.35, detune: -8 },
      { type: "sawtooth", gain: 0.35, detune: 8 },
      { type: "triangle", gain: 0.2 },
    ],
    filter: { type: "lowpass", frequency: 2200, Q: 0.8 },
  },
  "choir-pad": {
    envelope: { attack: 0.35, decay: 0.3, sustain: 0.8, release: 0.7, peak: 0.6 },
    oscillators: [
      { type: "triangle", gain: 0.4 },
      { type: "sine", gain: 0.3 },
      { type: "triangle", gain: 0.25, detune: 3 },
    ],
    filter: { type: "lowpass", frequency: 2000, Q: 0.8 },
    vibrato: { rate: 4.2, depth: 6 },
  },
  "ambient-pad": {
    envelope: { attack: 0.6, decay: 0.4, sustain: 0.9, release: 1.0, peak: 0.55 },
    oscillators: [
      { type: "sine", gain: 0.35 },
      { type: "sawtooth", gain: 0.25, detune: -12 },
      { type: "sawtooth", gain: 0.25, detune: 12 },
    ],
    filter: { type: "lowpass", frequency: 1800, Q: 0.9 },
  },
  "saw-lead": {
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.65, release: 0.18, peak: 0.85 },
    oscillators: [
      { type: "sawtooth", gain: 0.7 },
      { type: "sawtooth", gain: 0.25, detune: 5 },
    ],
    filter: { type: "lowpass", frequency: 9500, Q: 0.7 },
  },
  "drum-kit": {
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.08, peak: 0.9 },
    oscillators: [
      { type: "sine", gain: 0.4, octave: -1 },
      { type: "square", gain: 0.15 },
    ],
    noise: { gain: 0.3, duration: 0.2, filter: { type: "highpass", frequency: 700, Q: 0.7 } },
  },
  tabla: {
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.12, peak: 0.8 },
    oscillators: [
      { type: "sine", gain: 0.5 },
      { type: "triangle", gain: 0.15 },
    ],
    noise: { gain: 0.25, duration: 0.25, filter: { type: "bandpass", frequency: 800, Q: 1.4 } },
  },
  conga: {
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.1, peak: 0.8 },
    oscillators: [
      { type: "triangle", gain: 0.4 },
      { type: "sine", gain: 0.15, octave: -1 },
    ],
    noise: { gain: 0.2, duration: 0.2, filter: { type: "bandpass", frequency: 500, Q: 1.2 } },
  },
  "electronic-drums": {
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.08, peak: 0.85 },
    oscillators: [
      { type: "square", gain: 0.45 },
      { type: "sawtooth", gain: 0.2, octave: -1 },
    ],
    noise: { gain: 0.2, duration: 0.15, filter: { type: "highpass", frequency: 1200, Q: 0.7 } },
    drive: 0.4,
  },
};
const DEFAULT_OSCILLATORS = [
  { type: "triangle", gain: 0.6 },
  { type: "sine", gain: 0.25 },
];

const state = {
  playing: false,
  raf: 0,
  startTime: 0,
  notes: [],
  sequence: [],
  fallMs: Number(fallRange.value),
  beatMs: 60000 / Number(tempoRange.value),
  totalMs: 0,
  activeCounts: new Map(),
  manualActive: new Set(),
  notationMode: "western",
  keyboardRange: "lower",
};

const audioState = {
  ctx: null,
  master: null,
  enabled: audioToggle.checked,
  volume: Number(volumeRange.value) / 100,
  voices: new Set(),
  manualVoices: new Map(),
  sound: DEFAULT_SOUND,
  noiseBuffer: null,
};

const keyMap = new Map();
let keyboardMap = {};
const pressedKeys = new Set();

function buildKeyMap() {
  keyMap.clear();
  document.querySelectorAll(".key[data-note]").forEach((key) => {
    keyMap.set(key.dataset.note, key);
  });
}

function buildKeyboardMap(baseOctave) {
  const map = {};
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];
  const lowerWhite = ["z", "x", "c", "v", "b", "n", "m"];
  const upperWhite = ["a", "s", "d", "f", "g", "h", "j"];
  const lowerBlack = ["2", "3", "5", "6", "7"];
  const upperBlack = ["w", "e", "t", "y", "u"];

  lowerWhite.forEach((key, index) => {
    map[key] = `${whiteKeys[index]}${baseOctave}`;
  });
  upperWhite.forEach((key, index) => {
    map[key] = `${whiteKeys[index]}${baseOctave + 1}`;
  });
  lowerBlack.forEach((key, index) => {
    map[key] = `${blackKeys[index]}${baseOctave}`;
  });
  upperBlack.forEach((key, index) => {
    map[key] = `${blackKeys[index]}${baseOctave + 1}`;
  });

  return map;
}

function buildKeyLabels() {
  const mapping = new Map();
  Object.entries(keyboardMap).forEach(([key, note]) => {
    if (!mapping.has(note)) {
      mapping.set(note, []);
    }
    mapping.get(note).push(key);
  });

  document.querySelectorAll(".key .key-map").forEach((el) => el.remove());
  mapping.forEach((keys, note) => {
    const keyEl = keyMap.get(note);
    if (!keyEl) return;
    const label = document.createElement("span");
    label.className = "key-map";
    label.textContent = keys.join(" / ");
    keyEl.appendChild(label);
  });
}

function updateKeyboardRange(range) {
  state.keyboardRange = range;
  const baseOctave = range === "upper" ? 4 : 3;
  keyboardMap = buildKeyboardMap(baseOctave);
  buildKeyLabels();
  if (keyHint) {
    const rangeLabel = range === "upper" ? "C4–B5" : "C3–B4";
    keyHint.textContent =
      `Keyboard (${rangeLabel}): ` +
      "Z X C V B N M = lower octave, A S D F G H J = upper octave, " +
      "W E T Y U and 2 3 5 6 7 = black keys.";
    if (state.notationMode === "carnatic") {
      keyHint.textContent += " Swaras map to C major (Sa=C, Ri=D, Ga=E, Ma=F, Pa=G, Dha=A, Ni=B).";
    }
  }
}

function setStudioTab(tabName) {
  if (!studioTabButtons.length || !studioPanels.length) return;
  studioTabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  studioPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === tabName;
    panel.classList.toggle("is-active", isActive);
    panel.setAttribute("aria-hidden", String(!isActive));
  });
}

const CARNATIC_MAP = {
  S: "C",
  SA: "C",
  R: "D",
  RI: "D",
  G: "E",
  GA: "E",
  M: "F",
  MA: "F",
  P: "G",
  PA: "G",
  D: "A",
  DHA: "A",
  N: "B",
  NI: "B",
};

function normalizeCarnatic(token) {
  const match = token.match(/^([A-Za-z]+)([#b]?)(\d)?$/);
  if (!match) return null;
  const swara = match[1].toUpperCase();
  const base = CARNATIC_MAP[swara];
  if (!base) return null;
  const octave = match[3] ? Number(match[3]) : 4;
  if (!Number.isFinite(octave)) return null;
  return `${base}${match[2] || ""}${octave}`;
}

function isRestToken(token, mode) {
  if (mode === "carnatic") {
    return /^(rest|-)$/i.test(token);
  }
  return /^(r|rest|-)$/i.test(token);
}

function getDisplayName(note) {
  if (state.notationMode !== "carnatic") return note;
  if (note.includes("#") || note.includes("b")) return note;
  const letter = note[0];
  const octave = note.match(/\d$/)?.[0] || "";
  const swara = {
    C: "Sa",
    D: "Ri",
    E: "Ga",
    F: "Ma",
    G: "Pa",
    A: "Dha",
    B: "Ni",
  }[letter];
  return swara ? `${swara}${octave}` : note;
}

function normalizeNote(token) {
  const match = token.match(/^([A-Ga-g])([#b]?)(\d)$/);
  if (!match) return null;
  const letter = match[1].toUpperCase();
  const accidental = match[2];
  const octave = match[3];
  if (accidental === "b") {
    const flat = `${letter}b`;
    const flatMap = {
      Db: "C#",
      Eb: "D#",
      Gb: "F#",
      Ab: "G#",
      Bb: "A#",
    };
    return flatMap[flat] ? `${flatMap[flat]}${octave}` : null;
  }
  return `${letter}${accidental}${octave}`;
}

const NOTE_OFFSETS = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
};
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteToMidi(note) {
  const match = note.match(/^([A-G])(#?)(\d)$/);
  if (!match) return null;
  const key = `${match[1]}${match[2]}`;
  const offset = NOTE_OFFSETS[key];
  if (offset === undefined) return null;
  const octave = Number(match[3]);
  if (!Number.isFinite(octave)) return null;
  return (octave + 1) * 12 + offset;
}

function midiToNote(midi) {
  if (!Number.isFinite(midi)) return null;
  const rounded = Math.round(midi);
  const octave = Math.floor(rounded / 12) - 1;
  const pitch = ((rounded % 12) + 12) % 12;
  const name = NOTE_NAMES[pitch];
  if (!name) return null;
  return `${name}${octave}`;
}

function noteToFrequency(note) {
  const match = note.match(/^([A-G])(#?)(\d)$/);
  if (!match) return null;
  const key = `${match[1]}${match[2]}`;
  const octave = Number(match[3]);
  if (!Object.prototype.hasOwnProperty.call(NOTE_OFFSETS, key)) return null;
  const midi = (octave + 1) * 12 + NOTE_OFFSETS[key];
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function getPitchClass(note) {
  const match = note.match(/^([A-G])(#?)/);
  return match ? `${match[1]}${match[2]}` : null;
}

function getOctave(note) {
  const match = note.match(/(\d)$/);
  return match ? Number(match[1]) : null;
}

function transposeNote(note, semitones) {
  const midi = noteToMidi(note);
  if (midi === null) return null;
  return midiToNote(midi + semitones);
}

function transposePitchClass(pitchClass, semitones) {
  const baseMidi = noteToMidi(`${pitchClass}4`);
  if (baseMidi === null) return pitchClass;
  const transposed = midiToNote(baseMidi + semitones);
  return transposed ? getPitchClass(transposed) : pitchClass;
}

function getKeyboardMidiRange() {
  let min = Infinity;
  let max = -Infinity;
  keyMap.forEach((_el, note) => {
    const midi = noteToMidi(note);
    if (midi === null) return;
    min = Math.min(min, midi);
    max = Math.max(max, midi);
  });
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min, max };
}

function clampNoteToRange(note, range) {
  if (!range) return note;
  const midi = noteToMidi(note);
  if (midi === null) return note;
  const clamped = Math.min(range.max, Math.max(range.min, midi));
  return midiToNote(clamped) || note;
}

function getSoundPreset() {
  return SOUND_PRESETS[audioState.sound] || SOUND_PRESETS[DEFAULT_SOUND];
}

function buildNoiseBuffer() {
  if (!audioState.ctx) return null;
  const ctx = audioState.ctx;
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function getNoiseBuffer() {
  if (!audioState.noiseBuffer) {
    audioState.noiseBuffer = buildNoiseBuffer();
  }
  return audioState.noiseBuffer;
}

function makeDistortionCurve(amount) {
  const k = Math.max(0, Math.min(amount, 1)) * 50;
  const n = 44100;
  const curve = new Float32Array(n);
  const deg = Math.PI / 180;
  for (let i = 0; i < n; i += 1) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function applyEnvelope(gainParam, env, now, stopAt) {
  const attack = Math.max(0.001, env.attack ?? DEFAULT_ENVELOPE.attack);
  const decay = Math.max(0, env.decay ?? DEFAULT_ENVELOPE.decay);
  const sustain = Math.max(0.0001, env.sustain ?? DEFAULT_ENVELOPE.sustain);
  const release = Math.max(0.02, env.release ?? DEFAULT_ENVELOPE.release);
  const peak = Math.max(0.05, env.peak ?? DEFAULT_ENVELOPE.peak);

  gainParam.setValueAtTime(0.0001, now);
  gainParam.linearRampToValueAtTime(peak, now + attack);
  gainParam.linearRampToValueAtTime(peak * sustain, now + attack + decay);

  if (typeof stopAt === "number") {
    gainParam.setValueAtTime(peak * sustain, stopAt);
    gainParam.linearRampToValueAtTime(0.0001, stopAt + release);
  }
}

function stopVoiceNodes(voice, stopAt) {
  if (!voice) return;
  voice.oscillators.forEach((osc) => {
    try {
      osc.stop(stopAt);
    } catch (error) {
      // Ignore stale nodes.
    }
  });
  voice.noiseSources?.forEach((source) => {
    try {
      source.stop(stopAt);
    } catch (error) {
      // Ignore stale nodes.
    }
  });
  voice.lfos?.forEach((osc) => {
    try {
      osc.stop(stopAt);
    } catch (error) {
      // Ignore stale nodes.
    }
  });
}

function scheduleVoiceCleanup(voice, stopAt) {
  if (!audioState.ctx || !voice || !stopAt) return;
  const delayMs = Math.max(0, (stopAt - audioState.ctx.currentTime) * 1000 + 60);
  window.setTimeout(() => {
    audioState.voices.delete(voice);
  }, delayMs);
}

function createVoice(frequency, durationMs, isManual) {
  if (!audioState.ctx) return null;
  const preset = getSoundPreset();
  const env = { ...DEFAULT_ENVELOPE, ...(preset.envelope || {}) };
  const now = audioState.ctx.currentTime;

  const mix = audioState.ctx.createGain();
  mix.gain.setValueAtTime(1, now);

  let lastNode = mix;
  if (preset.drive) {
    const drive = audioState.ctx.createWaveShaper();
    drive.curve = makeDistortionCurve(preset.drive);
    drive.oversample = "4x";
    lastNode.connect(drive);
    lastNode = drive;
  }

  if (preset.filter) {
    const filter = audioState.ctx.createBiquadFilter();
    filter.type = preset.filter.type || "lowpass";
    filter.frequency.setValueAtTime(preset.filter.frequency || 8000, now);
    filter.Q.setValueAtTime(preset.filter.Q ?? 0.7, now);
    if (typeof preset.filter.gain === "number") {
      filter.gain.setValueAtTime(preset.filter.gain, now);
    }
    lastNode.connect(filter);
    lastNode = filter;
  }

  const output = audioState.ctx.createGain();
  output.gain.setValueAtTime(0.0001, now);
  lastNode.connect(output);

  let finalNode = output;
  const lfos = [];

  if (preset.tremolo) {
    const tremoloGain = audioState.ctx.createGain();
    const depth = Math.max(0, Math.min(preset.tremolo.depth ?? 0.2, 0.95));
    tremoloGain.gain.setValueAtTime(1 - depth, now);
    output.connect(tremoloGain);
    finalNode = tremoloGain;

    const tremoloOsc = audioState.ctx.createOscillator();
    const tremoloAmp = audioState.ctx.createGain();
    tremoloOsc.type = "sine";
    tremoloOsc.frequency.setValueAtTime(preset.tremolo.rate ?? 4, now);
    tremoloAmp.gain.setValueAtTime(depth, now);
    tremoloOsc.connect(tremoloAmp);
    tremoloAmp.connect(tremoloGain.gain);
    tremoloOsc.start(now);
    lfos.push(tremoloOsc);
  }

  finalNode.connect(audioState.master);

  const voice = {
    output,
    oscillators: [],
    noiseSources: [],
    lfos,
    envelope: env,
    sustainLevel: env.peak * env.sustain,
  };

  const oscillatorDefs =
    preset.oscillators && preset.oscillators.length
      ? preset.oscillators
      : DEFAULT_OSCILLATORS;

  oscillatorDefs.forEach((oscDef) => {
    const osc = audioState.ctx.createOscillator();
    const gain = audioState.ctx.createGain();
    const octave = oscDef.octave || 0;
    osc.type = oscDef.type || "triangle";
    osc.frequency.setValueAtTime(
      frequency * Math.pow(2, octave),
      now
    );
    if (oscDef.detune) {
      osc.detune.setValueAtTime(oscDef.detune, now);
    }
    gain.gain.setValueAtTime(oscDef.gain ?? 0.4, now);
    osc.connect(gain);
    gain.connect(mix);
    osc.start(now);
    voice.oscillators.push(osc);
  });

  if (preset.vibrato) {
    const vibrato = audioState.ctx.createOscillator();
    const vibratoGain = audioState.ctx.createGain();
    vibrato.type = "sine";
    vibrato.frequency.setValueAtTime(preset.vibrato.rate ?? 5, now);
    vibratoGain.gain.setValueAtTime(preset.vibrato.depth ?? 6, now);
    vibrato.connect(vibratoGain);
    voice.oscillators.forEach((osc) => vibratoGain.connect(osc.detune));
    vibrato.start(now);
    voice.lfos.push(vibrato);
  }

  if (preset.noise) {
    const noiseBuffer = getNoiseBuffer();
    if (noiseBuffer) {
      const source = audioState.ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = false;

      const noiseGain = audioState.ctx.createGain();
      noiseGain.gain.setValueAtTime(preset.noise.gain ?? 0.2, now);

      if (preset.noise.filter) {
        const noiseFilter = audioState.ctx.createBiquadFilter();
        noiseFilter.type = preset.noise.filter.type || "highpass";
        noiseFilter.frequency.setValueAtTime(
          preset.noise.filter.frequency || 1000,
          now
        );
        noiseFilter.Q.setValueAtTime(preset.noise.filter.Q ?? 0.7, now);
        source.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
      } else {
        source.connect(noiseGain);
      }

      noiseGain.connect(mix);
      source.start(now);
      source.stop(now + (preset.noise.duration ?? 0.2));
      voice.noiseSources.push(source);
    }
  }

  const stopAt =
    !isManual && typeof durationMs === "number"
      ? now + durationMs / 1000
      : null;
  applyEnvelope(output.gain, env, now, stopAt);

  if (stopAt) {
    const stopTime = stopAt + env.release + 0.05;
    stopVoiceNodes(voice, stopTime);
    scheduleVoiceCleanup(voice, stopTime);
  }

  return voice;
}

function releaseVoice(voice) {
  if (!voice || !audioState.ctx) return;
  const now = audioState.ctx.currentTime;
  const release = Math.max(0.02, voice.envelope.release ?? DEFAULT_ENVELOPE.release);
  voice.output.gain.cancelScheduledValues(now);
  voice.output.gain.setValueAtTime(
    Number.isFinite(voice.sustainLevel) ? voice.sustainLevel : voice.output.gain.value,
    now
  );
  voice.output.gain.linearRampToValueAtTime(0.0001, now + release);
  stopVoiceNodes(voice, now + release + 0.05);
}

function stopVoiceImmediate(voice) {
  if (!voice || !audioState.ctx) return;
  const now = audioState.ctx.currentTime;
  voice.output.gain.cancelScheduledValues(now);
  voice.output.gain.setValueAtTime(voice.output.gain.value, now);
  voice.output.gain.linearRampToValueAtTime(0.0001, now + 0.05);
  stopVoiceNodes(voice, now + 0.08);
}

function parseBeats(value) {
  if (!value) return 1;
  const cleaned = value.trim();
  if (!cleaned) return 1;
  if (cleaned.includes("/")) {
    const [num, den] = cleaned.split("/");
    const numerator = Number(num);
    const denominator = Number(den);
    if (
      !Number.isFinite(numerator) ||
      !Number.isFinite(denominator) ||
      denominator === 0
    ) {
      return null;
    }
    return numerator / denominator;
  }
  const beats = Number(cleaned);
  if (!Number.isFinite(beats)) return null;
  return beats;
}

function inferDefaultOctave(raw) {
  const match = raw.match(/[A-Ga-g][#b]?\d/);
  if (match) {
    const digit = match[0].match(/\d/);
    if (digit) return Number(digit[0]);
  }
  return 4;
}

function tokenizeWesternRaw(raw) {
  const tokens = [];
  if (!raw) return tokens;
  const input = String(raw);
  let i = 0;

  while (i < input.length) {
    const char = input[i];
    if (char === "|") {
      tokens.push("|");
      i += 1;
      continue;
    }
    if (char === "-") {
      tokens.push("R");
      i += 1;
      continue;
    }
    if (/\s|,/.test(char)) {
      i += 1;
      continue;
    }

    const upper = char.toUpperCase();
    if (upper === "R") {
      let j = i;
      const restMatch = input.slice(i).match(/^(rest)/i);
      if (restMatch) {
        j += restMatch[0].length;
      } else {
        j += 1;
      }
      let beat = "";
      if (input[j] === ":") {
        j += 1;
        while (j < input.length && /[\d/]/.test(input[j])) {
          beat += input[j];
          j += 1;
        }
      }
      tokens.push(beat ? `R:${beat}` : "R");
      i = j;
      continue;
    }

    if (/[A-Ga-g]/.test(char)) {
      let token = upper;
      i += 1;
      if (input[i] === "#" || input[i] === "b") {
        token += input[i];
        i += 1;
      }
      if (/\d/.test(input[i])) {
        token += input[i];
        i += 1;
      }
      if (input[i] === ":") {
        i += 1;
        let beat = "";
        while (i < input.length && /[\d/]/.test(input[i])) {
          beat += input[i];
          i += 1;
        }
        if (beat) {
          token += `:${beat}`;
        }
      }
      tokens.push(token);
      continue;
    }

    i += 1;
  }

  return tokens;
}

function normalizeWesternInput(raw) {
  const tokens = tokenizeWesternRaw(raw);
  if (!tokens.length) {
    return { value: raw.trim(), changed: false };
  }

  let changed = false;
  let lastOctave = inferDefaultOctave(raw);

  const normalized = tokens
    .map((token) => {
      if (token === "|") return "|";
      if (/^R(?::|$)/i.test(token)) return token.toUpperCase();
      const match = token.match(/^([A-G])([#b]?)(\d)?(?::([\d/]+))?$/);
      if (!match) return null;
      const octave = match[3] ? Number(match[3]) : lastOctave;
      if (match[3]) {
        lastOctave = Number(match[3]);
      } else {
        changed = true;
      }
      const note = `${match[1]}${match[2] || ""}${octave}`;
      if (match[4]) return `${note}:${match[4]}`;
      return note;
    })
    .filter(Boolean);

  const value = normalized.join(" ").replace(/\s+\|\s+/g, " | ");
  if (value !== raw.trim()) changed = true;
  return { value, changed };
}

function normalizeInputForPlayback(raw) {
  if (state.notationMode !== "western") {
    return { value: raw.trim(), changed: false };
  }
  return normalizeWesternInput(raw);
}

function parseToken(token, mode) {
  const parts = token.split(":");
  if (parts.length > 2) return null;
  const notePart = parts[0];
  const beats = parseBeats(parts[1]);
  if (!beats || beats <= 0) return null;
  if (isRestToken(notePart, mode)) {
    return { rest: true, beats };
  }
  const normalized =
    mode === "carnatic" ? normalizeCarnatic(notePart) : normalizeNote(notePart);
  if (!normalized) return null;
  return { note: normalized, beats, rest: false };
}

function parseNotes(raw) {
  const tokens = raw
    .replace(/\n/g, " ")
    .replace(/\|/g, " | ")
    .split(/\s+|,/)
    .map((token) => token.trim())
    .filter(Boolean);

  const events = [];
  const ignored = [];

  tokens.forEach((token) => {
    if (token === "|") return;
    const parsed = parseToken(token, state.notationMode);
    if (!parsed) {
      ignored.push(token);
      return;
    }
    if (parsed.rest) {
      events.push(parsed);
      return;
    }
    if (!keyMap.has(parsed.note)) {
      ignored.push(token);
      return;
    }
    events.push(parsed);
  });

  return { events, ignored };
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

function formatBeats(value) {
  if (!Number.isFinite(value)) return "1";
  const rounded = Math.round(value * 8) / 8;
  const numerator = Math.round(rounded * 8);
  const denominator = 8;
  const divisor = gcd(numerator, denominator);
  const simplifiedNum = numerator / divisor;
  const simplifiedDen = denominator / divisor;
  if (simplifiedDen === 1) return `${simplifiedNum}`;
  return `${simplifiedNum}/${simplifiedDen}`;
}

function getMostCommonPitchClass(pitchClasses) {
  const counts = new Map();
  pitchClasses.forEach((pitch) => {
    counts.set(pitch, (counts.get(pitch) || 0) + 1);
  });
  let best = null;
  let bestCount = -1;
  counts.forEach((count, pitch) => {
    if (count > bestCount) {
      best = pitch;
      bestCount = count;
    }
  });
  return best;
}

function buildKuthuGroove(events) {
  const melodic = events.filter((event) => !event.rest);
  if (!melodic.length) return null;

  const pitchClasses = melodic
    .map((event) => getPitchClass(event.note))
    .filter(Boolean);
  const tonic = getMostCommonPitchClass(pitchClasses) || getPitchClass(melodic[0].note);
  if (!tonic) return null;
  const octaves = melodic
    .map((event) => getOctave(event.note))
    .filter((value) => Number.isFinite(value));
  const minOctave = octaves.length ? Math.min(...octaves) : 4;
  const bassOctave = Math.min(4, Math.max(3, minOctave - 1));
  const keyboardRange = getKeyboardMidiRange();
  const bassNote = clampNoteToRange(`${tonic}${bassOctave}`, keyboardRange);
  const fifthPitch = transposePitchClass(tonic, 7);
  const fifthNote = clampNoteToRange(`${fifthPitch}${bassOctave}`, keyboardRange);

  const pulses = [
    { note: bassNote, beats: KUTHU_PULSE },
    { note: fifthNote, beats: KUTHU_PULSE },
  ];

  events.forEach((event) => {
    const subdivisions = Math.max(1, Math.round(event.beats / KUTHU_PULSE));
    const pulseBeats = event.beats / subdivisions;

    for (let i = 0; i < subdivisions; i += 1) {
      const isDownbeat = i % 2 === 0;
      if (event.rest) {
        if (isDownbeat) {
          pulses.push({ rest: true, beats: pulseBeats });
        } else {
          pulses.push({ note: bassNote, beats: pulseBeats });
        }
        continue;
      }

      let pulseNote;
      if (isDownbeat) {
        pulseNote = event.note;
      } else if (i % 4 === 1) {
        pulseNote = bassNote;
      } else {
        pulseNote = fifthNote;
      }

      if (i % 4 === 2) {
        const lift = transposeNote(event.note, 12);
        if (lift) {
          pulseNote = clampNoteToRange(lift, keyboardRange);
        }
      }

      pulses.push({
        note: clampNoteToRange(pulseNote, keyboardRange),
        beats: pulseBeats,
      });
    }
  });

  const endingNote = clampNoteToRange(
    `${tonic}${Math.min(5, bassOctave + 2)}`,
    keyboardRange
  );
  pulses.push({ note: endingNote, beats: 1 });
  return pulses;
}

function formatKuthuOutput(events) {
  const restToken = state.notationMode === "carnatic" ? "REST" : "R";
  return events
    .map((event) => {
      const beat = formatBeats(event.beats);
      if (event.rest) return `${restToken}:${beat}`;
      return `${getDisplayName(event.note)}:${beat}`;
    })
    .join(" ");
}

function generateKuthuFromInput() {
  if (!kuthuOutput) return null;
  const normalized = normalizeInputForPlayback(notesInput.value);
  if (normalized.changed) {
    notesInput.value = normalized.value;
  }
  const { events, ignored } = parseNotes(notesInput.value);
  const playable = events.filter((event) => !event.rest);
  if (!playable.length) {
    setStatus("Add some notes before generating a kuthu groove.", true);
    return null;
  }

  const kuthuEvents = buildKuthuGroove(events);
  if (!kuthuEvents) {
    setStatus("Unable to build a kuthu groove from this input.", true);
    return null;
  }

  const output = formatKuthuOutput(kuthuEvents);
  kuthuOutput.value = output;

  const ignoredText = ignored.length ? `Ignored: ${ignored.join(", ")}. ` : "";
  setStatus(`${ignoredText}Agentic Kuthu ready with ${kuthuEvents.length} pulses.`);
  return output;
}

function ensureAudio() {
  if (!audioState.enabled) return;
  if (!audioState.ctx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioState.ctx = new AudioContext();
    audioState.master = audioState.ctx.createGain();
    audioState.master.gain.value = audioState.volume;
    audioState.master.connect(audioState.ctx.destination);
    audioState.noiseBuffer = null;
  }
  if (audioState.ctx.state === "suspended") {
    audioState.ctx.resume();
  }
}

function addAutoActive(keyEl) {
  const count = state.activeCounts.get(keyEl) || 0;
  state.activeCounts.set(keyEl, count + 1);
  keyEl.classList.add("active");
}

function removeAutoActive(keyEl) {
  const count = (state.activeCounts.get(keyEl) || 0) - 1;
  if (count <= 0) {
    state.activeCounts.delete(keyEl);
    if (!state.manualActive.has(keyEl)) {
      keyEl.classList.remove("active");
    }
    return;
  }
  state.activeCounts.set(keyEl, count);
}

function addManualActive(keyEl) {
  state.manualActive.add(keyEl);
  keyEl.classList.add("active");
}

function removeManualActive(keyEl) {
  state.manualActive.delete(keyEl);
  if (!state.activeCounts.has(keyEl)) {
    keyEl.classList.remove("active");
  }
}

function stopAllVoices() {
  if (!audioState.ctx) {
    audioState.voices.clear();
    return;
  }
  audioState.voices.forEach((voice) => {
    stopVoiceImmediate(voice);
  });
  audioState.voices.clear();
}

function stopManualVoices() {
  if (!audioState.ctx) {
    audioState.manualVoices.clear();
    return;
  }
  audioState.manualVoices.forEach((voice) => {
    stopVoiceImmediate(voice);
  });
  audioState.manualVoices.clear();
}

function startVoice(note) {
  if (!audioState.enabled) return;
  ensureAudio();
  if (!audioState.ctx) return;
  const frequency = noteToFrequency(note.note);
  if (!frequency) return;
  const voice = createVoice(frequency, note.durationMs, false);
  if (!voice) return;
  audioState.voices.add(voice);
  note.voice = voice;
}

function startManualVoice(noteName) {
  if (!audioState.enabled) return;
  ensureAudio();
  if (!audioState.ctx) return;
  if (audioState.manualVoices.has(noteName)) return;
  const frequency = noteToFrequency(noteName);
  if (!frequency) return;
  const voice = createVoice(frequency, null, true);
  if (!voice) return;
  audioState.manualVoices.set(noteName, voice);
}

function stopManualVoice(noteName) {
  const voice = audioState.manualVoices.get(noteName);
  if (!voice || !audioState.ctx) return;
  releaseVoice(voice);
  audioState.manualVoices.delete(noteName);
}

function clearStatus() {
  statusEl.textContent = "";
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "var(--accent-danger)" : "var(--accent-1)";
}

function clearPlayback() {
  state.playing = false;
  cancelAnimationFrame(state.raf);
  state.raf = 0;
  stopAllVoices();
  stopManualVoices();
  state.notes.forEach((note) => {
    note.el.remove();
  });
  state.activeCounts.clear();
  document.querySelectorAll(".key.active").forEach((keyEl) => {
    if (!state.manualActive.has(keyEl)) {
      keyEl.classList.remove("active");
    }
  });
  state.notes = [];
}

function prepareNotes(events) {
  fallZone.innerHTML = "";
  const beatMs = state.beatMs;
  const fallRect = fallZone.getBoundingClientRect();
  const baseHeight = 22;
  let cursorBeats = 0;
  let noteIndex = 0;

  state.notes = [];

  events.forEach((event) => {
    const durationMs = event.beats * beatMs;
    if (event.rest) {
      cursorBeats += event.beats;
      return;
    }

    const keyEl = keyMap.get(event.note);
    const keyRect = keyEl.getBoundingClientRect();
    const width = Math.max(28, keyRect.width * 0.75);
    const height = Math.max(18, baseHeight + (event.beats - 1) * 14);
    const left =
      keyRect.left - fallRect.left + keyRect.width / 2 - width / 2;
    const el = document.createElement("div");
    el.className = "note";
    el.style.width = `${width}px`;
    el.style.left = `${left}px`;
    el.style.setProperty("--note-h", `${height}px`);
    const label = document.createElement("span");
    label.className = "note-label";
    label.textContent = getDisplayName(event.note);
    el.appendChild(label);
    fallZone.appendChild(el);

    state.notes.push({
      note: event.note,
      beats: event.beats,
      index: noteIndex,
      startMs: cursorBeats * beatMs,
      durationMs,
      el,
      keyEl,
      active: false,
      released: false,
      done: false,
      audioStarted: false,
      voice: null,
    });

    cursorBeats += event.beats;
    noteIndex += 1;
  });

  state.totalMs = cursorBeats * beatMs;
  state.sequence = events;
  state.startTime = performance.now() + 250;
}

function refreshNotePositions() {
  if (!state.notes.length) return;
  const fallRect = fallZone.getBoundingClientRect();
  state.notes.forEach((note) => {
    const keyRect = note.keyEl.getBoundingClientRect();
    const width = Math.max(28, keyRect.width * 0.75);
    const left =
      keyRect.left - fallRect.left + keyRect.width / 2 - width / 2;
    note.el.style.width = `${width}px`;
    note.el.style.left = `${left}px`;
  });
}

function tick(now) {
  if (!state.playing) return;
  const t = now - state.startTime;
  const dropHeight = Math.max(80, fallZone.clientHeight - 24);

  state.notes.forEach((note) => {
    if (note.done) return;
    const fallStart = note.startMs - state.fallMs;
    const progress = (t - fallStart) / state.fallMs;

    if (progress < 0) {
      note.el.classList.remove("active");
      return;
    }

    note.el.classList.add("active");
    const clamped = Math.min(1, Math.max(0, progress));
    note.el.style.transform = `translateY(${clamped * dropHeight}px)`;

    if (!note.active && t >= note.startMs) {
      note.active = true;
      addAutoActive(note.keyEl);
    }

    if (!note.audioStarted && t >= note.startMs) {
      note.audioStarted = true;
      startVoice(note);
    }

    if (!note.released && t >= note.startMs + note.durationMs) {
      note.released = true;
      removeAutoActive(note.keyEl);
    }

    if (t >= note.startMs + note.durationMs + state.fallMs) {
      note.el.remove();
      note.done = true;
    }
  });

  if (t > state.totalMs + state.fallMs + 400) {
    if (loopToggle.checked) {
      prepareNotes(state.sequence);
    } else {
      clearPlayback();
      setStatus("Playback complete.");
      return;
    }
  }

  state.raf = requestAnimationFrame(tick);
}

function play() {
  clearPlayback();
  clearStatus();
  const normalized = normalizeInputForPlayback(notesInput.value);
  if (normalized.changed) {
    notesInput.value = normalized.value;
  }
  const { events, ignored } = parseNotes(notesInput.value);
  const noteCount = events.filter((event) => !event.rest).length;
  const totalBeats = events.reduce((sum, event) => sum + event.beats, 0);

  if (!noteCount) {
    setStatus("Add playable notes in the text box to start.", true);
    return;
  }

  state.beatMs = 60000 / Number(tempoRange.value);
  state.fallMs = Number(fallRange.value);

  if (audioState.enabled) {
    ensureAudio();
  }
  prepareNotes(events);
  state.playing = true;
  let statusMessage = `Playing ${noteCount} notes over ${totalBeats} beats.`;
  if (ignored.length) {
    statusMessage = `Ignored: ${ignored.join(", ")}. ${statusMessage}`;
  }
  setStatus(statusMessage, ignored.length > 0);
  state.raf = requestAnimationFrame(tick);
}

function stop() {
  clearPlayback();
  setStatus("Stopped.");
}

buildKeyMap();
updateKeyboardRange(state.keyboardRange);
tempoValue.textContent = tempoRange.value;
fallValue.textContent = `${fallRange.value}ms`;
volumeValue.textContent = `${volumeRange.value}%`;
if (soundSelect) {
  audioState.sound = soundSelect.value || DEFAULT_SOUND;
}

if (studioTabButtons.length) {
  const initialTab =
    Array.from(studioTabButtons).find((button) => button.classList.contains("is-active"))
      ?.dataset.tab || "notes";
  setStudioTab(initialTab);
}

mapToggle.addEventListener("change", () => {
  document.body.classList.toggle("show-map", mapToggle.checked);
});

studioTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab || "notes";
    setStudioTab(tab);
  });
});

if (kuthuGenerateBtn) {
  kuthuGenerateBtn.addEventListener("click", () => {
    generateKuthuFromInput();
  });
}

if (kuthuApplyBtn) {
  kuthuApplyBtn.addEventListener("click", () => {
    const output = kuthuOutput?.value.trim() || generateKuthuFromInput();
    if (!output) return;
    notesInput.value = output;
    setStudioTab("notes");
    setStatus("Kuthu groove loaded into Song Notes.");
  });
}

if (kuthuPresetBtn) {
  kuthuPresetBtn.addEventListener("click", () => {
    tempoRange.value = KUTHU_PRESET.tempo;
    tempoRange.dispatchEvent(new Event("input"));
    fallRange.value = KUTHU_PRESET.fall;
    fallRange.dispatchEvent(new Event("input"));
    if (soundSelect) {
      soundSelect.value = KUTHU_PRESET.sound;
      soundSelect.dispatchEvent(new Event("change"));
    }
    setStatus("Kuthu preset applied.");
  });
}

rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const range = button.dataset.range || "lower";
    updateKeyboardRange(range);
    rangeButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn === button);
    });
  });
});

notationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.notation || "western";
    state.notationMode = mode;
    document.body.setAttribute("data-notation", mode);
    notationButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn === button);
    });
    if (noteFormat) {
      noteFormat.textContent =
        mode === "carnatic"
          ? "Try: S4:1 R4:1 G4:1 M4:1 | P4:2 REST:1 P4:1"
          : "Try: C4:1 D4:1 E4:1 F4:1 | G4:2 R:1 G4:1";
    }
    if (keyHint) {
      keyHint.textContent =
        (state.keyboardRange === "upper" ? "Keyboard (C4–B5): " : "Keyboard (C3–B4): ") +
        "Z X C V B N M = lower octave, A S D F G H J = upper octave, " +
        "W E T Y U and 2 3 5 6 7 = black keys.";
      if (mode === "carnatic") {
        keyHint.textContent += " Swaras map to C major (Sa=C, Ri=D, Ga=E, Ma=F, Pa=G, Dha=A, Ni=B).";
      }
    }
    setStatus(
      mode === "carnatic" ? "Carnatic notation enabled." : "Western notation enabled."
    );
  });
});

if (soundSelect) {
  soundSelect.addEventListener("change", () => {
    audioState.sound = soundSelect.value || DEFAULT_SOUND;
    const label =
      soundSelect.options[soundSelect.selectedIndex]?.text || "Sound";
    setStatus(`Sound set to ${label}.`);
    if (state.playing) {
      play();
    }
  });
}

document.querySelectorAll(".key[data-note]").forEach((keyEl) => {
  const noteName = keyEl.dataset.note;
  keyEl.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    keyEl.setPointerCapture(event.pointerId);
    addManualActive(keyEl);
    startManualVoice(noteName);
  });
  keyEl.addEventListener("pointerup", () => {
    removeManualActive(keyEl);
    stopManualVoice(noteName);
  });
  keyEl.addEventListener("pointercancel", () => {
    removeManualActive(keyEl);
    stopManualVoice(noteName);
  });
});

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  const target = event.target;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
    return;
  }
  const key = event.key.toLowerCase();
  const noteName = keyboardMap[key];
  if (!noteName || pressedKeys.has(key)) return;
  pressedKeys.add(key);
  const keyEl = keyMap.get(noteName);
  if (keyEl) {
    addManualActive(keyEl);
    startManualVoice(noteName);
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  const noteName = keyboardMap[key];
  if (!noteName) return;
  pressedKeys.delete(key);
  const keyEl = keyMap.get(noteName);
  if (keyEl) {
    removeManualActive(keyEl);
    stopManualVoice(noteName);
  }
});

window.addEventListener("blur", () => {
  pressedKeys.clear();
  stopManualVoices();
  state.manualActive.forEach((keyEl) => {
    removeManualActive(keyEl);
  });
});

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const theme = button.dataset.theme || "light";
    document.body.setAttribute("data-theme", theme);
    themeButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn === button);
    });
  });
});

playgroundButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const notes = button.dataset.notes;
    if (!notes) return;
    notesInput.value = notes;
    setStatus(`${button.dataset.title || "Pattern"} loaded.`);
    if (button.dataset.autoplay === "true") {
      play();
    }
  });
});

playBtn.addEventListener("click", play);
stopBtn.addEventListener("click", stop);

notesInput.addEventListener("paste", (event) => {
  const text = event.clipboardData?.getData("text");
  if (!text) return;
  event.preventDefault();
  const normalized = normalizeInputForPlayback(text);
  notesInput.value = normalized.value || text.trim();
  play();
});

sampleBtn.addEventListener("click", () => {
  notesInput.value =
    state.notationMode === "carnatic" ? CARNATIC_SAMPLE : SAMPLE;
  setStatus("Sample loaded.");
});

tempoRange.addEventListener("input", () => {
  tempoValue.textContent = tempoRange.value;
  if (state.playing) play();
});

fallRange.addEventListener("input", () => {
  fallValue.textContent = `${fallRange.value}ms`;
  if (state.playing) play();
});

audioToggle.addEventListener("change", () => {
  audioState.enabled = audioToggle.checked;
  if (!audioState.enabled) {
    stopAllVoices();
    stopManualVoices();
    setStatus("Audio muted.");
    return;
  }
  ensureAudio();
  setStatus("Audio enabled.");
});

volumeRange.addEventListener("input", () => {
  const volume = Number(volumeRange.value) / 100;
  audioState.volume = volume;
  volumeValue.textContent = `${volumeRange.value}%`;
  if (audioState.master) {
    audioState.master.gain.setValueAtTime(
      volume,
      audioState.ctx.currentTime
    );
  }
});

window.addEventListener("resize", () => {
  refreshNotePositions();
  buildKeyLabels();
});
