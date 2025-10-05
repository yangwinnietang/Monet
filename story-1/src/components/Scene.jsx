import React, { useState, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';

function Scene({ scene, isActive, isBookmarked, onToggleBookmark, style = {}, className = '' }) {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [canPlay, setCanPlay] = useState(false);
  const audioRef = useRef(null);
  
  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !canPlay) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      try {
        setIsLoading(true);
        await audio.play();
        setHasError(false);
        setErrorMessage('');
      } catch (error) {
        console.error('Audio play failed:', error);
        setHasError(true);
        setErrorMessage(t('ui.audio.error'));
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
      setCanPlay(true);
      setIsLoading(false);
      setHasError(false);
    }
  };
  
  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
  };
  
  const handleCanPlay = () => {
    setCanPlay(true);
    setIsLoading(false);
  };
  
  const handleError = (e) => {
    console.error('Audio error:', e);
    setHasError(true);
    setIsLoading(false);
    setCanPlay(false);
    setIsPlaying(false);
    
    const audio = audioRef.current;
    if (audio && audio.error) {
      switch (audio.error.code) {
        case audio.error.MEDIA_ERR_ABORTED:
          setErrorMessage(t('ui.audio.errors.aborted'));
          break;
        case audio.error.MEDIA_ERR_NETWORK:
          setErrorMessage(t('ui.audio.errors.network'));
          break;
        case audio.error.MEDIA_ERR_DECODE:
          setErrorMessage(t('ui.audio.errors.decode'));
          break;
        case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          setErrorMessage(t('ui.audio.errors.notSupported'));
          break;
        default:
          setErrorMessage(t('ui.audio.error'));
      }
    } else {
      setErrorMessage(t('ui.audio.errors.notFound'));
    }
  };
  
  const handleWaiting = () => {
    setIsLoading(true);
  };
  
  const handleCanPlayThrough = () => {
    setIsLoading(false);
  };
  
  const handleSeek = (e, targetTime = null) => {
    const audio = audioRef.current;
    if (audio && duration > 0) {
      let seekTime;
      if (targetTime !== null) {
        seekTime = targetTime;
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        seekTime = (clickX / rect.width) * duration;
      }
      audio.currentTime = Math.max(0, Math.min(duration, seekTime));
    }
  };
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <section 
      className={className || `scene ${isActive ? 'active' : ''}`}
      role="tabpanel"
      aria-label={`${t('ui.common.scene')}${scene.id}: ${scene.title}`}
      aria-hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
      style={style}
    >
      <div className="scene-content">
        {/* Bookmark Button */}
        <button 
          className={`bookmark-toggle ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={onToggleBookmark}
          title={isBookmarked ? t('ui.navigation.removeBookmark') : t('ui.navigation.bookmark')}
          aria-label={isBookmarked ? `${t('ui.navigation.removeBookmark')}: ${scene.title}` : `${t('ui.navigation.bookmark')}: ${scene.title}`}
          tabIndex={isActive ? 0 : -1}
        >
          <span className="bookmark-star">
            {isBookmarked ? '★' : '☆'}
          </span>
        </button>
        
        {/* Scene Image */}
        <div className="scene-image-container">
          <img 
            src={scene.image} 
            alt={`${scene.title} - ${scene.description}`}
            className="scene-image"
            loading="lazy"
            role="img"
          />
          <div className="image-overlay"></div>
        </div>
        
        {/* Scene Text */}
        <div className="scene-text">
          <h2 className="scene-title" id={`scene-title-${scene.id}`} tabIndex={isActive ? 0 : -1}>
            {scene.title}
          </h2>
          <blockquote 
            className="scene-quote" 
            aria-label={t('ui.common.scene')}
            tabIndex={isActive ? 0 : -1}
          >
            "{scene.quote}"
          </blockquote>
          <p 
            className="scene-description" 
            aria-label={t('ui.common.scene')}
            tabIndex={isActive ? 0 : -1}
          >
            {scene.description}
          </p>
          
          {/* Audio Player */}
          <div className="audio-player">
            <audio 
              ref={audioRef}
              id={`audio-${scene.id}`}
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onLoadStart={handleLoadStart}
              onCanPlay={handleCanPlay}
              onCanPlayThrough={handleCanPlayThrough}
              onError={handleError}
              onWaiting={handleWaiting}
              onEnded={() => {
                setIsPlaying(false);
                setCurrentTime(0);
              }}
              aria-label={`${scene.title} ${t('ui.audio.loading')}`}
            >
              <source src={`/audio/scene-${String(scene.id).padStart(2, '0')}.mp3`} type="audio/mpeg" />
              <source src={`/audio/scene-${String(scene.id).padStart(2, '0')}.wav`} type="audio/wav" />
              {t('ui.audio.loading')}
            </audio>
            
            <div className="audio-controls">
              <button 
                className={`play-btn ${hasError ? 'error' : ''} ${!canPlay && !hasError ? 'disabled' : ''}`}
                onClick={handlePlayPause}
                disabled={!canPlay && !hasError}
                title={
                  hasError ? t('ui.audio.error') :
                  !canPlay ? t('ui.audio.loading') :
                  isPlaying ? t('ui.audio.pause') : t('ui.audio.play')
                }
                aria-label={
                  hasError ? `${scene.title} ${t('ui.audio.error')}` :
                  !canPlay ? `${scene.title} ${t('ui.audio.loading')}` :
                  isPlaying ? `${t('ui.audio.pause')} ${scene.title}` : `${t('ui.audio.play')} ${scene.title}`
                }
                tabIndex={isActive ? 0 : -1}
              >
                {isLoading ? (
                  <span className="loading-spinner" aria-hidden="true"></span>
                ) : hasError ? (
                  <span className="error-icon" aria-hidden="true">⚠️</span>
                ) : (
                  <span className="play-icon" aria-hidden="true">
                    {isPlaying ? '⏸️' : '▶️'}
                  </span>
                )}
              </button>
              
              <div className="audio-info">
                <div 
                  className="progress-container" 
                  onClick={handleSeek}
                  role="slider"
                  aria-label={t('ui.audio.volume')}
                  aria-valuemin="0"
                  aria-valuemax={duration}
                  aria-valuenow={currentTime}
                  aria-valuetext={`${t('ui.audio.play')} ${formatTime(currentTime)}, ${t('ui.common.duration')} ${formatTime(duration)}`}
                  tabIndex={isActive ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      handleSeek(e.currentTarget, currentTime - 5);
                    } else if (e.key === 'ArrowRight') {
                      handleSeek(e.currentTarget, currentTime + 5);
                    }
                  }}
                >
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="time-display" aria-live="polite">
                  {hasError ? (
                    <div className="error-message">
                      <span className="error-text">{errorMessage}</span>
                      <button 
                        className="retry-btn"
                        onClick={() => {
                          const audio = audioRef.current;
                          if (audio) {
                            setHasError(false);
                            setErrorMessage('');
                            audio.load();
                          }
                        }}
                        title={t('ui.common.retry')}
                      >
                        {t('ui.common.retry')}
                      </button>
                    </div>
                  ) : isLoading && !canPlay ? (
                    <div className="loading-message">
                      <span>{t('ui.audio.loading')}</span>
                    </div>
                  ) : (
                    <>
                      <span className="current-time" aria-label={t('ui.common.duration')}>
                        {formatTime(currentTime)}
                      </span>
                      <span className="duration" aria-label={t('ui.common.duration')}>
                        {canPlay && duration > 0 ? formatTime(duration) : scene.duration}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scene;