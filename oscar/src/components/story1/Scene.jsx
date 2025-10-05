import React, { useState, useRef } from 'react';











import { useLanguage } from '../../hooks/story1/useLanguage';

function Scene({ scene, isActive, isBookmarked, onToggleBookmark, style = {}, className = '' }) {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [canPlay, setCanPlay] = useState(false);
  const [imageLoading, setImageLoading] = useState(true); // 图片加载状态
  const [imageError, setImageError] = useState(false); // 图片错误状态
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

  // 图片加载成功处理
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // 图片加载错误处理
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    console.error('Image failed to load:', scene.image);
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
          {imageLoading && (
            <div className="image-loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
          {imageError ? (
            <div className="image-error-state">
              <div className="error-icon">⚠️</div>
              <div className="error-message">图片加载失败</div>
              <button 
                className="retry-button" 
                onClick={() => {
                  setImageError(false);
                  setImageLoading(true);
                  // 强制重新加载图片
                  const img = document.querySelector(`img[src="${scene.image}"]`);
                  if (img) {
                    img.src = scene.image + '?t=' + Date.now();
                  }
                }}
              >
                重试
              </button>
            </div>
          ) : (
            <img 
              src={scene.image} 
              alt={`${scene.title} - ${scene.description}`}
              className={`scene-image ${imageLoading ? 'loading' : 'loaded'}`}
              loading="lazy"
              role="img"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
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
            >
              <source src={scene.audioPath} type="audio/mpeg" />
              <p>{t('ui.audio.notSupported')}</p>
            </audio>
            
            <div className="audio-controls">
              <button 
                className={`play-button ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''} ${hasError ? 'error' : ''}`}
                onClick={handlePlayPause}
                disabled={!canPlay || isLoading}
                title={isPlaying ? t('ui.audio.pause') : t('ui.audio.play')}
                aria-label={`${isPlaying ? t('ui.audio.pause') : t('ui.audio.play')} ${scene.title}`}
                tabIndex={isActive ? 0 : -1}
              >
                {isLoading ? (
                  <span className="loading-spinner" aria-hidden="true">⟳</span>
                ) : hasError ? (
                  <span className="error-icon" aria-hidden="true">⚠</span>
                ) : isPlaying ? (
                  <span className="pause-icon" aria-hidden="true">⏸</span>
                ) : (
                  <span className="play-icon" aria-hidden="true">▶</span>
                )}
              </button>
              
              <div className="audio-info">
                <div className="audio-title">{scene.title}</div>
                <div className="audio-duration">{scene.duration}</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div 
              className="progress-container"
              onClick={handleSeek}
              role="slider"
              aria-label={t('ui.audio.progress')}
              aria-valuemin="0"
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              tabIndex={isActive ? 0 : -1}
            >
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
                <div 
                  className="progress-handle"
                  style={{ left: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Time Display */}
            <div className="time-display">
              <span className="current-time">{formatTime(currentTime)}</span>
              <span className="time-separator">/</span>
              <span className="total-time">{formatTime(duration)}</span>
            </div>
            
            {/* Error Message */}
            {hasError && (
              <div className="error-message" role="alert">
                <span className="error-icon">⚠</span>
                <span className="error-text">{errorMessage}</span>
                <button 
                  className="retry-button"
                  onClick={() => {
                    setHasError(false);
                    setErrorMessage('');
                    const audio = audioRef.current;
                    if (audio) {
                      audio.load();
                    }
                  }}
                  title={t('ui.audio.retry')}
                  tabIndex={isActive ? 0 : -1}
                >
                  {t('ui.audio.retry')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scene;
