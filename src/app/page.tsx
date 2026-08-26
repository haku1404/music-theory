'use client';

import React, { useState, useEffect } from 'react';
import Staff from '../components/Staff';
import { Note, NoteName, VI_NAMES, getRandomNote, playNote, playWrongSound, initAudio, setSoundEnabled, getSoundEnabled, unlockAudio } from '../utils/music';
import styles from './page.module.css';

const ALL_NOTES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export default function Home() {
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [notation, setNotation] = useState<'abc' | 'vi'>('abc');
  const [clefSetting, setClefSetting] = useState<'treble' | 'bass' | 'both'>('treble');
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    nextNote();
  }, [clefSetting]);

  const toggleSoundState = () => {
    unlockAudio();
    const newState = !soundOn;
    setSoundOn(newState);
    setSoundEnabled(newState);
  };

  const nextNote = () => {
    setCurrentNote(getRandomNote(clefSetting));
    setStatus('idle');
  };

  const handleAnswer = async (answerName: NoteName) => {
    if (!currentNote) return;
    
    // Unlock Web Audio API context synchronously on user interaction
    unlockAudio();
    
    // Initialize audio samples on first interaction if not already done
    await initAudio();
    
    if (answerName === currentNote.name) {
      setStatus('correct');
      playNote(currentNote);
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
      setTimeout(nextNote, 500); // go to next note quickly
    } else {
      setStatus('wrong');
      playWrongSound();
      setStreak(0);
      // Wait for user to answer correctly
      setTimeout(() => setStatus('idle'), 500);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1>Haku Music theory</h1>
          <button className={`${styles.soundToggle} ${!soundOn ? styles.muted : ''}`} onClick={toggleSoundState}>
            {soundOn ? 'Bật âm thanh' : 'Tắt âm thanh'}
          </button>
        </div>
        <div className={styles.stats}>
          <div className={styles.scoreBadge}>Điểm: {score}</div>
          <div className={styles.streakBadge}>Streak: {streak}</div>
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <div className={styles.toggleGroup}>
          <button className={`${styles.toggleBtn} ${notation === 'abc' ? styles.active : ''}`} onClick={() => setNotation('abc')}>C D E</button>
          <button className={`${styles.toggleBtn} ${notation === 'vi' ? styles.active : ''}`} onClick={() => setNotation('vi')}>Đô Rê Mi</button>
        </div>
        <div className={styles.toggleGroup}>
          <button className={`${styles.toggleBtn} ${clefSetting === 'treble' ? styles.active : ''}`} onClick={() => setClefSetting('treble')}>Khoá Sol</button>
          <button className={`${styles.toggleBtn} ${clefSetting === 'bass' ? styles.active : ''}`} onClick={() => setClefSetting('bass')}>Khoá Pha</button>
          <button className={`${styles.toggleBtn} ${clefSetting === 'both' ? styles.active : ''}`} onClick={() => setClefSetting('both')}>Cả hai</button>
        </div>
      </div>

      <div className={styles.gameArea}>
        <Staff note={currentNote} status={status} />
      </div>

      <div className={styles.controls}>
        {ALL_NOTES.map(name => (
          <button 
            key={name} 
            className={`${styles.noteBtn} glass`}
            onClick={() => handleAnswer(name)}
          >
            <span className={styles.noteLabelMain}>{notation === 'abc' ? name : VI_NAMES[name]}</span>
            <span className={styles.noteLabelSub}>{notation === 'abc' ? VI_NAMES[name] : name}</span>
          </button>
        ))}
      </div>
      
      <p className={styles.hint}>Nhìn nốt nhạc trên khuông và bấm vào phím tương ứng thật nhanh!</p>
    </main>
  );
}
