import React from 'react';
import { Settings, Monitor, MonitorSpeaker, Languages } from 'lucide-react';
import { useLanguage } from '../../context/story2/LanguageContext';

const SettingsPanel = ({ 
  isOpen, 
  onToggle, 
  autoplay, 
  onAutoplayChange,
  isFullscreen,
  onToggleFullscreen
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
      <button 
        className="settings-toggle"
        onClick={onToggle}
        aria-label={t('settings')}
      >
        <Settings size={20} />
      </button>
      
      {isOpen && (
        <div className="settings-content">
          <div className="settings-section">
            <h3>{t('settings')}</h3>
            
            <div className="setting-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={autoplay} 
                  onChange={(e) => onAutoplayChange(e.target.checked)}
                />
                <span>{t('autoplay')}</span>
              </label>
            </div>
            
            <div className="setting-item">
              <button 
                className="fullscreen-button"
                onClick={onToggleFullscreen}
              >
                {isFullscreen ? <Monitor size={16} /> : <MonitorSpeaker size={16} />}
                <span>{isFullscreen ? t('exit_fullscreen') : t('fullscreen')}</span>
              </button>
            </div>
            
            <div className="setting-item">
              <label>
                <Languages size={16} />
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                </select>
              </label>
            </div>
          </div>
          
          <div className="navigation-hint">
            <p>{t('navigation')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;