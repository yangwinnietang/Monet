import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { languageOptions } from '../i18n/languages';

function SettingsPanel({ settings, onUpdateSettings, onClose }) {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  
  const handleAutoplayToggle = () => {
    onUpdateSettings({ autoplay: !settings.autoplay });
  };
  
  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    onUpdateSettings({ volume });
  };
  
  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };
  
  const handleReset = () => {
    if (window.confirm(t('ui.settings.resetWarning'))) {
      onUpdateSettings({ autoplay: false, volume: 1.0 });
    }
  };
  
  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <h3>{t('ui.settings.title')}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="panel-content">
          {/* Language Selection */}
          <div className="setting-group">
            <div className="setting-item">
              <div className="setting-label">
                <label htmlFor="language-select">{t('ui.settings.language')}</label>
                <small>{t('ui.settings.languageDesc')}</small>
              </div>
              <div className="setting-control">
                <select 
                  id="language-select"
                  value={currentLanguage}
                  onChange={handleLanguageChange}
                  className="language-select"
                >
                  {languageOptions.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Audio Autoplay */}
          <div className="setting-group">
            <div className="setting-item">
              <div className="setting-label">
                <label htmlFor="autoplay-toggle">{t('ui.settings.autoplay')}</label>
                <small>{t('ui.settings.autoplayDesc')}</small>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input 
                    id="autoplay-toggle"
                    type="checkbox"
                    checked={settings.autoplay}
                    onChange={handleAutoplayToggle}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            {settings.autoplay && (
              <div className="setting-note">
                <p>{t('ui.settings.autoplayNote')}</p>
              </div>
            )}
          </div>
          
          {/* Volume Control */}
          <div className="setting-group">
            <div className="setting-item">
              <div className="setting-label">
                <label htmlFor="volume-slider">{t('ui.settings.volume')}</label>
                <small>{t('ui.settings.volumeDesc')}</small>
              </div>
              <div className="setting-control">
                <div className="volume-control">
                  <span className="volume-icon">🔈</span>
                  <input 
                    id="volume-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                  <span className="volume-value">{Math.round(settings.volume * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Usage Guide */}
          <div className="setting-group">
            <div className="setting-item">
              <div className="setting-label">
                <label>{t('ui.settings.usage')}</label>
                <small>{t('ui.settings.usageDesc')}</small>
              </div>
              <div className="usage-guide">
                <ul>
                  {t('ui.settings.usageGuide').map((item, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="panel-footer">
          <button className="reset-btn" onClick={handleReset}>
            {t('ui.settings.reset')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;