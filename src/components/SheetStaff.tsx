'use client';

import React, { useEffect, useRef } from 'react';
import { Renderer, RendererBackends, Stave, StaveNote, Formatter, Dot } from 'vexflow';
import { Song } from '../data/songs';
import styles from './SheetStaff.module.css';

interface SheetStaffProps {
  song: Song | null;
  currentIndex: number;
}

export default function SheetStaff({ song, currentIndex }: SheetStaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current || !song) return;
    
    // Clear previous SVG
    containerRef.current.innerHTML = '';
    
    const renderer = new Renderer(containerRef.current, RendererBackends.SVG);
    
    // Calculate required width based on number of notes
    const NOTE_WIDTH = 60;
    const padding = 150;
    const totalWidth = Math.max(song.notes.length * NOTE_WIDTH + padding, window.innerWidth);
    
    renderer.resize(totalWidth, 180);
    const context = renderer.getContext();
    
    const stave = new Stave(10, 40, totalWidth - 30);
    stave.addClef(song.clef).addTimeSignature(song.timeSignature);
    stave.setContext(context).draw();
    
    const vexNotes = song.notes.map((note, index) => {
      const keys = [`${note.name.toLowerCase()}/${note.octave}`];
      const staveNote = new StaveNote({
        clef: song.clef,
        keys: keys,
        duration: note.duration.replace('d', ''),
        autoStem: true
      });
      
      if (note.duration.includes('d')) {
        Dot.buildAndAttach([staveNote], { all: true });
      }

      
      // Styling logic based on progress
      if (index === currentIndex) {
        staveNote.setStyle({ fillStyle: '#eab308', strokeStyle: '#eab308' }); // Yellow highlight (waiting)
      } else if (index < currentIndex) {
        staveNote.setStyle({ fillStyle: '#38bdf8', strokeStyle: '#38bdf8' }); // Blue for completed
      } else {
        staveNote.setStyle({ fillStyle: 'var(--note-color)', strokeStyle: 'var(--note-color)' });
      }
      
      return staveNote;
    });
    
    // Draw all notes on the stave
    Formatter.FormatAndDraw(context, stave, vexNotes);
    
    // Clean up SVG to fit container nicely
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      svg.style.maxHeight = '180px';
      svg.style.height = '180px';
      svg.style.minWidth = `${totalWidth}px`; // Bắt buộc giữ nguyên chiều rộng thực, không bị thu nhỏ
      
      // Auto-scroll logic
      const scrollParent = containerRef.current.parentElement;
      if (scrollParent) {
        const noteX = padding + currentIndex * NOTE_WIDTH;
        const viewWidth = scrollParent.clientWidth;
        
        // If note is past 60% of the screen, scroll it to 30% of the screen
        if (noteX > scrollParent.scrollLeft + viewWidth * 0.6) {
          scrollParent.scrollTo({
            left: noteX - viewWidth * 0.3,
            behavior: 'smooth'
          });
        }
        // Initial scroll reset
        if (currentIndex === 0) {
          scrollParent.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }
    
  }, [song, currentIndex]);
  
  if (!song) return null;

  return (
    <div className={styles.scrollContainer}>
      <div ref={containerRef} className={styles.svgWrapper} />
    </div>
  );
}
