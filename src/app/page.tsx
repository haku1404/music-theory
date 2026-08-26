'use client';

import React, { useState, useEffect, useRef } from 'react';
import Staff from '../components/Staff';
import SheetStaff from '../components/SheetStaff';
import { Note, NoteName, VI_NAMES, getRandomNote, getRandomIntervalNotes, playNotes, playWrongSound, initAudio, ensureAudioRunning } from '../utils/music';
import { SONGS, Song, NoteDuration } from '../data/songs';
import styles from './page.module.css';

const ALL_NOTES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const INTERVALS = ['2', '3', '4', '5', '6', '7', '8'];

type AppMode = 'home' | 'sight-reading' | 'intervals' | 'ear-training' | 'sheet-music';

const DURATION_MS: Record<NoteDuration, number> = {
  '16': 150,
  '8': 300,
  'q': 600,
  'h': 1200,
  'w': 2400
};

export default function Home() {
  const [mode, setMode] = useState<AppMode>('home');
  const [currentNotes, setCurrentNotes] = useState<Note[]>([]);
  const [currentTarget, setCurrentTarget] = useState<string>('');
  
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const [notation, setNotation] = useState<'abc' | 'vi'>('abc');
  const [clefSetting, setClefSetting] = useState<'treble' | 'bass' | 'both'>('treble');

  // Sheet Music State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [songNoteIndex, setSongNoteIndex] = useState(0);
  const [pressingNote, setPressingNote] = useState<string | null>(null);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);

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
    setCurrentSong(null);
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

  // --- SHEET MUSIC HANDLERS ---
  const handlePointerDown = async (noteName: NoteName) => {
    if (mode !== 'sheet-music' || !currentSong) {
      if (mode === 'sight-reading' || mode === 'ear-training') {
        handleAnswer(noteName);
      }
      return;
    }

    if (songNoteIndex >= currentSong.notes.length) return;

    ensureAudioRunning();
    await initAudio();

    const targetNote = currentSong.notes[songNoteIndex];
    if (noteName === targetNote.name) {
      // Đúng nốt!
      setStatus('idle'); // clear wrong status if any
      setPressingNote(noteName);
      isHoldingRef.current = true;
      
      // Phát âm thanh
      playNotes([{ name: targetNote.name, octave: targetNote.octave, clef: currentSong.clef }]);
      
      const requiredTime = DURATION_MS[targetNote.duration];
      
      pressTimeoutRef.current = setTimeout(() => {
        if (isHoldingRef.current) {
          // Thành công giữ đủ lâu!
          setPressingNote(null);
          isHoldingRef.current = false;
          setStatus('correct');
          setScore(s => s + 20);
          
          setTimeout(() => {
            setStatus('idle');
            setSongNoteIndex(prev => prev + 1);
          }, 300);
        }
      }, requiredTime);
    } else {
      // Sai nốt
      setStatus('wrong');
      playWrongSound();
      setTimeout(() => setStatus('idle'), 500);
    }
  };

  const handlePointerUp = () => {
    if (mode !== 'sheet-music' || !currentSong || !isHoldingRef.current) return;
    
    // Thả tay quá sớm!
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    
    isHoldingRef.current = false;
    setPressingNote(null);
    setStatus('wrong');
    playWrongSound();
    
    setTimeout(() => setStatus('idle'), 600);
  };

  const selectSong = (song: Song) => {
    setCurrentSong(song);
    setSongNoteIndex(0);
    setScore(0);
    setStatus('idle');
  };

  const getHoldStyle = (name: NoteName): React.CSSProperties => {
    if (mode === 'sheet-music' && pressingNote === name && currentSong) {
      const targetNote = currentSong.notes[songNoteIndex];
      if (targetNote) {
        return { '--hold-time': `${DURATION_MS[targetNote.duration]}ms` } as React.CSSProperties;
      }
    }
    return {};
  };

  const replayAudio = async () => {
    ensureAudioRunning();
    await initAudio();
    playNotes(currentNotes);
  };

  if (mode === 'home') {
    return (
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h1>Haku Music theory</h1>
          </div>
          <p className={styles.subtitle}>Chọn một bài tập để bắt đầu</p>
        </div>
        
        <div className={styles.gridMenu}>
          <div className={styles.menuCard} onClick={() => handleTabSwitch('sight-reading')}>
            <div className={styles.cardIcon}>🎵</div>
            <h3>Đọc Nốt</h3>
            <p>Luyện phản xạ đọc nốt nhạc cơ bản trên khuông</p>
          </div>
          <div className={styles.menuCard} onClick={() => handleTabSwitch('intervals')}>
            <div className={styles.cardIcon}>📏</div>
            <h3>Quãng</h3>
            <p>Nhận diện khoảng cách giữa 2 nốt nhạc</p>
          </div>
          <div className={styles.menuCard} onClick={() => handleTabSwitch('ear-training')}>
            <div className={styles.cardIcon}>🎧</div>
            <h3>Luyện Nghe</h3>
            <p>Luyện cảm âm Perfect Pitch không nhìn khuông nhạc</p>
          </div>
          <div className={styles.menuCard} onClick={() => handleTabSwitch('sheet-music')}>
            <div className={styles.cardIcon}>📜</div>
            <h3>Bản nhạc</h3>
            <p>Thị tấu và giữ nhịp bản nhạc hoàn chỉnh</p>
          </div>
        </div>
      </main>
    );
  }

  if (mode === 'sheet-music' && !currentSong) {
    return (
      <main className={styles.main}>
         <div className={styles.header}>
          <div className={styles.headerTop}>
            <button className={styles.backBtn} onClick={() => setMode('home')}>← Menu</button>
            <h1>Thị Tấu Bản Nhạc</h1>
          </div>
          <p className={styles.subtitle}>Chọn một bài hát để bắt đầu luyện tập</p>
        </div>
        
        <div className={styles.gridMenu}>
          {SONGS.map(song => (
            <div key={song.id} className={styles.songCard} onClick={() => selectSong(song)}>
              <h3>{song.title}</h3>
              <p>Level {song.level} • {song.timeSignature}</p>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backBtn} onClick={() => {
            if (mode === 'sheet-music' && currentSong) {
              setCurrentSong(null);
            } else {
              setMode('home');
            }
          }}>← {mode === 'sheet-music' && currentSong ? 'Chọn bài khác' : 'Menu'}</button>
          <h1>
            {mode === 'sight-reading' && 'Đọc Nốt'}
            {mode === 'intervals' && 'Quãng'}
            {mode === 'ear-training' && 'Luyện Nghe'}
            {mode === 'sheet-music' && currentSong?.title}
          </h1>
        </div>

        <div className={styles.stats}>
          <div className={styles.scoreBadge}>Điểm: {score}</div>
          {mode !== 'sheet-music' && <div className={styles.streakBadge}>Streak: {streak}</div>}
          {mode === 'sheet-music' && currentSong && (
            <div className={styles.streakBadge}>Tiến độ: {songNoteIndex}/{currentSong.notes.length}</div>
          )}
        </div>
      </div>

      <div className={styles.settingsGroup}>
        {mode !== 'intervals' && mode !== 'sheet-music' && (
          <div className={styles.toggleGroup}>
            <button className={`${styles.toggleBtn} ${notation === 'abc' ? styles.active : ''}`} onClick={() => setNotation('abc')}>C D E</button>
            <button className={`${styles.toggleBtn} ${notation === 'vi' ? styles.active : ''}`} onClick={() => setNotation('vi')}>Đô Rê Mi</button>
          </div>
        )}
        {mode !== 'sheet-music' && (
          <div className={styles.toggleGroup}>
            <button className={`${styles.toggleBtn} ${clefSetting === 'treble' ? styles.active : ''}`} onClick={() => setClefSetting('treble')}>Khoá Sol</button>
            <button className={`${styles.toggleBtn} ${clefSetting === 'bass' ? styles.active : ''}`} onClick={() => setClefSetting('bass')}>Khoá Pha</button>
            <button className={`${styles.toggleBtn} ${clefSetting === 'both' ? styles.active : ''}`} onClick={() => setClefSetting('both')}>Cả hai</button>
          </div>
        )}
      </div>

      <div className={styles.gameArea}>
        {mode === 'sheet-music' ? (
          <SheetStaff song={currentSong} currentIndex={songNoteIndex} />
        ) : (
          <Staff 
            notes={currentNotes} 
            status={status} 
            hidden={mode === 'ear-training' && status !== 'correct'} 
          />
        )}
      </div>

      {mode === 'ear-training' && (
        <button className={`${styles.replayBtn} glass`} onClick={replayAudio}>
          🔊 Nghe lại
        </button>
      )}

      <div className={styles.controls}>
        {(mode === 'sight-reading' || mode === 'ear-training' || mode === 'sheet-music') && ALL_NOTES.map(name => (
          <button 
            key={name} 
            className={`${styles.noteBtn} ${pressingNote === name ? styles.pressing : ''} ${status === 'wrong' ? styles.errorShake : ''} glass`}
            onPointerDown={() => handlePointerDown(name)}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onContextMenu={(e) => e.preventDefault()}
            style={getHoldStyle(name)}
          >
            {pressingNote === name && (
              <div className={styles.holdProgress}></div>
            )}
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
        {mode === 'sheet-music' && "Nhấn và GIỮ phím đàn theo đúng trường độ của nốt nhạc (vòng tròn màu xanh đầy là xong)."}
      </p>
    </main>
  );
}
