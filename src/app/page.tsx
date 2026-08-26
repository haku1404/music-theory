'use client';

import React, { useState, useEffect } from 'react';
import Staff from '../components/Staff';
import { Note, NoteName, VI_NAMES, getRandomNote, getRandomIntervalNotes, playNotes, playWrongSound, initAudio, ensureAudioRunning } from '../utils/music';
import styles from './page.module.css';

const ALL_NOTES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const INTERVALS = ['2', '3', '4', '5', '6', '7', '8'];

type AppMode = 'sight-reading' | 'intervals' | 'ear-training';

export default function Home() {
  const [mode, setMode] = useState<AppMode>('sight-reading');
  const [currentNotes, setCurrentNotes] = useState<Note[]>([]);
  const [currentTarget, setCurrentTarget] = useState<string>('');
  
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const [notation, setNotation] = useState<'abc' | 'vi'>('abc');
  const [clefSetting, setClefSetting] = useState<'treble' | 'bass' | 'both'>('treble');

  useEffect(() => {
    generateQuestion();
  }, [mode, clefSetting]);

  // Auto-play for Ear Training when question is generated
  useEffect(() => {
    if (mode === 'ear-training' && currentNotes.length > 0 && status === 'idle') {
      const playTimer = setTimeout(() => {
        playNotes(currentNotes);
      }, 300);
      return () => clearTimeout(playTimer);
    }
  }, [currentNotes, mode, status]);

  const generateQuestion = () => {
    setStatus('idle');
    if (mode === 'sight-reading' || mode === 'ear-training') {
      const note = getRandomNote(clefSetting);
      setCurrentNotes([note]);
      setCurrentTarget(note.name);
    } else if (mode === 'intervals') {
      const { notes, interval } = getRandomIntervalNotes(clefSetting);
      setCurrentNotes(notes);
      setCurrentTarget(interval.toString());
    }
  };

  const handleTabSwitch = async (newMode: AppMode) => {
    ensureAudioRunning();
    await initAudio(); // Start loading samples if not already
    setMode(newMode);
    setScore(0);
    setStreak(0);
  };

  const handleAnswer = async (answer: string) => {
    if (currentNotes.length === 0) return;
    
    ensureAudioRunning();
    await initAudio();
    
    if (answer === currentTarget) {
      setStatus('correct');
      playNotes(currentNotes);
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
      setTimeout(generateQuestion, 800);
    } else {
      setStatus('wrong');
      playWrongSound();
      setStreak(0);
      setTimeout(() => setStatus('idle'), 500);
    }
  };

  const replayAudio = async () => {
    ensureAudioRunning();
    await initAudio();
    playNotes(currentNotes);
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1>Haku Music theory</h1>
        </div>
        
        <div className={styles.tabs}>
          <button className={`${styles.tabBtn} ${mode === 'sight-reading' ? styles.tabActive : ''}`} onClick={() => handleTabSwitch('sight-reading')}>🎵 Đọc Nốt</button>
          <button className={`${styles.tabBtn} ${mode === 'intervals' ? styles.tabActive : ''}`} onClick={() => handleTabSwitch('intervals')}>📏 Quãng</button>
          <button className={`${styles.tabBtn} ${mode === 'ear-training' ? styles.tabActive : ''}`} onClick={() => handleTabSwitch('ear-training')}>🎧 Luyện Nghe</button>
        </div>

        <div className={styles.stats}>
          <div className={styles.scoreBadge}>Điểm: {score}</div>
          <div className={styles.streakBadge}>Streak: {streak}</div>
        </div>
      </div>

      <div className={styles.settingsGroup}>
        {mode !== 'intervals' && (
          <div className={styles.toggleGroup}>
            <button className={`${styles.toggleBtn} ${notation === 'abc' ? styles.active : ''}`} onClick={() => setNotation('abc')}>C D E</button>
            <button className={`${styles.toggleBtn} ${notation === 'vi' ? styles.active : ''}`} onClick={() => setNotation('vi')}>Đô Rê Mi</button>
          </div>
        )}
        <div className={styles.toggleGroup}>
          <button className={`${styles.toggleBtn} ${clefSetting === 'treble' ? styles.active : ''}`} onClick={() => setClefSetting('treble')}>Khoá Sol</button>
          <button className={`${styles.toggleBtn} ${clefSetting === 'bass' ? styles.active : ''}`} onClick={() => setClefSetting('bass')}>Khoá Pha</button>
          <button className={`${styles.toggleBtn} ${clefSetting === 'both' ? styles.active : ''}`} onClick={() => setClefSetting('both')}>Cả hai</button>
        </div>
      </div>

      <div className={styles.gameArea}>
        <Staff 
          notes={currentNotes} 
          status={status} 
          hidden={mode === 'ear-training' && status !== 'correct'} 
        />
      </div>

      {mode === 'ear-training' && (
        <button className={`${styles.replayBtn} glass`} onClick={replayAudio}>
          🔊 Nghe lại
        </button>
      )}

      <div className={styles.controls}>
        {(mode === 'sight-reading' || mode === 'ear-training') && ALL_NOTES.map(name => (
          <button 
            key={name} 
            className={`${styles.noteBtn} glass`}
            onClick={() => handleAnswer(name)}
          >
            <span className={styles.noteLabelMain}>{notation === 'abc' ? name : VI_NAMES[name]}</span>
            <span className={styles.noteLabelSub}>{notation === 'abc' ? VI_NAMES[name] : name}</span>
          </button>
        ))}

        {mode === 'intervals' && INTERVALS.map(num => (
          <button 
            key={num} 
            className={`${styles.noteBtn} glass`}
            onClick={() => handleAnswer(num)}
          >
            <span className={styles.noteLabelMain}>Quãng {num}</span>
          </button>
        ))}
      </div>
      
      <p className={styles.hint}>
        {mode === 'sight-reading' && "Nhìn nốt nhạc trên khuông và bấm vào phím tương ứng thật nhanh!"}
        {mode === 'intervals' && "Xác định khoảng cách (số quãng) giữa 2 nốt nhạc."}
        {mode === 'ear-training' && "Nghe âm thanh và đoán xem đó là nốt gì. Không nhìn khuông nhạc!"}
      </p>
    </main>
  );
}
