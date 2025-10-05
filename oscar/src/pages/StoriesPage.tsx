import React, { useEffect, useState } from 'react'; // # 引入状态与副作用
import { Link } from 'react-router-dom';
import './StoriesPage.css';
import { COVER_IMAGES, COVER_BG_OPACITY, ANIM_INTERVAL_MS, ANIM_FADE_MS, ANIM_SCALE, ANIM_TRANSLATEX, ANIM_TRANSLATEY } from '../data/siteConfig'; // # 统一配置

function StoriesPage() {
  const [useA, setUseA] = useState(true);
  const [imgA, setImgA] = useState(COVER_IMAGES[0]);
  const [imgB, setImgB] = useState(COVER_IMAGES[1]); // # 双层图
  
  useEffect(() => {
    let i = 0, a = true;
    const t = setInterval(() => {
      const n = (i + 1) % COVER_IMAGES.length;
      new Image().src = COVER_IMAGES[n];
      if (a) {
        setImgB(COVER_IMAGES[n]);
        setUseA(false);
      } else {
        setImgA(COVER_IMAGES[n]);
        setUseA(true);
      }
      i = n;
      a = !a;
    }, ANIM_INTERVAL_MS);
    return () => clearInterval(t);
  }, []); // # 预载+交替
  
  const sA = {
    backgroundImage: `url(${imgA})`,
    opacity: useA ? COVER_BG_OPACITY : 0,
    transition: `opacity ${ANIM_FADE_MS}ms ease,transform ${ANIM_FADE_MS}ms ease`,
    transform: `scale(${1 + ANIM_SCALE}) translate(${ANIM_TRANSLATEX}px,${ANIM_TRANSLATEY}px)`,
    willChange: 'opacity,transform'
  }; // # A层样式
  
  const sB = {
    backgroundImage: `url(${imgB})`,
    opacity: useA ? 0 : COVER_BG_OPACITY,
    transition: `opacity ${ANIM_FADE_MS}ms ease,transform ${ANIM_FADE_MS}ms ease`,
    transform: `scale(${1 + ANIM_SCALE}) translate(${ANIM_TRANSLATEX}px,${ANIM_TRANSLATEY}px)`,
    willChange: 'opacity,transform'
  }; // # B层样式

  return (
    <div className="stories-page">
      <div className="stories-bgA" style={sA} /> {/* # 旧/现图层A */}
      <div className="stories-bgB" style={sB} /> {/* # 旧/现图层B */}
      <header className="stories-header">
        <Link to="/" className="back-button">← 返回首页</Link>
        <h1>Try the Monet Digital Human</h1>
      </header>
      <main className="stories-main">
        <div className="books-grid">
          <Link to="/story1" className="book-card">
            <div className="book-image"><img src="/imgs/scene-01.jpg" alt="福尔摩斯探案" /></div>
            <div className="book-info"><h2>福尔摩斯探案</h2><p>跟随大侦探福尔摩斯，解开神秘案件的真相</p><div className="book-features"><span>🎵 音频朗读</span><span>🔖 书签功能</span><span>🌐 双语支持</span></div></div>
          </Link>
          <Link to="/story2" className="book-card">
            <div className="book-image"><img src="/imgs/monet_scene1_garden_remade.png" alt="莫奈水莲" /></div>
            <div className="book-info"><h2>莫奈水莲</h2><p>欣赏印象派大师莫奈的水莲画作之美</p><div className="book-features"><span>🎨 艺术欣赏</span><span>🎵 背景音乐</span><span>📖 翻页动画</span></div></div>
          </Link>
        </div>
        <div className="ai-generate-section">
          <Link to="/ai-generate" className="ai-generate-btn">
            <span className="ai-icon">✨</span>
            <span className="ai-text">Create Your Magical World</span>
            <span className="ai-subtitle">用AI创造属于你的故事</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default StoriesPage;