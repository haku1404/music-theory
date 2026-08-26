'use client';

import React, { useEffect, useRef } from 'react';
import { Renderer, RendererBackends, Stave, StaveNote, Formatter } from 'vexflow';
import { Note } from '../utils/music';
import styles from './Staff.module.css';

interface StaffProps {
  notes?: Note[];
  status: 'idle' | 'correct' | 'wrong';
  hidden?: boolean;
}

export default function Staff({ notes = [], status, hidden = false }: StaffProps) {
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

    const clef = notes.length > 0 ? notes[0].clef : 'treble';
    stave.addClef(clef);
    stave.setContext(context).draw();

    if (notes.length > 0 && !hidden) {
      const keys = notes.map(n => `${n.name.toLowerCase()}/${n.octave}`);
      
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
      // Shift viewBox Y down (to 20) to crop top padding, moving the staff UP visually.
      svg.setAttribute('viewBox', '0 20 100 120');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxHeight = '280px';
      
      if (hidden) {
        // Draw a giant question mark
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '50');
        text.setAttribute('y', '95'); // visually centered on the staff
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '60');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-family', 'sans-serif');
        text.setAttribute('fill', 'var(--note-color)');
        text.textContent = '?';
        svg.appendChild(text);
      }
    }
  }, [notes, status, hidden]);

  return (
    <div 
      className={`${styles.staffContainer} ${status === 'wrong' ? styles.shake : ''} ${status === 'correct' ? styles.glowSuccess : ''}`}
    >
      <div ref={containerRef} className={styles.svgWrapper} />
    </div>
  );
}
