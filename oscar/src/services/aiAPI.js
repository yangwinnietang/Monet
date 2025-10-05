// AI API服务层 - 封装后端通信逻辑
import { validateStoryData, logValidationError } from '../utils/validation.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');

// 请求配置
const DEFAULT_CONFIG = {
  timeout: 30000, // 30秒超时
  retryCount: 3,
  retryDelay: 1000 // 1秒重试延迟
};

// 创建请求实例
class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.abortControllers = new Map();
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      data = null,
      timeout = DEFAULT_CONFIG.timeout,
      retryCount = DEFAULT_CONFIG.retryCount,
      signal = null,
      requestId = null
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    
    // 创建AbortController
    const controller = new AbortController();
    if (requestId) {
      this.abortControllers.set(requestId, controller);
    }

    // 合并信号
    const combinedSignal = signal || controller.signal;

    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: combinedSignal
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    // 超时处理
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    let lastError;
    
    // 重试机制
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // 清理请求ID
        if (requestId) {
          this.abortControllers.delete(requestId);
        }

        return result;
      } catch (error) {
        lastError = error;
        
        // 如果是取消请求，直接抛出
        if (error.name === 'AbortError') {
          throw new Error('请求已取消');
        }

        // 最后一次尝试失败
        if (attempt === retryCount) {
          break;
        }

        // 等待重试
        await new Promise(resolve => 
          setTimeout(resolve, DEFAULT_CONFIG.retryDelay * (attempt + 1))
        );
      }
    }

    clearTimeout(timeoutId);
    if (requestId) {
      this.abortControllers.delete(requestId);
    }

    throw lastError || new Error('请求失败');
  }

  // 取消请求
  cancelRequest(requestId) {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  // 取消所有请求
  cancelAllRequests() {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }
}

// 创建API客户端实例
const apiClient = new APIClient();

// AI API服务
export const aiAPI = {
  // 生成故事
  async generateStory(inputData, options = {}) {
    const requestId = `story-${Date.now()}`;
    
    try {
      const response = await apiClient.request('/api/generate-story', {
        method: 'POST',
        data: inputData,
        requestId,
        timeout: 60000, // 故事生成需要更长时间
        ...options
      });

      if (!response.success) {
        throw new Error(response.error || '故事生成失败');
      }

      return response;
    } catch (error) {
      console.error('故事生成失败:', error);
      throw new Error(error.message || '故事生成失败，请稍后重试');
    }
  },

  // 生成图片
  async generateImage(prompt, size = '1024x1024', options = {}) {
    const requestId = `image-${Date.now()}`;
    
    try {
      const response = await apiClient.request('/api/generate-image', {
        method: 'POST',
        data: { prompt, size },
        requestId,
        timeout: 90000, // 图片生成需要更长时间
        ...options
      });

      if (!response.success) {
        throw new Error(response.error || '图片生成失败');
      }

      return response;
    } catch (error) {
      console.error('图片生成失败:', error);
      throw new Error(error.message || '图片生成失败，请稍后重试');
    }
  },

  // 批量生成图片
  async generateImages(scenes, options = {}) {
    const requestId = `batch-images-${Date.now()}`;
    
    try {
      // 基础参数验证
      if (!Array.isArray(scenes) || scenes.length === 0) {
        const error = '场景数据无效：必须提供非空的场景数组';
        logValidationError('generateImages - 基础验证', [error]);
        throw new Error(error);
      }

      // 转换数据格式为后端期望的格式
      const story = {
        paragraphs: scenes.map(scene => ({
          id: scene.id,
          text: scene.text,
          imagePrompt: scene.imagePrompt || scene.text
        }))
      };

      // 详细的数据格式验证
      const validation = validateStoryData(story);
      if (!validation.isValid) {
        logValidationError('generateImages - 数据格式验证', validation.errors);
        throw new Error(`数据格式验证失败：${validation.errors.join('; ')}`);
      }

      console.log('数据验证通过，开始发送请求', {
        requestId,
        scenesCount: scenes.length,
        timestamp: new Date().toISOString()
      });

      // 调用批量生成API
      const response = await apiClient.request('/api/generate-images', {
        method: 'POST',
        data: { story },
        requestId,
        ...options
      });

      if (!response.success) {
        throw new Error(response.error || '批量图片生成失败');
      }

      // 转换返回格式保持兼容性
      const results = response.images || [];
      const errors = response.errors || [];

      console.log('批量图片生成完成', {
        requestId,
        successCount: results.length,
        errorCount: errors.length
      });

      return { results, errors };
    } catch (error) {
      console.error('批量图片生成失败:', {
        requestId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw new Error(error.message || '批量图片生成失败，请稍后重试');
    }
  },

  // SSE实时生成图片
  async generateImagesStream(scenes, callbacks = {}) {
    const requestId = `stream-images-${Date.now()}`;
    
    try {
      // 基础参数验证
      if (!Array.isArray(scenes) || scenes.length === 0) {
        const error = '场景数据无效：必须提供非空的场景数组';
        logValidationError('generateImagesStream - 基础验证', [error]);
        throw new Error(error);
      }

      // 转换数据格式为后端期望的格式
      const story = {
        paragraphs: scenes.map(scene => ({
          id: scene.id,
          text: scene.text,
          imagePrompt: scene.imagePrompt || scene.text
        }))
      };

      // 详细的数据格式验证
      const validation = validateStoryData(story);
      if (!validation.isValid) {
        logValidationError('generateImagesStream - 数据格式验证', validation.errors);
        throw new Error(`数据格式验证失败：${validation.errors.join('; ')}`);
      }

      console.log('SSE数据验证通过，开始实时生成', {
        requestId,
        scenesCount: scenes.length,
        timestamp: new Date().toISOString()
      });

      // 创建EventSource连接
      return new Promise((resolve, reject) => {
        const results = { success: [], failed: [] };
        let isCompleted = false;

        // 设置超时控制
      const timeoutId = setTimeout(() => {
        if (!isCompleted) {
          reject(new Error('SSE连接超时，请检查网络连接'));
        }
      }, 300000); // 5分钟超时

      // 发送POST请求启动SSE流
      fetch('/api/generate-images-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story })
      }).then(response => {
        if (!response.ok) {
          clearTimeout(timeoutId);
          throw new Error(`HTTP ${response.status}: SSE连接失败`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              clearTimeout(timeoutId);
              if (!isCompleted) {
                reject(new Error('SSE流意外结束'));
              }
              return;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  switch (data.type) {
                    case 'start':
                      callbacks.onStart?.(data);
                      break;
                    
                    case 'progress':
                      callbacks.onProgress?.(data);
                      break;
                    
                    case 'image_generated':
                      results.success.push(data.image);
                      callbacks.onImageGenerated?.(data);
                      break;
                    
                    case 'image_failed':
                      results.failed.push(data.error);
                      callbacks.onImageFailed?.(data);
                      break;
                    
                    case 'complete':
                      clearTimeout(timeoutId);
                      isCompleted = true;
                      console.log('SSE图片生成完成', {
                        requestId,
                        successCount: results.success.length,
                        failedCount: results.failed.length
                      });
                      resolve({ results: results.success, errors: results.failed });
                      break;
                    
                    case 'error':
                      clearTimeout(timeoutId);
                      reject(new Error(data.error));
                      break;
                  }
                } catch (parseError) {
                  console.warn('SSE数据解析失败:', parseError, line);
                }
              }
            }

            readStream(); // 继续读取
          }).catch(error => {
            clearTimeout(timeoutId);
            reject(error);
          });
        };

        readStream();
      }).catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
      });

    } catch (error) {
      console.error('SSE图片生成失败:', {
        requestId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw new Error(error.message || 'SSE图片生成失败，请稍后重试');
    }
  },

  // 保存书籍
  async saveBook(bookData, options = {}) {
    const requestId = `save-${Date.now()}`;
    
    try {
      const response = await apiClient.request('/api/save-book', {
        method: 'POST',
        data: bookData,
        requestId,
        ...options
      });

      if (!response.success) {
        throw new Error(response.error || '书籍保存失败');
      }

      return response;
    } catch (error) {
      console.error('书籍保存失败:', error);
      throw new Error(error.message || '书籍保存失败，请稍后重试');
    }
  },

  // 获取书籍列表
  async getBooks(limit = 10, options = {}) {
    try {
      const response = await apiClient.request(`/api/books?limit=${limit}`, {
        method: 'GET',
        ...options
      });

      if (!response.success) {
        throw new Error(response.error || '获取书籍列表失败');
      }

      return response.books || [];
    } catch (error) {
      console.error('获取书籍列表失败:', error);
      throw new Error(error.message || '获取书籍列表失败，请稍后重试');
    }
  },

  // 获取完整书籍
  async getBook(bookId, options = {}) {
    try {
      const response = await apiClient.request(`/api/books/${bookId}`, {
        method: 'GET',
        ...options
      });

      if (!response.success) {
        throw new Error(response.error || '获取书籍失败');
      }

      return response.book;
    } catch (error) {
      console.error('获取书籍失败:', error);
      throw new Error(error.message || '获取书籍失败，请稍后重试');
    }
  },

  // 健康检查
  async healthCheck(options = {}) {
    try {
      const response = await apiClient.request('/api/health', {
        method: 'GET',
        timeout: 5000,
        retryCount: 1,
        ...options
      });

      return response;
    } catch (error) {
      console.error('健康检查失败:', error);
      return { success: false, error: error.message };
    }
  },

  // 取消请求
  cancelRequest(requestId) {
    apiClient.cancelRequest(requestId);
  },

  // 取消所有请求
  cancelAllRequests() {
    apiClient.cancelAllRequests();
  }
};

// 导出默认实例
export default aiAPI;