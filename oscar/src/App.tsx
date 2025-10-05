import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';





import { LanguageProvider } from './hooks/story1/useLanguage';

import { LanguageProvider as Story2LanguageProvider } from './context/story2/LanguageContext';
import HomePage from './pages/HomePage';
import StoriesPage from './pages/StoriesPage'; // # 绘本选择页面
import AIGeneratePage from './pages/AIGeneratePage'; // # AI生成页面
import Story1Page from './pages/Story1Page';
import Story2Page from './pages/Story2Page';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stories" element={<StoriesPage />} /> {/* # 绘本选择路由 */}
          <Route path="/ai-generate" element={<AIGeneratePage />} /> {/* # AI生成路由 */}
          <Route path="/story1" element={
            <LanguageProvider>
              <Story1Page />
            </LanguageProvider>
          } />
          <Route path="/story2" element={
            <Story2LanguageProvider>
              <Story2Page />
            </Story2LanguageProvider>
          } />
        </Routes>
      </div>
    </Router>
  );
}



export default App;
