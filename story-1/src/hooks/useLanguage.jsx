import { useState, useEffect, createContext, useContext } from 'react';
import { languages, defaultLanguage } from '../i18n/languages';

// 创建语言上下文
const LanguageContext = createContext();

// 语言提供者组件
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);
  
  // 从localStorage加载语言偏好
  useEffect(() => {
    const savedLanguage = localStorage.getItem('study-language');
    if (savedLanguage && languages[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);
  
  // 保存语言偏好到localStorage
  useEffect(() => {
    localStorage.setItem('study-language', currentLanguage);
  }, [currentLanguage]);
  
  // 切换语言函数
  const changeLanguage = (languageCode) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };
  
  // 获取翻译文本函数
  const t = (key, fallback = key) => {
    const keys = key.split('.');
    let value = languages[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    // Return the actual value (string, array, or object) instead of forcing to string
    return value !== undefined ? value : fallback || key;
  };
  
  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isEnglish: currentLanguage === 'en',
    isChinese: currentLanguage === 'zh'
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// 使用语言Hook
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
