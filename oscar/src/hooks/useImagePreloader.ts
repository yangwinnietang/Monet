import { useState, useEffect } from 'react';
import { ImageOptimizer } from '../utils/imageOptimizer'; // # 图片优化工具

interface ImagePreloadState {
  loaded: boolean;
  error: boolean;
  progress: number;
}

export const useImagePreloader = (imageUrls: string[]) => {
  const [loadStates, setLoadStates] = useState<Record<string, ImagePreloadState>>({});
  const [allLoaded, setAllLoaded] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    if (!imageUrls.length) return;

    // # 优化图片URL
    const optimizedUrls = imageUrls.map(url => ImageOptimizer.getOptimizedImageUrl(url));

    // # 初始化状态
    const initialStates: Record<string, ImagePreloadState> = {};
    optimizedUrls.forEach(url => {
      initialStates[url] = { loaded: false, error: false, progress: 0 };
    });
    setLoadStates(initialStates);

    let loadedCount = 0;
    const totalImages = optimizedUrls.length;

    const preloadImage = (url: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        
        // # 设置图片加载优先级
        img.loading = 'eager';
        img.decoding = 'async';
        
        img.onload = () => {
          setLoadStates(prev => ({
            ...prev,
            [url]: { loaded: true, error: false, progress: 100 }
          }));
          loadedCount++;
          updateProgress();
          resolve();
        };

        img.onerror = () => {
          // # 如果优化版本失败，尝试原始版本
          const originalUrl = imageUrls[optimizedUrls.indexOf(url)];
          if (url !== originalUrl) {
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
              setLoadStates(prev => ({
                ...prev,
                [url]: { loaded: true, error: false, progress: 100 }
              }));
              loadedCount++;
              updateProgress();
              resolve();
            };
            fallbackImg.onerror = () => {
              setLoadStates(prev => ({
                ...prev,
                [url]: { loaded: false, error: true, progress: 0 }
              }));
              loadedCount++;
              updateProgress();
              resolve();
            };
            fallbackImg.src = originalUrl;
          } else {
            setLoadStates(prev => ({
              ...prev,
              [url]: { loaded: false, error: true, progress: 0 }
            }));
            loadedCount++;
            updateProgress();
            resolve();
          }
        };

        // # 模拟加载进度
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 15 + 5; // # 更快的进度更新
          if (progress >= 90) {
            clearInterval(progressInterval);
            return;
          }
          setLoadStates(prev => ({
            ...prev,
            [url]: { ...prev[url], progress }
          }));
        }, 50); // # 更频繁的进度更新

        img.src = url;
      });
    };

    const updateProgress = () => {
      const progress = (loadedCount / totalImages) * 100;
      setTotalProgress(progress);
      
      if (loadedCount === totalImages) {
        setAllLoaded(true);
      }
    };

    // # 并行预加载所有图片
    Promise.all(optimizedUrls.map(preloadImage));

  }, [imageUrls]);

  return {
    loadStates,
    allLoaded,
    totalProgress,
    isImageLoaded: (url: string) => loadStates[url]?.loaded || false,
    hasImageError: (url: string) => loadStates[url]?.error || false
  };
};