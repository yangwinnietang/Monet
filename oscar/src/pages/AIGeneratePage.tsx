import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COVER_IMAGES, COVER_BG_OPACITY, ANIM_INTERVAL_MS } from '../data/siteConfig';
import StoryInputForm from '../components/aiGenerate/StoryInputForm';
import GenerationProgress from '../components/aiGenerate/GenerationProgress';
import ImagePreview from '../components/aiGenerate/ImagePreview';
import BookSavePanel from '../components/aiGenerate/BookSavePanel';
import { useAIGeneration } from '../hooks/useAIGeneration';
import './AIGeneratePage.css';

interface StoryInputData {
  theme: string;
  protagonist: string;
  setting: string;
  style: string;
}

// # 本地存储键名
const STORAGE_KEYS = {
  FORM_DATA: 'ai_generate_form_data',
  GENERATION_STATE: 'ai_generate_state',
  STORY_DATA: 'ai_generate_story',
  IMAGE_DATA: 'ai_generate_images'
};

const AIGeneratePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastFormData, setLastFormData] = useState<StoryInputData | null>(null); // # 保存表单数据
  
  const {
    isGenerating,
    progress,
    error,
    currentStep,
    storyData,
    imageData,
    generateComplete,
    cancelGeneration,
    retryGeneration,
    resetGeneration
  } = useAIGeneration();

  // # 背景图片轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => prevIndex === 0 ? 1 : 0);
    }, ANIM_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // # 状态持久化 - 保存到localStorage
  useEffect(() => {
    if (storyData || imageData.length > 0) {
      const state = {
        showProgress,
        currentStep,
        progress,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.GENERATION_STATE, JSON.stringify(state));
      if (storyData) localStorage.setItem(STORAGE_KEYS.STORY_DATA, JSON.stringify(storyData));
      if (imageData.length > 0) localStorage.setItem(STORAGE_KEYS.IMAGE_DATA, JSON.stringify(imageData));
    }
  }, [storyData, imageData, showProgress, currentStep, progress]);

  // # 页面加载时恢复状态
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEYS.GENERATION_STATE);
    const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
    
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        const isRecent = Date.now() - state.timestamp < 30 * 60 * 1000; // # 30分钟内
        
        if (isRecent && (state.currentStep === 'complete' || state.progress > 0)) {
          setShowProgress(true);
        }
      } catch (e) {
        console.warn('恢复状态失败:', e);
      }
    }
    
    if (savedFormData) {
      try {
        setLastFormData(JSON.parse(savedFormData));
      } catch (e) {
        console.warn('恢复表单数据失败:', e);
      }
    }
  }, []);

  // # 页面离开确认
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGenerating) {
        e.preventDefault();
        e.returnValue = '正在生成绘本，确定要离开吗？';
        return '正在生成绘本，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGenerating]);

  // # 获取步骤描述
  const getStepDescription = (step: string): string => {
    const stepMap: Record<string, string> = {
      idle: '准备开始生成...',
      story: '正在生成故事内容...',
      images: '正在生成插图...',
      saving: '正在保存绘本...',
      complete: '绘本生成完成！'
    };
    return stepMap[step] || '处理中...';
  };

  // # 处理表单提交
  const handleStorySubmit = useCallback(async (data: StoryInputData) => {
    console.log('故事数据提交:', data);
    setLastFormData(data);
    setShowProgress(true);
    
    // # 保存表单数据
    localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(data));
    
    try {
      await generateComplete(data);
    } catch (err) {
      console.error('生成失败:', err);
    }
  }, [generateComplete]);

  // # 处理重试
  const handleRetry = useCallback(() => {
    if (lastFormData) {
      resetGeneration();
      setShowProgress(false);
      // # 清理存储的状态
      localStorage.removeItem(STORAGE_KEYS.GENERATION_STATE);
      localStorage.removeItem(STORAGE_KEYS.STORY_DATA);
      localStorage.removeItem(STORAGE_KEYS.IMAGE_DATA);
    }
  }, [lastFormData, resetGeneration]);

  // # 处理图片重新生成
  const handleRegenerateImage = useCallback(async (imageId: string, prompt: string) => {
    console.log('重新生成图片:', imageId, prompt);
    // # TODO: 实现单个图片重新生成API调用
  }, []);

  // # 处理书籍保存
  const handleSaveBook = useCallback(async (bookData: any) => {
    setIsSaving(true);
    try {
      // # 数据验证和清理
      const storyParagraphs = storyData?.paragraphs || storyData?.story?.paragraphs || storyData?.scenes || storyData?.story?.scenes;
      if (!storyData || !storyParagraphs || storyParagraphs.length === 0) {
        throw new Error('故事数据不完整，无法保存');
      }

      const saveData = {
        title: bookData.title?.trim() || '未命名绘本',
        description: bookData.description?.trim() || '',
        category: bookData.category || 'children',
        tags: Array.isArray(bookData.tags) ? bookData.tags : [],
        isPublic: Boolean(bookData.isPublic),
        story: {
          ...storyData.story,
          paragraphs: storyParagraphs.filter(p => p && (typeof p === 'string' ? p.trim() !== '' : p.text || p.imagePrompt)),
          scenes: storyData.scenes || storyData.story?.scenes || [],
        },
        images: Array.isArray(imageData) ? imageData.filter(img => img && img.url) : [],
        createdAt: new Date().toISOString()
      };

      console.log('准备保存的书籍数据:', {
        title: saveData.title,
        paragraphCount: saveData.story.paragraphs.length,
        imageCount: saveData.images.length,
        hasStory: !!saveData.story,
        storyKeys: Object.keys(saveData.story)
      });
      
      const response = await fetch('/api/save-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('保存失败详情:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestData: saveData
        });
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('书籍保存成功:', result);
      
      // # 保存成功后清理本地存储并跳转
      localStorage.removeItem(STORAGE_KEYS.GENERATION_STATE);
      localStorage.removeItem(STORAGE_KEYS.STORY_DATA);
      localStorage.removeItem(STORAGE_KEYS.IMAGE_DATA);
      localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
      
      alert('绘本保存成功！');
      setShowSavePanel(false);
      
      // # 可选：跳转到故事列表页面
      // navigate('/stories');
    } catch (error) {
      console.error('保存书籍失败:', error);
      const errorMessage = error instanceof Error ? error.message : '保存失败，请重试';
      alert(`保存失败: ${errorMessage}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [storyData, imageData]);

  // # 处理返回首页
  const handleBackToForm = useCallback(() => {
    if (isGenerating) {
      const confirmed = window.confirm('正在生成中，确定要返回吗？这将取消当前生成。');
      if (!confirmed) return;
      cancelGeneration();
    }
    
    setShowProgress(false);
    resetGeneration();
  }, [isGenerating, cancelGeneration, resetGeneration]);

  return (
    <div className="ai-generate-page">
      {/* # 背景图片 */}
      <div 
        className="ai-generate-bgA"
        style={{
          backgroundImage: `url(${COVER_IMAGES[0]})`,
          opacity: currentImageIndex === 0 ? COVER_BG_OPACITY : 0,
        }}
      />
      <div 
        className="ai-generate-bgB"
        style={{
          backgroundImage: `url(${COVER_IMAGES[1]})`,
          opacity: currentImageIndex === 1 ? COVER_BG_OPACITY : 0,
        }}
      />

      {/* # 页面头部 */}
      <header className="ai-generate-header">
        <nav className="ai-generate-nav">
          <Link to="/" className="nav-link">首页</Link>
          <Link to="/stories" className="nav-link">故事</Link>
          <Link to="/ai-generate" className="nav-link active">AI生成</Link>
        </nav>
      </header>

      {/* # 主要内容 */}
      <main className="ai-generate-main">
        <div className="ai-generate-content">
          {!showProgress ? (
            <StoryInputForm 
              onSubmit={handleStorySubmit}
              isLoading={isGenerating}
              initialData={lastFormData} // # 传递保存的表单数据
            />
          ) : (
            <>
              {/* # 步骤导航 */}
              <div className="step-navigation">
                <button 
                  className="back-btn"
                  onClick={handleBackToForm}
                  disabled={isGenerating}
                  type="button"
                >
                  ← 返回编辑
                </button>
              </div>

              {/* # 生成进度 */}
              <GenerationProgress
                isGenerating={isGenerating}
                progress={progress}
                currentStep={getStepDescription(currentStep)}
                error={error}
                estimatedTime={isGenerating ? Math.max(30, 120 - progress) : undefined}
                onCancel={cancelGeneration}
                onRetry={handleRetry}
              />
              
              {/* # 图片预览 */}
              {imageData && imageData.length > 0 && (
                <>
                  <ImagePreview
                    images={imageData}
                    isGenerating={isGenerating}
                    onRegenerateImage={handleRegenerateImage}
                  />
                  
                  {/* # 保存按钮 */}
                  {!isGenerating && currentStep === 'complete' && (
                    <div className="save-actions">
                      <button 
                        className="save-book-btn"
                        onClick={() => setShowSavePanel(true)}
                        disabled={isSaving}
                        type="button"
                      >
                        {isSaving ? '保存中...' : '保存绘本'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* # 页面底部 */}
      <footer className="ai-generate-footer">
        <p>&copy; 2024 Oscar Stories. All rights reserved.</p>
      </footer>

      {/* # 书籍保存面板 */}
      <BookSavePanel
        isVisible={showSavePanel}
        onClose={() => setShowSavePanel(false)}
        onSave={handleSaveBook}
        storyData={storyData}
        imageData={imageData}
        isLoading={isSaving}
      />
    </div>
  );
};

export default AIGeneratePage;