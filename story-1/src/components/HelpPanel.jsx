import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

function HelpPanel({ onClose }) {
  const { t } = useLanguage();
  
  const shortcuts = [
    {
      category: t('ui.help.categories.navigation'),
      items: [
        { key: '↑ / ↓', description: t('ui.help.shortcuts.upDown') },
        { key: 'PageUp / PageDown', description: t('ui.help.shortcuts.pageUpDown') },
        { key: 'Home / End', description: t('ui.help.shortcuts.homeEnd') },
        { key: 'Tab / Shift+Tab', description: t('ui.help.shortcuts.tabShiftTab') }
      ]
    },
    {
      category: t('ui.help.categories.audio'),
      items: [
        { key: 'Space', description: t('ui.help.shortcuts.space') },
        { key: 'M', description: t('ui.help.shortcuts.m') },
        { key: 'Ctrl + ← / →', description: t('ui.help.shortcuts.leftRight') },
        { key: '+ / -', description: t('ui.help.shortcuts.plusMinus') }
      ]
    },
    {
      category: t('ui.help.categories.features'),
      items: [
        { key: 'F', description: t('ui.help.shortcuts.f') },
        { key: 'B', description: t('ui.help.shortcuts.b') },
        { key: 'S', description: t('ui.help.shortcuts.s') },
        { key: 'H / ?', description: t('ui.help.shortcuts.h') }
      ]
    },
    {
      category: t('ui.help.categories.general'),
      items: [
        { key: 'Esc', description: t('ui.help.shortcuts.esc') },
        { key: 'Enter', description: t('ui.help.shortcuts.enter') },
        { key: 'F11', description: t('ui.help.shortcuts.f11') }
      ]
    }
  ];
  
  return (
    <div className="panel-overlay help-overlay" onClick={onClose}>
      <div className="help-panel" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="help-title" aria-modal="true">
        <div className="panel-header">
          <h3 id="help-title">{t('ui.help.title')}</h3>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label={t('ui.common.close')}
          >
            ×
          </button>
        </div>
        
        <div className="panel-content help-content">
          <div className="help-intro">
            <p>{t('ui.help.intro')}</p>
          </div>
          
          <div className="shortcuts-grid">
            {shortcuts.map((section, index) => (
              <div key={index} className="shortcut-section">
                <h4 className="section-title">{section.category}</h4>
                <div className="shortcut-list">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="shortcut-row">
                      <div className="shortcut-keys">
                        {item.key.split(' / ').map((keyPart, keyIndex) => (
                          <span key={keyIndex}>
                            {keyIndex > 0 && <span className="key-separator"> / </span>}
                            <kbd className="key">{keyPart}</kbd>
                          </span>
                        ))}
                      </div>
                      <div className="shortcut-desc">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="help-tips">
            <h4 className="tips-title">{t('ui.help.tips.title')}</h4>
            <ul className="tips-list">
              {t('ui.help.tips.items').map((tip, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: tip }} />
              ))}
            </ul>
          </div>
        </div>
        
        <div className="panel-footer help-footer">
          <small>📝 {t('ui.common.confirm')}: <kbd>H</kbd> {t('ui.common.confirm')} <kbd>?</kbd></small>
        </div>
      </div>
    </div>
  );
}

export default HelpPanel;