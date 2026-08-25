'use client';

import React from 'react';
import { Note, getNoteY, getLedgerLines } from '../utils/music';
import styles from './Staff.module.css';

interface StaffProps {
  note: Note | null;
  status: 'idle' | 'correct' | 'wrong';
}

export default function Staff({ note, status }: StaffProps) {
  // Staff lines are at Y = 20, 30, 40, 50, 60
  const lines = [20, 30, 40, 50, 60];
  
  let noteY = 0;
  let ledgerLines: number[] = [];
  
  if (note) {
    noteY = getNoteY(note);
    ledgerLines = getLedgerLines(note);
  }

  return (
    <div className={styles.staffContainer}>
      <svg viewBox="0 -30 200 140" className={styles.svg}>
        {/* Draw the 5 staff lines */}
        {lines.map((y) => (
          <line key={y} x1="0" y1={y} x2="200" y2={y} className={styles.staffLine} />
        ))}
        
        {/* Draw the Clef */}
        {note && note.clef === 'treble' && (
          <text x="10" y="55" className={styles.clef}>𝄞</text>
        )}
        {note && note.clef === 'bass' && (
          <text x="10" y="48" className={styles.clefBass}>𝄢</text>
        )}

        {/* Draw Ledger Lines */}
        {ledgerLines.map((y) => (
          <line key={y} x1="80" y1={y} x2="120" y2={y} className={styles.staffLine} />
        ))}

        {/* Draw the Note */}
        {note && (
          <g className={`${styles.noteGroup} ${status === 'correct' ? 'glow-success' : ''} ${status === 'wrong' ? 'shake' : ''}`}>
            <ellipse cx="100" cy={noteY} rx="8" ry="5.5" transform={`rotate(-15 100 ${noteY})`} className={`${styles.noteHead} ${styles[status]}`} />
            {/* Draw stem if needed (simplified: stem goes up if note is below middle line (y > 40), down if above) */}
            {noteY > 40 ? (
               <line x1="107" y1={noteY - 1} x2="107" y2={noteY - 32} className={`${styles.noteStem} ${styles[status]}`} />
            ) : (
               <line x1="93" y1={noteY + 1} x2="93" y2={noteY + 32} className={`${styles.noteStem} ${styles[status]}`} />
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
