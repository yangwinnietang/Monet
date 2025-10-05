import { useState, useRef, useEffect } from 'react';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentAudio, setCurrentAudio] = useState(null);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  const playAudio = (audioSrc) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(audioSrc);
    setCurrentAudio(audioSrc);
    
    audioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(audioRef.current.duration);
    });

    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
      clearInterval(intervalRef.current);
    });

    audioRef.current.play();
    setIsPlaying(true);

    intervalRef.current = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      clearInterval(intervalRef.current);
    }
  };

  const togglePlayPause = (audioSrc) => {
    if (currentAudio === audioSrc && isPlaying) {
      pauseAudio();
    } else {
      playAudio(audioSrc);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      clearInterval(intervalRef.current);
    };
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    currentAudio,
    playAudio,
    pauseAudio,
    togglePlayPause,
    stopAudio
  };
};