import { useState, useRef, useCallback } from 'react';
import { validateAndConvertStoryContent, logValidationError } from '../utils/validation.js';
import { aiAPI } from '../services/aiAPI';

export const useAIGeneration = () => {
  // 核心状态管理
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [storyData, setStoryData] = useState(null);
  const [imageData, setImageData] = useState([]);
  const [currentStep, setCurrentStep] = useState('idle'); // idle, story, images, complete
  
  // 引用管理
  const abortControllerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // 重置生成状态
  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setError(null);
    setStoryData(null);
    setImageData([]);
    setCurrentStep('idle');
    
    // 清理定时器和请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // 生成故事
  const generateStory = useCallback(async (inputData) => {
    try {
      setIsGenerating(true);
      setCurrentStep('story');
      setError(null);
      setProgress(10);

      abortControllerRef.current = new AbortController();
      
      // 将前端的复杂数据结构转换为后端期望的text格式
      const storyText = `主题：${inputData.theme}，主角：${inputData.protagonist}，场景：${inputData.setting}，风格：${inputData.style}`;
      
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: storyText }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error(`故事生成失败: ${response.statusText}`);
      
      const data = await response.json();
      setStoryData(data);
      setProgress(50);
      
      return data;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setIsGenerating(false);
      }
      throw err;
    }
  }, []);

  // 生成图片
  const generateImages = useCallback(async (storyContent) => {
    try {
      setCurrentStep('images');
      setProgress(60);

      // 前端数据格式验证
      if (!storyContent) {
        const error = '故事内容不能为空';
        logValidationError('generateImages - 前端验证', [error]);
        throw new Error(error);
      }

      // 验证storyContent结构
      if (typeof storyContent === 'string') {
        // 如果是字符串，转换为scenes格式
        const validation = validateAndConvertStoryContent(storyContent);
        if (!validation.isValid) {
          logValidationError('generateImages - 字符串内容验证', validation.errors);
          throw new Error(`故事内容验证失败：${validation.errors.join('; ')}`);
        }
        







        // 使用SSE实时生成图片
        const response = await aiAPI.generateImagesStream(validation.scenes, {
          onStart: (data) => {
            console.log('开始实时生成图片', data);
            setProgress(65);
          },
          onProgress: (data) => {
            console.log('图片生成进度', data);
            const progressPercent = 65 + (data.current / data.total) * 20; // 65-85%
            setProgress(progressPercent);
          },
          onImageGenerated: (data) => {
            console.log('图片生成成功', data);
            // 实时更新图片数据
            setImageData(prev => [...prev, data.image]);
          },
          onImageFailed: (data) => {
            console.warn('图片生成失败', data);
            // 可以选择显示错误提示，但不中断整个流程
          },
          signal: abortControllerRef.current?.signal
        });
        
        const images = response.results || [];
        setImageData(images);
        setProgress(90);
        return images;
      }

      // 如果是对象格式，优先使用scenes数据，其次使用paragraphs
      let scenes;
      if (storyContent.story && storyContent.story.scenes) {
        // 后端返回的完整数据结构：{ success: true, story: { scenes: [...] } }
        scenes = storyContent.story.scenes;
        console.log('使用后端返回的scenes数据', { scenesCount: scenes.length });
      } else if (storyContent.scenes) {
        // 直接的story对象：{ scenes: [...] }
        scenes = storyContent.scenes;
        console.log('使用直接的scenes数据', { scenesCount: scenes.length });
      } else {
        // 回退到paragraphs处理
        let paragraphs;
        if (storyContent.story && storyContent.story.paragraphs) {
          paragraphs = storyContent.story.paragraphs;
        } else if (storyContent.paragraphs) {
          paragraphs = storyContent.paragraphs;
        } else {

          const error = '故事内容必须包含有效的scenes或paragraphs数组';
          logValidationError('generateImages - 对象结构验证', [error], {
            storyContent: storyContent,

            hasStory: !!storyContent.story,
            hasScenes: !!(storyContent.story?.scenes || storyContent.scenes),
            hasParagraphs: !!(storyContent.story?.paragraphs || storyContent.paragraphs)
          });
          throw new Error(error);
        }

        // 转换paragraphs为scenes格式
        scenes = paragraphs.map((paragraph, index) => {
          return {
            id: paragraph.id || `scene_${index + 1}`,
            text: paragraph.text || '',
            imagePrompt: paragraph.imagePrompt || paragraph.text || ''

          };



        });
















      }

      // 验证scenes数组 - 强制6个场景
      if (!Array.isArray(scenes)) {
        const error = '故事内容必须包含有效的scenes数组';
        logValidationError('generateImages - scenes验证', [error], {
          storyContent: storyContent,
          hasScenes: !!scenes,
          scenesType: typeof scenes
        });
        throw new Error(error);
      }

      if (scenes.length !== 6) {
        const error = `故事必须包含恰好6个场景，当前为${scenes.length}个场景`;
        logValidationError('generateImages - scenes数量验证', [error], {
          storyContent: storyContent,
          scenesLength: scenes.length,
          expectedLength: 6,
          scenes: scenes
        });
        throw new Error(error);
      }

      // 验证每个scene的数据完整性
      scenes.forEach((scene, index) => {
        if (!scene || typeof scene !== 'object') {
          throw new Error(`第${index + 1}个场景格式无效`);
        }
        if (!scene.text && !scene.imagePrompt) {
          throw new Error(`第${index + 1}个场景必须包含text或imagePrompt字段`);
        }
      });

      console.log('前端数据验证通过，准备实时生成图片', {
        scenesCount: scenes.length,
        timestamp: new Date().toISOString()
      });

      // 清空之前的图片数据，准备实时更新
      setImageData([]);

      // 通过aiAPI服务层调用SSE实时生成API
      const response = await aiAPI.generateImagesStream(scenes, {
        onStart: (data) => {
          console.log('开始实时生成图片', data);
          setProgress(65);
        },
        onProgress: (data) => {
          console.log('图片生成进度', data);
          const progressPercent = 65 + (data.current / data.total) * 20; // 65-85%
          setProgress(progressPercent);
        },
        onImageGenerated: (data) => {
          console.log('图片生成成功', data);
          // 实时更新图片数据
          setImageData(prev => [...prev, data.image]);
        },
        onImageFailed: (data) => {
          console.warn('图片生成失败', data);
          // 可以选择显示错误提示，但不中断整个流程
        },
        signal: abortControllerRef.current?.signal
      });

      // 处理返回数据格式
      const images = response.results || [];
      setImageData(images);
      setProgress(90);
      
      return images;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setIsGenerating(false);
      }
      throw err;
    }
  }, []);

  // 保存书籍
  const saveBook = useCallback(async (bookData) => {
    try {
      setCurrentStep('saving');
      setProgress(95);

      // # 数据验证和清理
      if (!bookData || typeof bookData !== 'object') {
        throw new Error('书籍数据格式错误');
      }

      // # 灵活的故事数据验证
      let storyParagraphs = [];
      
      console.log('开始故事数据验证:', {
        hasStory: !!bookData.story,
        storyKeys: bookData.story ? Object.keys(bookData.story) : [],
        bookDataKeys: Object.keys(bookData)
      });
      
      // 检查多种可能的故事数据结构
      if (bookData.story) {
        if (bookData.story.paragraphs && Array.isArray(bookData.story.paragraphs)) {
          storyParagraphs = bookData.story.paragraphs;
          console.log('使用 story.paragraphs:', storyParagraphs.length, '个段落');
        } else if (bookData.story.scenes && Array.isArray(bookData.story.scenes)) {
          storyParagraphs = bookData.story.scenes;
          console.log('使用 story.scenes:', storyParagraphs.length, '个场景');
        } else if (Array.isArray(bookData.story)) {
          storyParagraphs = bookData.story;
          console.log('使用 story 数组:', storyParagraphs.length, '个元素');
        }
      } else if (bookData.paragraphs && Array.isArray(bookData.paragraphs)) {
        storyParagraphs = bookData.paragraphs;
        console.log('使用 paragraphs:', storyParagraphs.length, '个段落');
      } else if (bookData.scenes && Array.isArray(bookData.scenes)) {
        storyParagraphs = bookData.scenes;
        console.log('使用 scenes:', storyParagraphs.length, '个场景');
      }

      // 验证故事内容 - 强制6段落
      if (storyParagraphs.length !== 6) {
        console.error('故事数据结构检查:', {
          hasStory: !!bookData.story,
          storyKeys: bookData.story ? Object.keys(bookData.story) : [],
          bookDataKeys: Object.keys(bookData),
          storyType: typeof bookData.story,
          storyContent: bookData.story,
          storyParagraphs: storyParagraphs,
          storyParagraphsLength: storyParagraphs.length,
          expectedLength: 6
        });
        
        throw new Error(`故事数据不完整，无法保存：需要恰好6个段落，当前为${storyParagraphs.length}个段落`);
      }

      // # 标准化故事数据结构
      const cleanedBookData = {
        title: (bookData.title || '').trim(),
        description: (bookData.description || '').trim(),
        category: bookData.category || 'general',
        tags: Array.isArray(bookData.tags) ? bookData.tags.filter(tag => tag && tag.trim()) : [],
        isPublic: Boolean(bookData.isPublic),
        story: {
          paragraphs: storyParagraphs // 直接使用验证过的段落数据
        },
        images: Array.isArray(bookData.images) ? 
          bookData.images.filter(img => img && (img.url || img.src)) : [],
        createdAt: bookData.createdAt || new Date().toISOString()
      };

      console.log('清理后的书籍数据:', {
        title: cleanedBookData.title,
        paragraphsCount: cleanedBookData.story.paragraphs.length,
        imagesCount: cleanedBookData.images.length,
        paragraphsData: cleanedBookData.story.paragraphs
      });

      console.log('useAIGeneration 保存书籍数据:', {
        title: cleanedBookData.title,
        paragraphCount: cleanedBookData.story.paragraphs.length,
        imageCount: cleanedBookData.images.length
      });

      const response = await fetch('/api/save-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify(cleanedBookData),
        signal: abortControllerRef.current?.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('useAIGeneration 保存失败:', {
          status: response.status,
          statusText: response.statusText,
          errorData,

          requestData: cleanedBookData



        });
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setProgress(100);
      setCurrentStep('complete');
      setIsGenerating(false);
      
      return data;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setIsGenerating(false);
      }
      throw err;
    }
  }, []);

  // 完整生成流程
  const generateComplete = useCallback(async (inputData) => {
    try {
      resetGeneration();
      
      // 生成故事
      const storyResponse = await generateStory(inputData);
      
      console.log('原始故事响应:', storyResponse);
      
      // 正确提取故事数据 - 后端返回格式: { success: true, story: { paragraphs, scenes } }
      const storyData = storyResponse.story || {};
      const paragraphs = storyData.paragraphs || [];
      const scenes = storyData.scenes || [];
      
      console.log('故事数据提取:', {
        hasStoryResponse: !!storyResponse,
        hasStoryData: !!storyData,
        paragraphsCount: paragraphs.length,
        scenesCount: scenes.length,
        storyResponseKeys: Object.keys(storyResponse),
        storyDataKeys: Object.keys(storyData),
        paragraphsData: paragraphs,
        scenesData: scenes
      });
      
      // 生成图片
      const images = await generateImages(storyResponse);
      
      // 保存书籍 - 确保数据结构完整
      const bookData = {
        title: inputData.title || '未命名故事', // 确保标题存在
        description: inputData.description || '',
        category: inputData.category || 'children',
        tags: inputData.tags || [],
        isPublic: inputData.isPublic || false,
        story: {
          paragraphs: paragraphs.length > 0 ? paragraphs : scenes // 优先使用paragraphs，回退到scenes
        },
        images: images || [],
        createdAt: new Date().toISOString()
      };
      
      console.log('构建的书籍数据:', {
        title: bookData.title,
        storyParagraphs: bookData.story.paragraphs,
        paragraphsLength: bookData.story.paragraphs.length,
        rawStoryResponse: storyResponse
      });
      
      // 验证必要数据
      if (!bookData.title.trim()) {
        throw new Error('缺少必要的书籍信息（标题）');
      }
      
      if (!bookData.story.paragraphs || bookData.story.paragraphs.length === 0) {
        console.error('故事段落验证失败:', {
          hasParagraphs: !!bookData.story.paragraphs,
          paragraphsLength: bookData.story.paragraphs ? bookData.story.paragraphs.length : 0,
          paragraphsType: typeof bookData.story.paragraphs,
          originalParagraphs: paragraphs,
          originalScenes: scenes,
          bookDataStory: bookData.story
        });
        throw new Error('缺少必要的书籍信息（故事内容）');
      }
      
      console.log('准备保存的书籍数据:', {
        title: bookData.title,
        hasStory: !!bookData.story,
        paragraphCount: bookData.story.paragraphs.length,
        imageCount: bookData.images.length
      });
      
      const savedBook = await saveBook(bookData);
      
      return savedBook;
    } catch (err) {
      console.error('生成流程失败:', err);
      throw err;
    }
  }, [generateStory, generateImages, saveBook, resetGeneration]);

  // 取消生成
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    resetGeneration();
  }, [resetGeneration]);

  // 重试生成
  const retryGeneration = useCallback((inputData) => {
    resetGeneration();
    return generateComplete(inputData);
  }, [generateComplete, resetGeneration]);

  // 清理副作用
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  }, []);

  return {
    // 状态
    isGenerating,
    progress,
    error,
    storyData,
    imageData,
    currentStep,
    
    // 方法
    generateStory,
    generateImages,
    saveBook,
    generateComplete,
    cancelGeneration,
    retryGeneration,
    resetGeneration,
    cleanup
  };
};
