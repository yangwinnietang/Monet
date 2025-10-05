import React, { useState } from 'react'; // # 引入React和状态管理
import './ImagePreview.css';

interface ImageData {
  id: string; // # 图片唯一标识
  url: string; // # 图片URL
  prompt: string; // # 生成提示词
  sceneIndex: number; // # 对应场景索引
  isLoading?: boolean; // # 是否正在加载
  error?: string; // # 错误信息
}

interface ImagePreviewProps {
  images: ImageData[]; // # 图片数据数组
  isGenerating?: boolean; // # 是否正在生成
  onRegenerateImage?: (imageId: string, prompt: string) => void; // # 重新生成回调
  onImageClick?: (image: ImageData) => void; // # 图片点击回调
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  isGenerating = false,
  onRegenerateImage,
  onImageClick
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null); // # 选中的图片
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({}); // # 图片加载状态

  // 处理图片加载完成
  const handleImageLoad = (imageId: string) => {
    setImageLoadStates(prev => ({ ...prev, [imageId]: true }));
  };

  // 处理图片加载错误
  const handleImageError = (imageId: string) => {
    setImageLoadStates(prev => ({ ...prev, [imageId]: false }));
  };

  // 打开图片查看器
  const openImageViewer = (image: ImageData) => {
    setSelectedImage(image);
    onImageClick?.(image);
  };

  // 关闭图片查看器
  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  // 处理重新生成
  const handleRegenerate = (image: ImageData, e: React.MouseEvent) => {
    e.stopPropagation();
    onRegenerateImage?.(image.id, image.prompt);
  };

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeImageViewer();
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="image-preview-empty">
        <div className="empty-content">
          <div className="empty-icon">🖼️</div>
          <p>暂无生成的图片</p>
          <small>完成故事生成后，图片将在此显示</small>
        </div>
      </div>
    );
  }

  return (
    <div className="image-preview-container">
      <div className="image-grid">
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className={`image-item ${image.isLoading ? 'loading' : ''} ${image.error ? 'error' : ''}`}
            onClick={() => !image.isLoading && !image.error && openImageViewer(image)}
          >
            <div className="image-wrapper">
              {image.isLoading ? (
                <div className="image-loading">
                  <div className="loading-spinner"></div>
                  <p>生成中...</p>
                </div>
              ) : image.error ? (
                <div className="image-error">
                  <div className="error-icon">⚠️</div>
                  <p>生成失败</p>
                  <button 
                    className="retry-btn"
                    onClick={(e) => handleRegenerate(image, e)}
                    disabled={isGenerating}
                  >
                    重试
                  </button>
                </div>
              ) : (
                <>
                  <img 
                    src={image.url}
                    alt={`场景 ${image.sceneIndex + 1}`}
                    className={`scene-image ${imageLoadStates[image.id] ? 'loaded' : ''}`}
                    onLoad={() => handleImageLoad(image.id)}
                    onError={() => handleImageError(image.id)}
                  />
                  <div className="image-overlay">
                    <div className="image-info">
                      <span className="scene-number">场景 {image.sceneIndex + 1}</span>
                    </div>
                    <div className="image-actions">
                      <button 
                        className="action-btn regenerate-btn"
                        onClick={(e) => handleRegenerate(image, e)}
                        disabled={isGenerating}
                        title="重新生成"
                      >
                        🔄
                      </button>
                      <button 
                        className="action-btn view-btn"
                        onClick={() => openImageViewer(image)}
                        title="查看大图"
                      >
                        🔍
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 图片查看器模态框 */}
      {selectedImage && (
        <div 
          className="image-viewer-overlay"
          onClick={closeImageViewer}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="viewer-header">
              <h3>场景 {selectedImage.sceneIndex + 1}</h3>
              <button 
                className="close-btn"
                onClick={closeImageViewer}
                title="关闭"
              >
                ×
              </button>
            </div>
            <div className="viewer-body">
              <img 
                src={selectedImage.url}
                alt={`场景 ${selectedImage.sceneIndex + 1}`}
                className="viewer-image"
              />
            </div>
            <div className="viewer-footer">
              <div className="image-prompt">
                <strong>生成提示：</strong>
                <p>{selectedImage.prompt}</p>
              </div>
              <div className="viewer-actions">
                <button 
                  className="action-btn regenerate-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerate(selectedImage, e);
                    closeImageViewer();
                  }}
                  disabled={isGenerating}
                >
                  🔄 重新生成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;