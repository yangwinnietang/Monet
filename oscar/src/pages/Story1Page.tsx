import React, { useState, useEffect, useRef } from 'react';
import { getScenes } from '../data/story1/scenes';
import { useLanguage } from '../hooks/story1/useLanguage';
import Scene from '../components/story1/Scene';
import BookmarkPanel from '../components/story1/BookmarkPanel';
import SettingsPanel from '../components/story1/SettingsPanel';
import HelpPanel from '../components/story1/HelpPanel';
import '../styles/story1.css';

function Story1Page() {
  const { t, currentLanguage } = useLanguage();
  const scenes = getScenes(currentLanguage);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ autoplay: false, volume: 1.0 });
  const [userInteracted, setUserInteracted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('forward');
  const [showHelp, setShowHelp] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [currentAudioMuted, setCurrentAudioMuted] = useState(false);
  
  const currentAudioRef = useRef(null);
  
  // Load bookmarks and settings from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('story1-bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
    
    const savedSettings = localStorage.getItem('story1-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('story1-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);
  
  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('story1-settings', JSON.stringify(settings));
  }, [settings]);
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't handle if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Handle global shortcuts
      switch (e.key.toLowerCase()) {
        // Navigation
        case 'arrowup':
          if (!isTransitioning) {
            e.preventDefault();
            handlePageChange(activeIndex - 1);
            showTemporaryHint(t('ui.navigation.previous'));
          }
          break;
        case 'arrowdown':
          if (!isTransitioning) {
            e.preventDefault();
            handlePageChange(activeIndex + 1);
            showTemporaryHint(t('ui.navigation.next'));
          }
          break;
        case 'pageup':
          if (!isTransitioning) {
            e.preventDefault();
            handlePageChange(Math.max(0, activeIndex - 3));
            showTemporaryHint(t('ui.help.shortcuts.pageUpDown'));
          }
          break;
        case 'pagedown':
          if (!isTransitioning) {
            e.preventDefault();
            handlePageChange(Math.min(scenes.length - 1, activeIndex + 3));
            showTemporaryHint(t('ui.help.shortcuts.pageUpDown'));
          }
          break;
        case 'home':
          if (!isTransitioning) {
            e.preventDefault();
            handlePageChange(0);
            showTemporaryHint(t('ui.help.shortcuts.homeEnd'));
          }
          break;
        case 'end':
          if (!isTransitioning) {
            e.preventDefault();
            handlePageChange(scenes.length - 1);
            showTemporaryHint(t('ui.help.shortcuts.homeEnd'));
          }
          break;
        
        // Audio controls
        case ' ': // Space
          e.preventDefault();
          handleAudioPlayPause();
          break;
        case 'm':
          e.preventDefault();
          handleAudioMute();
          break;
        case 'arrowleft':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleAudioSeek(-10);
            showTemporaryHint(t('ui.help.shortcuts.leftRight'));
          }
          break;
        case 'arrowright':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleAudioSeek(10);
            showTemporaryHint(t('ui.help.shortcuts.leftRight'));
          }
          break;
        case '=':
        case '+':
          e.preventDefault();
          handleVolumeChange(0.1);
          break;
        case '-':
          e.preventDefault();
          handleVolumeChange(-0.1);
          break;
        
        // Function toggles
        case 'f':
          if (e.key === 'F11' || (e.key === 'f' && !e.ctrlKey)) {
            e.preventDefault();
            toggleFullscreen();
            showTemporaryHint(isFullscreen ? t('ui.navigation.fullscreen') : t('ui.navigation.fullscreen'));
          }
          break;
        case 'b':
          e.preventDefault();
          setShowBookmarks(!showBookmarks);
          setShowSettings(false);
          setShowHelp(false);
          showTemporaryHint(showBookmarks ? t('ui.common.close') : t('ui.bookmarks.title'));
          break;
        case 's':
          e.preventDefault();
          setShowSettings(!showSettings);
          setShowBookmarks(false);
          setShowHelp(false);
          showTemporaryHint(showSettings ? t('ui.common.close') : t('ui.settings.title'));
          break;
        case 'h':
        case '?':
          e.preventDefault();
          setShowHelp(!showHelp);
          setShowBookmarks(false);
          setShowSettings(false);
          break;
        case 'escape':
          setShowBookmarks(false);
          setShowSettings(false);
          setShowHelp(false);
          if (isFullscreen) {
            document.exitFullscreen();
          }
          break;
      }
    };
    
    // Show keyboard hint on first visit
    const hasSeenHint = localStorage.getItem('story1-keyboard-hint-seen');
    if (!hasSeenHint) {
      setTimeout(() => {
        setShowKeyboardHint(true);
        localStorage.setItem('story1-keyboard-hint-seen', 'true');
      }, 2000);
    }
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeIndex, isTransitioning, showBookmarks, showSettings, showHelp, isFullscreen]);
  
  // Handle mouse wheel navigation
  useEffect(() => {
    const handleWheel = (e) => {
      if (isTransitioning) return;
      
      e.preventDefault();
      const delta = e.deltaY;
      
      if (delta > 0 && activeIndex < scenes.length - 1) {
        handlePageChange(activeIndex + 1);
      } else if (delta < 0 && activeIndex > 0) {
        handlePageChange(activeIndex - 1);
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activeIndex, isTransitioning, scenes.length]);
  
  const showTemporaryHint = (message) => {
    // Implementation for showing temporary hints
  };
  
  const handlePageChange = (newIndex) => {
    if (newIndex < 0 || newIndex >= scenes.length || isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionDirection(newIndex > activeIndex ? 'forward' : 'backward');
    
    setTimeout(() => {
      setActiveIndex(newIndex);
      
      // 动画完成后清理状态
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    }, 50);
  };
  
  const handleAudioPlayPause = () => {
    if (currentAudioRef.current) {
      if (currentAudioRef.current.paused) {
        currentAudioRef.current.play();
      } else {
        currentAudioRef.current.pause();
      }
    }
  };
  
  const handleAudioMute = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.muted = !currentAudioRef.current.muted;
      setCurrentAudioMuted(currentAudioRef.current.muted);
    }
  };
  
  const handleAudioSeek = (seconds) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.currentTime += seconds;
    }
  };
  
  const handleVolumeChange = (delta) => {
    const newVolume = Math.max(0, Math.min(1, settings.volume + delta));
    setSettings(prev => ({ ...prev, volume: newVolume }));
    if (currentAudioRef.current) {
      currentAudioRef.current.volume = newVolume;
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
  
  const addBookmark = (sceneIndex) => {
    const scene = scenes[sceneIndex];
    const bookmark = {
      id: Date.now(),
      sceneIndex,
      title: scene.title,
      timestamp: new Date().toISOString()
    };
    setBookmarks(prev => [...prev, bookmark]);
  };
  
  const removeBookmark = (bookmarkId) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };
  
  const goToBookmark = (sceneIndex) => {
    handlePageChange(sceneIndex);
    setShowBookmarks(false);
  };
  
  return (
    <div className={`app ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Scene Background Layer */}
      <div className="scene-background-layer">
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            className={`scene-background ${index === activeIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${scene.image})` }}
          />
        ))}
      </div>
      
      <div className="scenes-container">
        <div className="scenes-wrapper">
          {scenes.map((scene, index) => {
            const isCurrentlyActive = index === activeIndex;
            
            let sceneClass = 'scene';
            
            if (isCurrentlyActive && !isTransitioning) {
              sceneClass += ' active';
            } else if (isTransitioning) {
              if (isCurrentlyActive) {
                sceneClass += ' turning-in';
              } else if (index === (transitionDirection === 'forward' ? activeIndex - 1 : activeIndex + 1)) {
                sceneClass += ' turning-out';
              } else if (index < activeIndex) {
                sceneClass += ' static-behind';
              } else if (index > activeIndex) {
                sceneClass += ' static-ahead';
              }
            } else {
              if (index < activeIndex) {
                sceneClass += ' static-behind';
              } else if (index > activeIndex) {
                sceneClass += ' static-ahead';
              }
            }
            
            return (
              <Scene
                key={scene.id}
                scene={scene}
                isActive={isCurrentlyActive}
                onNext={() => handlePageChange(activeIndex + 1)}
                onPrevious={() => handlePageChange(activeIndex - 1)}
                settings={settings}
                audioRef={currentAudioRef}
                userInteracted={userInteracted}
                setUserInteracted={setUserInteracted}
                className={sceneClass}
              />
            );
          })}
        </div>
      </div>
      
      {showBookmarks && (
        <BookmarkPanel
          bookmarks={bookmarks}
          onClose={() => setShowBookmarks(false)}
          onGoTo={goToBookmark}
          onRemove={removeBookmark}
        />
      )}
      
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      {showHelp && (
        <HelpPanel
          onClose={() => setShowHelp(false)}
        />
      )}
      
      {/* Navigation UI */}
      <div className="navigation-ui">
        <div className="scene-counter">
          {activeIndex + 1} / {scenes.length}
        </div>
        
        <div className="control-buttons">
          <button onClick={() => setShowBookmarks(!showBookmarks)}>
            {t('ui.bookmarks.title')}
          </button>
          <button onClick={() => setShowSettings(!showSettings)}>
            {t('ui.settings.title')}
          </button>
          <button onClick={() => setShowHelp(!showHelp)}>
            {t('ui.help.title')}
          </button>
          <button onClick={toggleFullscreen}>
            {isFullscreen ? t('ui.navigation.exitFullscreen') : t('ui.navigation.fullscreen')}
          </button>
        </div>
      </div>
      
      {showKeyboardHint && (
        <div className="keyboard-hint" onClick={() => setShowKeyboardHint(false)}>
          <p>{t('ui.help.keyboardHint')}</p>
        </div>
      )}
    </div>
  );
}

export default Story1Page;