// # 图片优化工具类
export class ImageOptimizer {
  // # 创建WebP格式图片URL（如果支持）
  static getOptimizedImageUrl(originalUrl: string): string {
    if (typeof window === 'undefined') return originalUrl;
    
    // # 检查浏览器是否支持WebP
    const supportsWebP = (() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })();

    if (supportsWebP && originalUrl.endsWith('.jpg')) {
      // # 如果支持WebP，尝试使用WebP版本
      const webpUrl = originalUrl.replace('.jpg', '.webp');
      return webpUrl;
    }
    
    return originalUrl;
  }

  // # 预加载图片并返回Promise
  static preloadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  // # 批量预加载图片
  static async preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    const optimizedUrls = urls.map(url => this.getOptimizedImageUrl(url));
    return Promise.all(optimizedUrls.map(url => this.preloadImage(url)));
  }

  // # 创建响应式图片srcset
  static createResponsiveSrcSet(baseUrl: string): string {
    const baseName = baseUrl.replace(/\.[^/.]+$/, '');
    const extension = baseUrl.split('.').pop();
    
    return [
      `${baseName}_480.${extension} 480w`,
      `${baseName}_768.${extension} 768w`,
      `${baseName}_1200.${extension} 1200w`,
      `${baseUrl} 1920w`
    ].join(', ');
  }

  // # 获取图片尺寸信息
  static getImageDimensions(url: string): Promise<{width: number, height: number}> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = url;
    });
  }
}