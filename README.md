# Piano Learner Studio

A single-page piano practice lab with falling notes, chord/scale drills, and a guided lesson. Write melodies in a compact note format and play them back with a visual keyboard and optional audio.

## Features
- Falling-note “song studio” with play/stop, tempo, fall speed, loop, and volume controls.
- Instrument palette with pianos, guitars, winds, strings, brass, synths, and percussion.
- Western note input (C4, F#4, Bb3) and Carnatic (Sargam) input (S R G M P D N).
- Interactive keyboard with mouse/touch and computer keyboard mapping.
- Built-in chord/scale playground and step-by-step lesson drills.
- Light/dark themes and keyboard range toggle (C3–B4 or C4–B5).

## Getting started
No build step or dependencies. Open `index.html` directly, or use a local server for best audio autoplay behavior:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.

## Note format
Each token is `NOTE:BEATS` and separated by spaces or commas. Bars `|` are optional. Use rests with `R:1` (Western) or `REST:1` (Carnatic).

Examples:
- Western: `C4:1 D4:1 E4:1 F4:1 | G4:2 R:1 G4:1`
- Carnatic: `S4:1 R4:1 G4:1 M4:1 | P4:2 REST:1 P4:1`

## Keyboard controls
The page shows the mapping, but the default range is:
- White keys: `Z X C V B N M` (lower octave) and `A S D F G H J` (upper octave)
- Black keys: `2 3 5 6 7` (lower) and `W E T Y U` (upper)

Toggle the keyboard range in the UI to shift octaves.

## File layout
- `index.html` — layout and content
- `styles.css` — visuals and theming
- `app.js` — playback engine, parsing, and interactions
