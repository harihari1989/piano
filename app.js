const notesInput = document.getElementById("notes-input");
const playBtn = document.getElementById("play-btn");
const stopBtn = document.getElementById("stop-btn");
const sampleBtn = document.getElementById("sample-btn");
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
const loopToggle = document.getElementById("loop");
const mapToggle = document.getElementById("map-toggle");
const statusEl = document.getElementById("status");
const fallZone = document.getElementById("fall-zone");

const SAMPLE = "C4:1 D4:1 E4:1 F4:1 G4:1 A4:1 B4:1 C5:2";
const CARNATIC_SAMPLE = "S4:1 R4:1 G4:1 M4:1 P4:1 D4:1 N4:1 S5:2";

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

function noteToFrequency(note) {
  const match = note.match(/^([A-G])(#?)(\d)$/);
  if (!match) return null;
  const key = `${match[1]}${match[2]}`;
  const octave = Number(match[3]);
  if (!Object.prototype.hasOwnProperty.call(NOTE_OFFSETS, key)) return null;
  const midi = (octave + 1) * 12 + NOTE_OFFSETS[key];
  return 440 * Math.pow(2, (midi - 69) / 12);
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

function ensureAudio() {
  if (!audioState.enabled) return;
  if (!audioState.ctx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioState.ctx = new AudioContext();
    audioState.master = audioState.ctx.createGain();
    audioState.master.gain.value = audioState.volume;
    audioState.master.connect(audioState.ctx.destination);
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
  const now = audioState.ctx.currentTime;
  audioState.voices.forEach((voice) => {
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
      voice.gain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
      voice.osc.stop(now + 0.06);
    } catch (error) {
      // Ignore stale nodes.
    }
  });
  audioState.voices.clear();
}

function stopManualVoices() {
  if (!audioState.ctx) {
    audioState.manualVoices.clear();
    return;
  }
  const now = audioState.ctx.currentTime;
  audioState.manualVoices.forEach((voice) => {
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
      voice.gain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
      voice.osc.stop(now + 0.06);
    } catch (error) {
      // Ignore stale nodes.
    }
  });
  audioState.manualVoices.clear();
}

function startVoice(note) {
  if (!audioState.enabled) return;
  ensureAudio();
  if (!audioState.ctx) return;
  const frequency = noteToFrequency(note.note);
  if (!frequency) return;

  const ctx = audioState.ctx;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.08);

  osc.connect(gain);
  gain.connect(audioState.master);

  const stopAt = now + note.durationMs / 1000;
  gain.gain.setValueAtTime(gain.gain.value, stopAt);
  gain.gain.linearRampToValueAtTime(0.0001, stopAt + 0.08);
  osc.start(now);
  osc.stop(stopAt + 0.1);

  const voice = { osc, gain };
  audioState.voices.add(voice);
  osc.addEventListener("ended", () => {
    audioState.voices.delete(voice);
  });
  note.voice = voice;
}

function startManualVoice(noteName) {
  if (!audioState.enabled) return;
  ensureAudio();
  if (!audioState.ctx) return;
  if (audioState.manualVoices.has(noteName)) return;
  const frequency = noteToFrequency(noteName);
  if (!frequency) return;

  const ctx = audioState.ctx;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.08);

  osc.connect(gain);
  gain.connect(audioState.master);
  osc.start(now);

  audioState.manualVoices.set(noteName, { osc, gain });
}

function stopManualVoice(noteName) {
  const voice = audioState.manualVoices.get(noteName);
  if (!voice || !audioState.ctx) return;
  const now = audioState.ctx.currentTime;
  voice.gain.gain.cancelScheduledValues(now);
  voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
  voice.gain.gain.linearRampToValueAtTime(0.0001, now + 0.06);
  voice.osc.stop(now + 0.07);
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

mapToggle.addEventListener("change", () => {
  document.body.classList.toggle("show-map", mapToggle.checked);
});

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
