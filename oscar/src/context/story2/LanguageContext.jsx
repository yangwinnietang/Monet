import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  
  const t = (key) => {
    const translations = {
      en: {
        fullscreen: 'Fullscreen',
        exit_fullscreen: 'Exit Fullscreen',
        autoplay: 'Autoplay',
        settings: 'Settings',
        play: 'Play',
        pause: 'Pause',
        bookmark: 'Bookmark',
        navigation: 'Use arrow keys to navigate, space to play/pause',
        scene: 'Scene'
      },
      zh: {
        fullscreen: '全屏',
        exit_fullscreen: '退出全屏',
        autoplay: '自动播放',
        settings: '设置',
        play: '播放',
        pause: '暂停',
        bookmark: '书签',
        navigation: '使用方向键导航，空格键播放/暂停',
        scene: '场景'
      }
    };
    
    return translations[language]?.[key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};