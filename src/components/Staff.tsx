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

    // Use a standard 200x160 coordinate system. CSS will scale it to 100%.
    renderer.resize(200, 160);
    const context = renderer.getContext();

    // Create a stave at x=10, y=40 of width 180
    const stave = new Stave(10, 40, 180);

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

    // Make SVG responsive
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      svg.setAttribute('viewBox', '0 0 200 160');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.removeAttribute('width');
      svg.removeAttribute('height');
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
