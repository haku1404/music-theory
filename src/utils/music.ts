export type Clef = 'treble' | 'bass';
export type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface Note {
  name: NoteName;
  octave: number;
  clef: Clef;
}

export const VI_NAMES: Record<NoteName, string> = {
  C: 'Đô',
  D: 'Rê',
  E: 'Mi',
  F: 'Fa',
  G: 'Sol',
  A: 'La',
  B: 'Si',
};

// All natural notes mapped to a numeric "step" index for easy distance calculation
const NOTE_STEPS: Record<NoteName, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

/**
 * Get absolute step index of a note.
 * C4 is our reference point (step 0 for C4? No, let's just make C0 = 0).
 */
export const getAbsoluteStep = (name: NoteName, octave: number) => {
  return octave * 7 + NOTE_STEPS[name];
};

/**
 * Get Y coordinate for a note on the staff.
 * Staff lines are spaced by 10px. (5px per step).
 * Treble Clef lines: E4 (60), G4 (50), B4 (40), D5 (30), F5 (20).
 * Bass Clef lines: G2 (60), B2 (50), D3 (40), F3 (30), A3 (20).
 */
export const getNoteY = (note: Note): number => {
  const step = getAbsoluteStep(note.name, note.octave);
  if (note.clef === 'treble') {
    const e4Step = getAbsoluteStep('E', 4);
    // E4 is at y = 60
    return 60 - (step - e4Step) * 5;
  } else {
    const g2Step = getAbsoluteStep('G', 2);
    // G2 is at y = 60
    return 60 - (step - g2Step) * 5;
  }
};

/**
 * Generate a random note within a specific range.
 * For MVP, we'll hardcode some beginner-friendly ranges.
 */
const TREBLE_NOTES: Note[] = [
  { name: 'C', octave: 4, clef: 'treble' },
  { name: 'D', octave: 4, clef: 'treble' },
  { name: 'E', octave: 4, clef: 'treble' },
  { name: 'F', octave: 4, clef: 'treble' },
  { name: 'G', octave: 4, clef: 'treble' },
  { name: 'A', octave: 4, clef: 'treble' },
  { name: 'B', octave: 4, clef: 'treble' },
  { name: 'C', octave: 5, clef: 'treble' },
  { name: 'D', octave: 5, clef: 'treble' },
  { name: 'E', octave: 5, clef: 'treble' },
  { name: 'F', octave: 5, clef: 'treble' },
  { name: 'G', octave: 5, clef: 'treble' },
];

const BASS_NOTES: Note[] = [
  { name: 'F', octave: 2, clef: 'bass' },
  { name: 'G', octave: 2, clef: 'bass' },
  { name: 'A', octave: 2, clef: 'bass' },
  { name: 'B', octave: 2, clef: 'bass' },
  { name: 'C', octave: 3, clef: 'bass' },
  { name: 'D', octave: 3, clef: 'bass' },
  { name: 'E', octave: 3, clef: 'bass' },
  { name: 'F', octave: 3, clef: 'bass' },
  { name: 'G', octave: 3, clef: 'bass' },
  { name: 'A', octave: 3, clef: 'bass' },
  { name: 'B', octave: 3, clef: 'bass' },
  { name: 'C', octave: 4, clef: 'bass' },
];

export const getRandomNote = (clef: 'treble' | 'bass' | 'both'): Note => {
  let pool = TREBLE_NOTES;
  if (clef === 'bass') pool = BASS_NOTES;
  if (clef === 'both') pool = [...TREBLE_NOTES, ...BASS_NOTES];
  
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
};

/**
 * Check if a note needs ledger lines
 */
export const getLedgerLines = (note: Note): number[] => {
  const y = getNoteY(note);
  const lines: number[] = [];
  
  // Staff lines are at 20, 30, 40, 50, 60.
  // Above staff (y < 20): ledger lines at 10, 0, -10...
  // Below staff (y > 60): ledger lines at 70, 80, 90...
  
  if (y <= 10) {
    for (let l = 10; l >= y; l -= 10) lines.push(l);
  } else if (y >= 70) {
    for (let l = 70; l <= y; l += 10) lines.push(l);
  }
  
  return lines;
};

// --- AUDIO SYNTHESIS WITH GRAND PIANO ---
import * as Tone from 'tone';

let pianoSampler: Tone.Sampler | null = null;
let isSoundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  isSoundEnabled = enabled;
};

export const getSoundEnabled = () => isSoundEnabled;

export const ensureAudioRunning = async () => {
  if (typeof window === 'undefined') return;
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
};

let pianoSampler: Tone.Sampler | null = null;

export const initAudio = async () => {
  if (typeof window === 'undefined') return;
  if (pianoSampler) return;

  // Load just 5 key MP3 files (300KB total) from the local server.
  // Tone.js will automatically pitch-shift these to cover all 88 keys.
  // This gives high-quality Grand Piano sound instantly without network delay.
  pianoSampler = new Tone.Sampler({
    urls: {
      C2: "C2.mp3",
      C3: "C3.mp3",
      C4: "C4.mp3",
      C5: "C5.mp3",
      C6: "C6.mp3"
    },
    release: 1,
    baseUrl: "/audio/piano/"
  }).toDestination();
  
  await Tone.loaded();
};

export const playNote = async (note: Note) => {
  if (!isSoundEnabled || typeof window === 'undefined') return;
  
  await ensureAudioRunning();
  
  if (!pianoSampler) {
    await initAudio();
  }
  
  if (pianoSampler && pianoSampler.loaded) {
    pianoSampler.triggerAttackRelease(`${note.name}${note.octave}`, "2n");
  }
};

export const playWrongSound = async () => {
  if (!isSoundEnabled || typeof window === 'undefined') return;

  await ensureAudioRunning();
  
  const wrongSynth = new Tone.PolySynth(Tone.Synth).toDestination();
  wrongSynth.volume.value = -12;
  // A subtle dissonant cluster to indicate wrong note without being too harsh
  wrongSynth.triggerAttackRelease(["C3", "C#3"], "16n");
};


