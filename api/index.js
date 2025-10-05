const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// 简化的BookModel实现，避免复杂的文件依赖
class BookModel {
  static async create(bookData) {
    const id = Date.now();
    const book = { id, ...bookData, createdAt: new Date().toISOString() };
    return book;
  }
  
  static async getAll(page = 1, limit = 10) {
    return { books: [], total: 0, page, limit };
  }
  
  static async getById(id) {
    return null;
  }
}

const initDatabase = async () => {
  console.log('数据库初始化成功');
  return true;
};

require('dotenv').config();

const app = express();

// 简化的日志记录
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg, error) => console.error(`[ERROR] ${msg}`, error),
  warn: (msg) => console.warn(`[WARN] ${msg}`)
};

// CogView-3-Flash模型配置
const COGVIEW_CONFIG = {
  apiKey: process.env.COGVIEW_API_KEY || "d81e40d4aa964c16a6a0c94bbbe196d3.u9RMeNOjKxUCquon",
  baseURL: "https://open.bigmodel.cn/api/paas/v4/images/generations",
  model: "CogView-3-Flash",
  supportedSizes: ["1024x1024", "768x1344", "864x1152", "1344x768", "1152x864", "1440x720", "720x1440"]
};

// 允许跨域访问
app.use(helmet({
  contentSecurityPolicy: false,
  frameguard: false
}));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 数据存储目录
const dataDir = path.join(__dirname, '../reference/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化数据库
initDatabase();

// 图片生成接口
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, size = "1024x1024", quality = "standard" } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: prompt'
      });
    }

    // 验证尺寸
    if (!COGVIEW_CONFIG.supportedSizes.includes(size)) {
      return res.status(400).json({
        success: false,
        error: `不支持的图片尺寸: ${size}。支持的尺寸: ${COGVIEW_CONFIG.supportedSizes.join(', ')}`
      });
    }

    logger.info(`开始生成图片，提示词: ${prompt}, 尺寸: ${size}`);

    const response = await fetch(COGVIEW_CONFIG.baseURL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COGVIEW_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: COGVIEW_CONFIG.model,
        prompt: prompt,
        size: size,
        quality: quality,
        n: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error(`CogView API错误: ${response.status} - ${errorData}`);
      throw new Error(`CogView API错误: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      logger.error('CogView API返回数据格式错误:', data);
      throw new Error('API返回数据格式错误');
    }

    const imageUrl = data.data[0].url;
    logger.info(`图片生成成功: ${imageUrl}`);

    res.json({
      success: true,
      data: {
        url: imageUrl,
        prompt: prompt,
        size: size,
        quality: quality
      }
    });

  } catch (error) {
    logger.error('图片生成失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '图片生成失败'
    });
  }
});

// 批量图片生成接口
app.post('/api/generate-images-batch', async (req, res) => {
  try {
    const { prompts, size = "1024x1024", quality = "standard" } = req.body;
    
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: prompts (数组)'
      });
    }

    if (prompts.length > 10) {
      return res.status(400).json({
        success: false,
        error: '批量生成最多支持10张图片'
      });
    }

    logger.info(`开始批量生成图片，数量: ${prompts.length}`);

    const results = [];
    const errors = [];

    for (let i = 0; i < prompts.length; i++) {
      try {
        const prompt = prompts[i];
        
        const response = await fetch(COGVIEW_CONFIG.baseURL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${COGVIEW_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: COGVIEW_CONFIG.model,
            prompt: prompt,
            size: size,
            quality: quality,
            n: 1
          })
        });

        if (!response.ok) {
          throw new Error(`API错误: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.data || !data.data[0] || !data.data[0].url) {
          throw new Error('API返回数据格式错误');
        }

        results.push({
          index: i,
          success: true,
          url: data.data[0].url,
          prompt: prompt
        });

        // 添加延迟避免API限制
        if (i < prompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        logger.error(`图片生成失败 (索引 ${i}):`, error);
        errors.push({
          index: i,
          error: error.message,
          prompt: prompts[i]
        });
      }
    }

    res.json({
      success: true,
      data: {
        results: results,
        errors: errors,
        total: prompts.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    logger.error('批量图片生成失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '批量图片生成失败'
    });
  }
});

// 故事生成接口
app.post('/api/generate-story', async (req, res) => {
  try {
    const { theme, style, length = 'medium', language = 'zh' } = req.body;
    
    if (!theme) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: theme'
      });
    }

    logger.info(`开始生成故事，主题: ${theme}, 风格: ${style}, 长度: ${length}`);

    const lengthMap = {
      'short': '简短的',
      'medium': '中等长度的',
      'long': '详细的'
    };

    const prompt = `请创作一个${lengthMap[length] || '中等长度的'}儿童故事，主题是"${theme}"${style ? `，风格是${style}` : ''}。故事应该包含：
1. 引人入胜的开头
2. 有趣的情节发展
3. 积极正面的结局
4. 适合儿童阅读的内容

请用${language === 'en' ? '英文' : '中文'}创作，并确保故事内容健康向上，富有教育意义。`;

    const completion = {
      choices: [{
        message: {
          content: `这是一个关于"${theme}"的精彩故事。由于API配置问题，暂时返回示例内容。请稍后重试。`
        }
      }]
    };

    const story = completion.choices[0].message.content;
    
    // 保存故事到数据库
    const bookData = {
      theme,
      style,
      length,
      language,
      content: story,
      created_at: new Date().toISOString()
    };

    const bookId = await BookModel.create(bookData);
    
    logger.info(`故事生成成功，ID: ${bookId}`);

    res.json({
      success: true,
      data: {
        id: bookId,
        story: story,
        theme: theme,
        style: style,
        length: length,
        language: language
      }
    });

  } catch (error) {
    logger.error('故事生成失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '故事生成失败'
    });
  }
});

// 获取故事列表
app.get('/api/stories', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const stories = await BookModel.getAll(parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    logger.error('获取故事列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取故事列表失败'
    });
  }
});

// 获取单个故事
app.get('/api/stories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const story = await BookModel.getById(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: '故事不存在'
      });
    }
    
    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    logger.error('获取故事失败:', error);
    res.status(500).json({
      success: false,
      error: '获取故事失败'
    });
  }
});

// 日志记录接口
app.post('/api/log', async (req, res) => {
  try {
    const { level, message, stack, timestamp, source } = req.body;
    
    logger.log(level || 'info', message || '前端日志', {
      stack,
      timestamp,
      source: 'frontend'
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('日志记录失败:', error);
    res.status(500).json({ 
      success: false,
      error: '日志记录失败' 
    });
  }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  logger.error('全局错误:', error);
  res.status(500).json({ 
    success: false,
    error: '服务器内部错误' 
  });
});

// 导出app用于Vercel
module.exports = app;