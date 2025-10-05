import React, { useEffect, useState } from 'react'; // # 引入状态与副作用
import { Link } from 'react-router-dom';
import './HomePage.css';
import { SITE_TITLE, COVER_IMAGES, COVER_BG_OPACITY, ANIM_INTERVAL_MS, ANIM_FADE_MS, ANIM_SCALE, ANIM_TRANSLATEX, ANIM_TRANSLATEY } from '../data/siteConfig'; // # 统一配置
import TextType from '../components/TextType'; // # 打字机动画
import TextPressure from '../components/TextPressure'; // # 压力感应动画
import { useImagePreloader } from '../hooks/useImagePreloader'; // # 图片预加载Hook
import LoadingPlaceholder from '../components/LoadingPlaceholder'; // # 加载占位符

function HomePage() {
  const [useA, setUseA] = useState(true);
  const [imgA, setImgA] = useState(COVER_IMAGES[0]);
  const [imgB, setImgB] = useState(COVER_IMAGES[1]); // # 双层图
  const { allLoaded, totalProgress } = useImagePreloader(COVER_IMAGES); // # 预加载所有图片
  
  useEffect(() => {
    if (!allLoaded) return; // # 等待图片加载完成
    let i = 0, a = true;
    const t = setInterval(() => {
      const n = (i + 1) % COVER_IMAGES.length;
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
  }, [allLoaded]); // # 预载+交替
  
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
    <div className="homepage">
      {!allLoaded && (
        <LoadingPlaceholder 
          progress={totalProgress} 
          message="正在加载背景图片..." 
          className={allLoaded ? 'fade-out' : ''}
        />
      )}
      <div className="homepage-bgA" style={sA} /> {/* # 旧/现图层A */}
      <div className="homepage-bgB" style={sB} /> {/* # 旧/现图层B */}
      <header className="homepage-header">
        <div style={{
          position: 'relative',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '10px' /* 从20px减少到10px，使MONET向上移动 */
        }}>
          <TextPressure
            text="Monet"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            textColor="#ffffff"
            strokeColor="#ff0000"
            minFontSize={32}
          />
        </div>
      </header>
      <main className="homepage-main">
      </main>
      <footer className="homepage-footer">
        <div className="homepage-bottom-button">
          <Link to="/stories" className="get-started-button">
            Get Started
          </Link>
        </div>
        <TextType 
          text="Welcome to Monet's magical world"
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="|"
          className="homepage-subtitle-bottom"
          variableSpeed={undefined}
          onSentenceComplete={undefined}
        />
      </footer>
    </div>
  );
}

export default HomePage;