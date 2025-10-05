import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Bookmark, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

const Scene = ({ scene, isActive, onBookmark }) => {
  const { t } = useLanguage();
  const { isPlaying, currentAudio, togglePlayPause } = useAudioPlayer();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const isCurrentlyPlaying = isPlaying && currentAudio === scene.audio;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`scene ${isActive ? 'active' : ''}`}>
      <div className="scene-content">
        <div className="scene-image-container">
          {!imageError ? (
            <img 
              src={scene.image} 
              alt={scene.title}
              className={`scene-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="scene-image-placeholder">
              <div className="placeholder-content">
                <div className="monet-style-background"></div>
                <h3>{scene.title}</h3>
              </div>
            </div>
          )}
          
          {!imageLoaded && !imageError && (
            <div className="image-loading">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
        
        <div className="scene-info">
          <h2 className="scene-title">{scene.title}</h2>
          <p className="scene-quote">"{scene.quote}"</p>
          
          <div className="scene-controls">
            <button 
              className={`audio-button ${isCurrentlyPlaying ? 'playing' : ''}`}
              onClick={() => togglePlayPause(scene.audio)}
              aria-label={isCurrentlyPlaying ? t('pause') : t('play')}
            >
              {isCurrentlyPlaying ? <Pause size={20} /> : <Play size={20} />}
              <Volume2 size={16} className="volume-icon" />
            </button>
            
            <button 
              className="bookmark-button"
              onClick={() => onBookmark(scene.id)}
              aria-label={t('bookmark')}
            >
              <Bookmark size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scene;