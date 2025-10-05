import React, { useState, useEffect, useRef } from 'react';
import { getScenes } from './data/scenes';
import { useLanguage } from './hooks/useLanguage';
import Scene from './components/Scene';
import BookmarkPanel from './components/BookmarkPanel';
import SettingsPanel from './components/SettingsPanel';
import HelpPanel from './components/HelpPanel';
import './App.css';

function App() {
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
    const savedBookmarks = localStorage.getItem('study-bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
    
    const savedSettings = localStorage.getItem('study-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('study-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);
  
  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('study-settings', JSON.stringify(settings));
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
    const hasSeenHint = localStorage.getItem('keyboard-hint-seen');
    if (!hasSeenHint) {
      setTimeout(() => {
        setShowKeyboardHint(true);
        localStorage.setItem('keyboard-hint-seen', 'true');
      }, 2000);
    }
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeIndex, isTransitioning, showBookmarks, showSettings, showHelp, isFullscreen]);
  
  // Handle mouse wheel navigation
  useEffect(() => {
    let wheelTimeout;
    
    const handleWheel = (e) => {
      if (isTransitioning) return;
      
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (e.deltaY > 0) {
          handlePageChange(activeIndex + 1);
        } else {
          handlePageChange(activeIndex - 1);
        }
      }, 100);
    };
    
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(wheelTimeout);
    };
  }, [activeIndex, isTransitioning]);
  
  // Auto-play audio when scene changes
  useEffect(() => {
    if (!userInteracted || !settings.autoplay) return;
    
    const playTimeout = setTimeout(async () => {
      const audioElement = document.querySelector(`#audio-${scenes[activeIndex].id}`);
      if (audioElement) {
        // Stop current audio if playing
        if (currentAudioRef.current && !currentAudioRef.current.paused) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        }
        
        // Wait for audio to be ready
        const waitForReady = () => {
          return new Promise((resolve) => {
            if (audioElement.readyState >= 3) { // HAVE_FUTURE_DATA
              resolve();
            } else {
              audioElement.addEventListener('canplay', resolve, { once: true });
              audioElement.addEventListener('error', resolve, { once: true });
            }
          });
        };
        
        try {
          await waitForReady();
          audioElement.volume = settings.volume;
          await audioElement.play();
          currentAudioRef.current = audioElement;
          showTemporaryHint(t('ui.audio.play'));
        } catch (e) {
          console.log('Autoplay prevented or failed:', e);
          showTemporaryHint(t('ui.audio.error'));
        }
      }
    }, 300);
    
    return () => clearTimeout(playTimeout);
  }, [activeIndex, settings.autoplay, settings.volume, userInteracted]);
  
  const handlePageChange = (newIndex) => {
    if (newIndex < 0 || newIndex >= scenes.length || isTransitioning) return;
    
    if (!userInteracted) setUserInteracted(true);
    
    // Determine direction
    const direction = newIndex > activeIndex ? 'forward' : 'backward';
    setTransitionDirection(direction);
    
    setIsTransitioning(true);
    
    // Start the page turn animation
    setTimeout(() => {
      setActiveIndex(newIndex);
    }, 100);
    
    // Complete the transition
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };
  
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };
  
  const toggleBookmark = (sceneId) => {
    setBookmarks(prev => {
      const isBookmarked = prev.includes(sceneId);
      if (isBookmarked) {
        return prev.filter(id => id !== sceneId);
      } else {
        return [...prev, sceneId];
      }
    });
  };
  
  const jumpToScene = (sceneId) => {
    const index = scenes.findIndex(scene => scene.id === sceneId);
    if (index !== -1) {
      handlePageChange(index);
      setShowBookmarks(false);
    }
  };
  
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  // Keyboard navigation helper functions
  const showTemporaryHint = (message) => {
    // Create temporary hint element
    const hint = document.createElement('div');
    hint.className = 'keyboard-hint-toast';
    hint.textContent = message;
    document.body.appendChild(hint);
    
    setTimeout(() => {
      hint.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      hint.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(hint);
      }, 300);
    }, 1500);
  };
  
  const handleAudioPlayPause = async () => {
    const audioElement = document.querySelector(`#audio-${scenes[activeIndex].id}`);
    if (audioElement) {
      try {
        if (audioElement.paused) {
          await audioElement.play();
          showTemporaryHint(t('ui.audio.play'));
        } else {
          audioElement.pause();
          showTemporaryHint(t('ui.audio.pause'));
        }
      } catch (error) {
        console.error('Audio play failed:', error);
        showTemporaryHint(t('ui.audio.error'));
      }
    }
  };
  
  const handleAudioMute = () => {
    const audioElement = document.querySelector(`#audio-${scenes[activeIndex].id}`);
    if (audioElement) {
      audioElement.muted = !audioElement.muted;
      setCurrentAudioMuted(audioElement.muted);
      showTemporaryHint(audioElement.muted ? t('ui.audio.muted') : t('ui.audio.unmuted'));
    }
  };
  
  const handleAudioSeek = (seconds) => {
    const audioElement = document.querySelector(`#audio-${scenes[activeIndex].id}`);
    if (audioElement) {
      audioElement.currentTime = Math.max(0, Math.min(audioElement.duration, audioElement.currentTime + seconds));
    }
  };
  
  const handleVolumeChange = (delta) => {
    const newVolume = Math.max(0, Math.min(1, settings.volume + delta));
    updateSettings({ volume: newVolume });
    showTemporaryHint(`${t('ui.audio.volume')} ${Math.round(newVolume * 100)}%`);
  };
  
  return (
    <div className={`app ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">{t('ui.title')}</h1>
        <div className="header-controls">
          <button 
            className={`control-btn bookmark-btn ${showBookmarks ? 'active' : ''}`}
            onClick={() => {
              setShowBookmarks(!showBookmarks);
              setShowSettings(false);
            }}
            title={t('ui.bookmarks.title')}
          >
            <span className="bookmark-icon">📖</span>
            {bookmarks.length > 0 && <span className="bookmark-count">{bookmarks.length}</span>}
          </button>
          
          <button 
            className={`control-btn settings-btn ${showSettings ? 'active' : ''}`}
            onClick={() => {
              setShowSettings(!showSettings);
              setShowBookmarks(false);
              setShowHelp(false);
            }}
            title={t('ui.settings.title')}
            aria-label={t('ui.settings.title')}
          >
            <span className="settings-icon">⚙️</span>
          </button>
          
          <button 
            className="control-btn fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? t('ui.navigation.fullscreen') : t('ui.navigation.fullscreen')}
            aria-label={isFullscreen ? t('ui.navigation.fullscreen') : t('ui.navigation.fullscreen')}
          >
            <span className="fullscreen-icon">
              {isFullscreen ? '🗗' : '🗖'}
            </span>
          </button>
          
          <button 
            className={`control-btn help-btn ${showHelp ? 'active' : ''}`}
            onClick={() => {
              setShowHelp(!showHelp);
              setShowBookmarks(false);
              setShowSettings(false);
            }}
            title={t('ui.navigation.help')}
            aria-label={t('ui.navigation.help')}
          >
            <span className="help-icon">?</span>
          </button>
        </div>
      </header>
      
      {/* Panels */}
      {showBookmarks && (
        <BookmarkPanel 
          bookmarks={bookmarks}
          scenes={scenes}
          onJumpToScene={jumpToScene}
          onClose={() => setShowBookmarks(false)}
        />
      )}
      
      {showSettings && (
        <SettingsPanel 
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      {showHelp && (
        <HelpPanel 
          onClose={() => setShowHelp(false)}
        />
      )}
      
      {/* Keyboard Navigation Hint */}
      {showKeyboardHint && (
        <div className="keyboard-intro-overlay" onClick={() => setShowKeyboardHint(false)}>
          <div className="keyboard-intro-panel" onClick={e => e.stopPropagation()}>
            <div className="intro-header">
              <h3>💡 {t('ui.help.title')}</h3>
              <button className="close-btn" onClick={() => setShowKeyboardHint(false)}>×</button>
            </div>
            <div className="intro-content">
              <p>{t('ui.help.intro')}</p>
              <p>您可以使用键盘快捷键来增强阅读体验：</p>
              <div className="intro-shortcuts">
                <div className="shortcut-item">
                  <kbd>↑↓</kbd>
                  <span>{t('ui.help.shortcuts.upDown')}</span>
                </div>
                <div className="shortcut-item">
                  <kbd>空格</kbd>
                  <span>{t('ui.help.shortcuts.space')}</span>
                </div>
                <div className="shortcut-item">
                  <kbd>F</kbd>
                  <span>{t('ui.help.shortcuts.f')}</span>
                </div>
                <div className="shortcut-item">
                  <kbd>H</kbd>
                  <span>{t('ui.help.shortcuts.h')}</span>
                </div>
              </div>
              <small>按 H 键随时查看完整的快捷键列表</small>
            </div>
            <div className="intro-footer">
              <button className="intro-close-btn" onClick={() => setShowKeyboardHint(false)}>
                {t('ui.common.confirm', '开始阅读')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Scene Navigator */}
      <div className="scene-navigator">
        {activeIndex > 0 && (
          <button 
            className="nav-btn nav-prev"
            onClick={() => handlePageChange(activeIndex - 1)}
            disabled={isTransitioning}
          >
            <span aria-hidden="true">‹</span>
          </button>
        )}
        
        {activeIndex < scenes.length - 1 && (
          <button 
            className="nav-btn nav-next"
            onClick={() => handlePageChange(activeIndex + 1)}
            disabled={isTransitioning}
          >
            <span aria-hidden="true">›</span>
          </button>
        )}
      </div>
      
      {/* Page Indicator */}
      <div className="page-indicator">
        <span>{activeIndex + 1} / {scenes.length}</span>
      </div>
      
      {/* Scenes Container */}
      <main className="scenes-container" role="main" aria-label={t('ui.common.scene')}>
        {/* Background Image Layer */}
        <div className="scene-background-layer">
          {scenes.map((scene, index) => (
            <div 
              key={`bg-${scene.id}`}
              className={`scene-background ${index === activeIndex ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${scene.image})`,
                opacity: index === activeIndex ? 1 : 0,
                transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            />
          ))}
        </div>
        
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
                isBookmarked={bookmarks.includes(scene.id)}
                onToggleBookmark={() => toggleBookmark(scene.id)}
                className={sceneClass}
              />
            );
          })}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="app-footer">
        <p>{t('ui.subtitle')}</p>
      </footer>
    </div>
  );
}

export default App;