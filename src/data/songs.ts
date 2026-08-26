import { Clef, NoteName } from '../utils/music';

export type NoteDuration = 'w' | 'h' | 'q' | '8' | '16' | 'hd';

export interface SongNote {
  name: NoteName;
  octave: number;
  duration: NoteDuration;
}

export interface Song {
  id: string;
  title: string;
  level: number;
  clef: Clef;
  timeSignature: string; // e.g. "4/4"
  notes: SongNote[];
}

export const SONGS: Song[] = [
  {
    id: 'mary-had-a-little-lamb',
    title: 'Mary Had a Little Lamb',
    level: 1,
    clef: 'treble',
    timeSignature: '4/4',
    notes: [
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'C', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'h' },
      
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'h' },
      
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'G', octave: 4, duration: 'q' },
      { name: 'G', octave: 4, duration: 'h' },
      
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'C', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'q' },
      
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'C', octave: 4, duration: 'w' },
    ]
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    level: 1,
    clef: 'treble',
    timeSignature: '4/4',
    notes: [
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'F', octave: 4, duration: 'q' },
      { name: 'G', octave: 4, duration: 'q' },
      { name: 'G', octave: 4, duration: 'q' },
      { name: 'F', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'C', octave: 4, duration: 'q' },
      { name: 'C', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'h' },
      { name: 'D', octave: 4, duration: 'h' } // simplified end for level 1
    ]
  },
  {
    id: 'twinkle-twinkle',
    title: 'Twinkle Twinkle Little Star',
    level: 2,
    clef: 'treble',
    timeSignature: '4/4',
    notes: [
      { name: 'C', octave: 4, duration: 'q' },
      { name: 'C', octave: 4, duration: 'q' },
      { name: 'G', octave: 4, duration: 'q' },
      { name: 'G', octave: 4, duration: 'q' },
      { name: 'A', octave: 4, duration: 'q' },
      { name: 'A', octave: 4, duration: 'q' },
      { name: 'G', octave: 4, duration: 'h' },
      
      { name: 'F', octave: 4, duration: 'q' },
      { name: 'F', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'C', octave: 4, duration: 'h' },
    ]
  },
  {
    id: 'suzon-methode-rose',
    title: 'Suzon (Methode Rose)',
    level: 2,
    clef: 'treble',
    timeSignature: 'C',
    notes: [
      { name: 'C', octave: 5, duration: 'hd' },
      { name: 'C', octave: 5, duration: 'q' },
      { name: 'B', octave: 4, duration: 'hd' },
      { name: 'B', octave: 4, duration: 'q' },
      { name: 'A', octave: 4, duration: 'hd' },
      { name: 'A', octave: 4, duration: 'q' },
      { name: 'G', octave: 4, duration: 'w' },
      
      { name: 'C', octave: 5, duration: 'hd' },
      { name: 'C', octave: 5, duration: 'q' },
      { name: 'D', octave: 5, duration: 'hd' },
      { name: 'D', octave: 5, duration: 'q' },
      { name: 'E', octave: 5, duration: 'hd' },
      { name: 'C', octave: 5, duration: 'q' },
      { name: 'G', octave: 4, duration: 'w' },
      
      { name: 'F', octave: 4, duration: 'hd' },
      { name: 'F', octave: 4, duration: 'q' },
      { name: 'E', octave: 4, duration: 'hd' },
      { name: 'E', octave: 4, duration: 'q' },
      { name: 'D', octave: 4, duration: 'hd' },
      { name: 'D', octave: 4, duration: 'q' },
      { name: 'C', octave: 4, duration: 'w' },
    ]
  }
];
