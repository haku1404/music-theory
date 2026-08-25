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

    // Responsive scaling based on container
    renderer.resize(300, 150);
    const context = renderer.getContext();
    context.scale(1.5, 1.5); // scale up for better visibility

    // Create a stave at position 10, 20 of width 180 on the canvas
    const stave = new Stave(10, 10, 150);

    const clef = note?.clef || 'treble';
    stave.addClef(clef);
    stave.setContext(context).draw();

    if (note) {
      // VexFlow note format e.g. "c/4"
      const keys = [`${note.name.toLowerCase()}/${note.octave}`];
      
      const staveNote = new StaveNote({
        clef: clef,
        keys: keys,
        duration: 'q',
        auto_stem: true,
      });

      // Apply colors based on status
      let color = 'var(--note-color)';
      if (status === 'correct') color = '#38bdf8'; // var(--success)
      if (status === 'wrong') color = '#f43f5e'; // var(--error)

      staveNote.setStyle({ fillStyle: color, strokeStyle: color });

      Formatter.FormatAndDraw(context, stave, [staveNote]);
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
