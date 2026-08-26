'use client';

import React, { useEffect, useRef } from 'react';
import { Renderer, RendererBackends, Stave, StaveNote, Formatter } from 'vexflow';
import { Note } from '../utils/music';
import styles from './Staff.module.css';

interface StaffProps {
  note: Note | null;
  status: 'idle' | 'correct' | 'wrong';
}

export default function Staff({ note, status }: StaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous SVG
    containerRef.current.innerHTML = '';

    const renderer = new Renderer(
      containerRef.current,
      RendererBackends.SVG
    );

    // Use an extremely tight virtual size to eliminate all empty space.
    renderer.resize(100, 140);
    const context = renderer.getContext();

    // Create a stave at x=10, y=30 of width 80.
    // This perfectly wraps the Clef and the single Note, removing the empty 
    // staff lines on the right that caused it to look "skewed to the left".
    const stave = new Stave(10, 30, 80);

    const clef = note?.clef || 'treble';
    stave.addClef(clef);
    stave.setContext(context).draw();

    if (note) {
      const keys = [`${note.name.toLowerCase()}/${note.octave}`];
      
      const staveNote = new StaveNote({
        clef: clef,
        keys: keys,
        duration: 'q',
        autoStem: true,
      });

      let color = 'var(--note-color)';
      if (status === 'correct') color = '#38bdf8';
      if (status === 'wrong') color = '#f43f5e';

      staveNote.setStyle({ fillStyle: color, strokeStyle: color });

      // Format and draw
      Formatter.FormatAndDraw(context, stave, [staveNote]);
    }

    // Make SVG responsive and tightly cropped
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      // Crop vertical empty space tightly around y=10 to y=130
      svg.setAttribute('viewBox', '0 10 100 120');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxHeight = '220px';
    }
  }, [note, status]);

  return (
    <div 
      className={`${styles.staffContainer} ${status === 'wrong' ? styles.shake : ''} ${status === 'correct' ? styles.glowSuccess : ''}`}
    >
      <div ref={containerRef} className={styles.svgWrapper} />
    </div>
  );
}
