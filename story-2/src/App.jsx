import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import Scene from './components/Scene';
import SettingsPanel from './components/SettingsPanel';
import { scenes, bookInfo } from './data/scenes';
import './App.css';

function App() {
  const [currentScene, setCurrentScene] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [animationState, setAnimationState] = useState('idle'); // 'idle', 'turning-left', 'turning-right'
  
  const { stopAudio } = useAudioPlayer();

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Navigation functions
  const goToNextScene = useCallback(() => {
    if (currentScene < scenes.length - 1) {
      setAnimationState('turning-right');
      setTimeout(() => {
        setCurrentScene(prev => prev + 1);
        setAnimationState('idle');
      }, 400);
    }
  }, [currentScene]);

  const goToPrevScene = useCallback(() => {
    if (currentScene > 0) {
      setAnimationState('turning-left');
      setTimeout(() => {
        setCurrentScene(prev => prev - 1);
        setAnimationState('idle');
      }, 400);
    }
  }, [currentScene]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch(e.code) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          goToNextScene();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goToPrevScene();
          break;
        case 'Space':
          e.preventDefault();
          // Handle audio play/pause
          break;
        case 'Escape':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToNextScene, goToPrevScene]);

  // Handle scroll navigation
  useEffect(() => {
    let isScrolling = false;
    
    const handleWheel = (e) => {
      if (isScrolling) return;
      
      isScrolling = true;
      
      if (e.deltaY > 0) {
        goToNextScene();
      } else {
        goToPrevScene();
      }
      
      setTimeout(() => {
        isScrolling = false;
      }, 800);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [goToNextScene, goToPrevScene]);

  // Handle bookmark
  const handleBookmark = useCallback((sceneId) => {
    setBookmarks(prev => {
      if (prev.includes(sceneId)) {
        return prev.filter(id => id !== sceneId);
      } else {
        return [...prev, sceneId];
      }
    });
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (autoplay && currentScene < scenes.length - 1) {
      const timer = setTimeout(() => {
        goToNextScene();
      }, 8000); // Auto advance after 8 seconds
      
      return () => clearTimeout(timer);
    }
  }, [currentScene, autoplay, goToNextScene]);

  return (
    <LanguageProvider>
      <div className={`App ${isFullscreen ? 'fullscreen' : ''}`}>
        <header className="book-header">
          <h1 className="book-title">{bookInfo.title}</h1>
          <p className="book-author">by {bookInfo.author}</p>
        </header>

        <main className="book-container">
          <div className={`page-container ${animationState}`}>
            {scenes.map((scene, index) => (
              <Scene
                key={scene.id}
                scene={scene}
                isActive={index === currentScene}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
        </main>

        <footer className="book-footer">
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {currentScene + 1} / {scenes.length}
            </span>
          </div>
          
          <p className="navigation-hint">{bookInfo.description}</p>
        </footer>

        <SettingsPanel
          isOpen={settingsOpen}
          onToggle={() => setSettingsOpen(!settingsOpen)}
          autoplay={autoplay}
          onAutoplayChange={setAutoplay}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>
    </LanguageProvider>
  );
}

export default App;