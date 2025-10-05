const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const winston = require('winston');
const { OpenAI } = require('openai');
const { BookModel, initDatabase } = require('./models/bookModel');
require('dotenv').config();

const app = express();

// 配置Winston日志
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// 初始化OpenAI客户端 - GLM-4-Flash模型
const openai = new OpenAI({
  apiKey: "d81e40d4aa964c16a6a0c94bbbe196d3.u9RMeNOjKxUCquon",
  baseURL: "https://open.bigmodel.cn/api/paas/v4/"
});

// CogView-3-Flash模型配置
const COGVIEW_CONFIG = {
  apiKey: "d81e40d4aa964c16a6a0c94bbbe196d3.u9RMeNOjKxUCquon",
  baseURL: "https://open.bigmodel.cn/api/paas/v4/images/generations",
  model: "CogView-3-Flash",
  supportedSizes: ["1024x1024", "768x1344", "864x1152", "1344x768", "1152x864", "1440x720", "720x1440"]
};

// 全局异常捕获
process.on('uncaughtException', (err) => {
  logger.error('未捕获异常:', err);
});

// 允许跨域访问
app.use(helmet({
  contentSecurityPolicy: false,
  frameguard: false
}));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const publicDir = path.resolve(__dirname, '../frontend/public');
const distDir = path.resolve(__dirname, '../frontend/dist');
const publicPath = fs.existsSync(publicDir) ? publicDir : distDir;
app.use(express.static(publicPath));

// 数据库初始化
const initDB = async () => {
  try {
    await initDatabase();
    logger.info('数据库初始化成功');
  } catch (error) {
    logger.error('数据库初始化失败:', error);
  }
};
initDB();

// API路由 - 生成故事 (GLM-4-Flash模型调用)
app.post('/api/generate-story', async (req, res) => {
  try {
    const { text } = req.body;
    
    // 参数验证
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: '请输入有效的文本内容' 
      });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 200) {
      return res.status(400).json({ 
        success: false,
        error: '输入文本过长，请控制在200字符以内' 
      });
    }

    logger.info('开始生成故事:', { input: trimmedText });

    // 优化的故事生成提示词 - 确保格式稳定和要求对齐
    const systemPrompt = `你是专业的儿童绘本创作者。请根据用户输入创作一个完整的儿童绘本故事。

要求：
1. 故事必须包含恰好6个段落，每段40-60字
2. 每段描述一个具体的场景，便于配图
3. 语言简单易懂，适合3-8岁儿童
4. 传递正面价值观和教育意义
5. 情节连贯完整，有明确的开始、发展和结尾
6. 每段都要有生动的视觉元素描述

输出格式（严格按此格式，必须恰好6段）：
段落1：[开场场景描述，包含主角和环境，40-60字]
段落2：[故事发展场景，展现问题或冲突，40-60字]  
段落3：[情节推进场景，主角开始行动，40-60字]
段落4：[高潮场景，关键转折或解决方案，40-60字]
段落5：[结局场景，问题解决过程，40-60字]
段落6：[完美结尾场景，传递正面价值观，40-60字]

重要：
- 必须严格输出6个段落，不多不少
- 每段必须是完整的场景描述
- 不要使用"第X页"等格式
- 每段都要包含具体的视觉元素
- 确保故事逻辑完整连贯`;

    // 调用GLM-4-Flash模型生成故事
    const completion = await openai.chat.completions.create({
      model: "GLM-4-Flash-250414",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `请根据这句话创作一个儿童绘本故事："${trimmedText}"`
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      top_p: 0.9
    });

    const storyContent = completion.choices[0].message.content;
    
    // 优化的故事内容解析 - 强制6段输出
    let paragraphs = [];
    
    // 方案1：匹配"段落X："格式
    const paragraphMatches = storyContent.match(/段落\d+：([^段落]+)/g);
    if (paragraphMatches && paragraphMatches.length > 0) {
      paragraphs = paragraphMatches.map(match => 
        match.replace(/段落\d+：/, '').trim()
      ).filter(p => p.length > 10);
    } 
    // 方案2：匹配"第X页："格式（兼容旧格式）
    else {
      const pageMatches = storyContent.match(/第\d+页：([^第]+)/g);
      if (pageMatches && pageMatches.length > 0) {
        paragraphs = pageMatches.map(match => 
          match.replace(/第\d+页：/, '').trim()
        ).filter(p => p.length > 10);
      } 
      // 方案3：按行分割（备用方案）
      else {
        paragraphs = storyContent
          .split('\n')
          .filter(p => p.trim().length > 10 && !p.includes('：'))
          .slice(0, 6); // 限制为6段
      }
    }

    // 强制确保恰好6个段落
    if (paragraphs.length !== 6) {
      logger.warn(`段落数量不符合要求，当前${paragraphs.length}段，需要6段`, { paragraphs });
      
      if (paragraphs.length < 6) {
        // 补充段落到6段

        const additionalPrompt = `请基于以下故事内容，补充到恰好6个段落，每段40-60字，保持故事连贯性：\n${paragraphs.join('\n')}\n\n要求：严格输出6个段落，格式为"段落X：[内容]"`;

        

        const additionalCompletion = await openai.chat.completions.create({

          model: "GLM-4-Flash-250414",
          messages: [
            {

              role: "system", 
              content: "你是专业的儿童绘本创作者。请严格按照要求补充故事内容，确保恰好6段，每段40-60字。"
            },
            {
              role: "user",
              content: additionalPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });
        
        const additionalContent = additionalCompletion.choices[0].message.content;
        const additionalMatches = additionalContent.match(/段落\d+：([^段落]+)/g);
        
        if (additionalMatches) {
          paragraphs = additionalMatches.map(match => 
            match.replace(/段落\d+：/, '').trim()
          ).filter(p => p.length > 10).slice(0, 6); // 确保不超过6段
        }
      } else if (paragraphs.length > 6) {
        // 截取前6段
        paragraphs = paragraphs.slice(0, 6);
        logger.info('截取前6段作为最终故事内容');
      }

    }

    // 最终验证：必须有6段
    if (paragraphs.length !== 6) {
      throw new Error(`故事生成失败：无法生成恰好6个段落，当前${paragraphs.length}段`);
    }

    // 为每个段落生成优化的图像提示词 - 固定6个场景
    const scenes = paragraphs.map((paragraph, index) => ({
      id: index + 1,
      text: paragraph.trim(),
      imagePrompt: `儿童绘本插图，卡通风格，明亮温暖色彩，${paragraph.trim()}，适合3-8岁儿童，温馨可爱的画面，高质量数字绘画，细节丰富`
    }));

    // 确保scenes数组恰好有6个元素
    if (scenes.length !== 6) {
      throw new Error(`场景生成失败：期望6个场景，实际${scenes.length}个`);
    }

    // 保存到数据库
    try {
      const book = await BookModel.create(trimmedText);
      await BookModel.updateStory(book.id, { paragraphs, scenes });
      await BookModel.updateStatus(book.id, 'story_generated');

      logger.info('故事生成并保存成功:', { 
        bookId: book.id, 
        paragraphCount: paragraphs.length 
      });

      res.json({
        success: true,
        bookId: book.id,
        story: {
          originalInput: trimmedText,
          paragraphs,
          scenes
        }
      });
    } catch (dbError) {
      logger.error('数据库保存失败:', dbError);
      // 即使数据库失败，也返回生成的故事
      res.json({
        success: true,
        bookId: null,
        story: {
          originalInput: trimmedText,
          paragraphs,
          scenes
        }
      });
    }

  } catch (error) {
    logger.error('生成故事失败:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || '故事生成失败，请稍后重试' 
    });
  }
});

// API路由 - 生成图片 (CogView-3-Flash模型调用)
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, size = "1024x1024" } = req.body;
    
    // 参数验证
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: '请提供有效的图片描述' 
      });
    }

    if (!COGVIEW_CONFIG.supportedSizes.includes(size)) {
      return res.status(400).json({ 
        success: false,
        error: `不支持的图片尺寸，支持的尺寸：${COGVIEW_CONFIG.supportedSizes.join(', ')}` 
      });
    }

    const trimmedPrompt = prompt.trim();
    logger.info('开始生成图片:', { prompt: trimmedPrompt, size });

    // 优化图片生成提示词
    const enhancedPrompt = `${trimmedPrompt}, 儿童绘本插图, 卡通风格, 明亮色彩, 可爱角色, 高质量, 细节丰富, 温馨画面`;

    // 调用CogView-3-Flash生成图片
    const response = await fetch(COGVIEW_CONFIG.baseURL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COGVIEW_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: COGVIEW_CONFIG.model,
        prompt: enhancedPrompt,
        size: size,
        n: 1,
        quality: "standard",
        response_format: "url"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP ${response.status}: 图片生成API调用失败`);
    }

    const result = await response.json();

    // 验证返回数据结构
    if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
      throw new Error('图片生成API返回数据格式异常');
    }

    const imageUrl = result.data[0].url;
    if (!imageUrl) {
      throw new Error('未获得有效的图片URL');
    }

    logger.info('图片生成成功:', { 
      prompt: trimmedPrompt,
      size,
      imageUrl: imageUrl.substring(0, 50) + '...'
    });

    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: trimmedPrompt,
      size: size
    });

  } catch (error) {
    logger.error('生成图片失败:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || '图片生成失败，请稍后重试' 
    });
  }
});

// API路由 - 实时生成图片 (SSE)
app.post('/api/generate-images-stream', async (req, res) => {

  const requestId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const { story } = req.body;
    
    // 参数验证
    if (!story || !story.paragraphs || !Array.isArray(story.paragraphs) || story.paragraphs.length === 0) {
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: '请求参数错误：缺少有效的故事段落数据',
        requestId 
      })}\n\n`);
      return res.end();
    }

    // 强制限制为6个段落进行图片生成
    const targetParagraphs = story.paragraphs.slice(0, 6); // 只取前6个段落
    if (targetParagraphs.length !== 6) {
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: `实时图片生成要求恰好6个段落，当前提供${story.paragraphs.length}个段落`,
        requestId 
      })}\n\n`);
      return res.end();
    }

    logger.info('开始实时生成6张图片', { requestId, paragraphCount: targetParagraphs.length });

    // 发送开始事件
    res.write(`data: ${JSON.stringify({ 
      type: 'start', 
      total: targetParagraphs.length,
      requestId 
    })}\n\n`);

    const results = { success: [], failed: [] };

    // 逐个生成图片 - 固定6张
    for (let i = 0; i < targetParagraphs.length; i++) {
      try {
        const paragraph = targetParagraphs[i];
        const prompt = paragraph.imagePrompt || paragraph.text || `第${i + 1}个场景`;
        
        // 发送进度事件
        res.write(`data: ${JSON.stringify({ 
          type: 'progress', 
          current: i + 1,
          total: targetParagraphs.length,
          status: 'generating',
          sceneIndex: i,
          prompt: prompt.substring(0, 50) + '...',
          requestId
        })}\n\n`);

        const enhancedPrompt = `${prompt}, 儿童绘本插图, 卡通风格, 明亮色彩, 可爱角色, 高质量, 细节丰富, 温馨画面`;

        // 调用CogView-3-Flash生成图片
        const response = await fetch(COGVIEW_CONFIG.baseURL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${COGVIEW_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: COGVIEW_CONFIG.model,
            prompt: enhancedPrompt,
            size: "1024x1024",
            n: 1,
            quality: "standard",
            response_format: "url"
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: 图片生成API调用失败`);
        }

        const result = await response.json();
        if (!result.data?.[0]?.url) {
          throw new Error('未获得有效的图片URL');
        }

        const imageData = {
          id: `image_${i + 1}`,
          url: result.data[0].url,
          prompt: prompt,
          sceneIndex: i
        };

        results.success.push(imageData);

        // 发送成功事件
        res.write(`data: ${JSON.stringify({ 
          type: 'image_generated', 
          current: i + 1,
          total: story.paragraphs.length,
          image: imageData,
          requestId
        })}\n\n`);

        logger.info(`第${i + 1}个图片生成成功`, { requestId, sceneIndex: i });

      } catch (error) {
        const errorData = {
          sceneIndex: i,
          error: error.message,
          prompt: story.paragraphs[i]?.imagePrompt || story.paragraphs[i]?.text || `第${i + 1}个场景`
        };

        results.failed.push(errorData);

        // 发送错误事件，但继续生成其他图片
        res.write(`data: ${JSON.stringify({ 
          type: 'image_failed', 
          current: i + 1,
          total: story.paragraphs.length,
          error: errorData,
          requestId
        })}\n\n`);

        logger.error(`第${i + 1}个图片生成失败`, { requestId, error: error.message, sceneIndex: i });
      }
    }

    // 发送完成事件
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      results: {
        successCount: results.success.length,
        failedCount: results.failed.length,
        totalCount: story.paragraphs.length,
        images: results.success,
        errors: results.failed
      },
      requestId
    })}\n\n`);

    logger.info('实时图片生成完成', { 
      requestId, 
      successCount: results.success.length, 
      failedCount: results.failed.length 
    });

    res.end();

  } catch (error) {
    logger.error('实时图片生成失败', { requestId, error: error.message });
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      error: error.message || '图片生成失败，请稍后重试',
      requestId 
    })}\n\n`);
    res.end();
  }
});

// API路由 - 批量生成图片 (保留原有接口兼容性)
app.post('/api/generate-images', async (req, res) => {

  const requestId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // 记录详细的请求信息
    logger.info('收到批量图片生成请求', {
      requestId,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      bodySize: JSON.stringify(req.body).length
    });

    const { story } = req.body;
    
    // 详细的参数验证
    if (!story) {
      logger.warn('参数验证失败：缺少story对象', { requestId });
      return res.status(400).json({ 
        success: false,
        error: '请求参数错误：缺少story对象',
        requestId
      });
    }

    if (!story.paragraphs) {
      logger.warn('参数验证失败：story对象缺少paragraphs字段', { requestId, story });
      return res.status(400).json({ 
        success: false,
        error: '请求参数错误：story对象必须包含paragraphs字段',
        requestId
      });
    }

    if (!Array.isArray(story.paragraphs)) {
      logger.warn('参数验证失败：paragraphs不是数组', { 
        requestId, 
        paragraphsType: typeof story.paragraphs,
        paragraphs: story.paragraphs
      });
      return res.status(400).json({ 
        success: false,
        error: '请求参数错误：paragraphs必须是数组',
        requestId
      });
    }

    if (story.paragraphs.length === 0) {
      logger.warn('参数验证失败：paragraphs数组为空', { requestId });
      return res.status(400).json({ 
        success: false,
        error: '请求参数错误：paragraphs数组不能为空',
        requestId
      });
    }

    // 验证每个paragraph的必要字段
    for (let i = 0; i < story.paragraphs.length; i++) {
      const paragraph = story.paragraphs[i];
      if (!paragraph || typeof paragraph !== 'object') {
        logger.warn('参数验证失败：paragraph不是有效对象', { 
          requestId, 
          index: i, 
          paragraph 
        });
        return res.status(400).json({ 
          success: false,
          error: `请求参数错误：第${i + 1}个段落不是有效对象`,
          requestId
        });
      }

      if (!paragraph.text && !paragraph.imagePrompt) {
        logger.warn('参数验证失败：paragraph缺少必要字段', { 
          requestId, 
          index: i, 
          paragraph 
        });
        return res.status(400).json({ 
          success: false,
          error: `请求参数错误：第${i + 1}个段落必须包含text或imagePrompt字段`,
          requestId
        });
      }
    }

    // 强制限制为6个段落进行图片生成
    const targetParagraphs = story.paragraphs.slice(0, 6); // 只取前6个段落
    if (targetParagraphs.length !== 6) {
      logger.warn('段落数量不符合6图要求', { 
        requestId, 
        originalCount: story.paragraphs.length,
        targetCount: targetParagraphs.length
      });
      return res.status(400).json({ 
        success: false,
        error: `图片生成要求恰好6个段落，当前提供${story.paragraphs.length}个段落`,
        requestId
      });
    }

    logger.info('参数验证通过，开始批量生成6张图片', { 
      requestId,
      paragraphCount: targetParagraphs.length,
      paragraphs: targetParagraphs.map((p, i) => ({
        index: i,
        id: p.id,
        hasText: !!p.text,
        hasImagePrompt: !!p.imagePrompt,
        textLength: p.text?.length || 0
      }))
    });

    const images = [];
    const errors = [];

    // 为每个段落生成图片 - 固定6张
    for (let i = 0; i < targetParagraphs.length; i++) {
      try {
        const paragraph = targetParagraphs[i];
        const prompt = paragraph.imagePrompt || paragraph.text || `第${i + 1}个场景`;
        
        logger.info(`开始生成第${i + 1}个图片`, {
          requestId,
          index: i,
          paragraphId: paragraph.id,
          originalPrompt: prompt.substring(0, 100),
          promptLength: prompt.length
        });
        
        // 优化图片生成提示词
        const enhancedPrompt = `${prompt}, 儿童绘本插图, 卡通风格, 明亮色彩, 可爱角色, 高质量, 细节丰富, 温馨画面`;

        // 调用CogView-3-Flash生成图片
        const response = await fetch(COGVIEW_CONFIG.baseURL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${COGVIEW_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: COGVIEW_CONFIG.model,
            prompt: enhancedPrompt,
            size: "1024x1024",
            n: 1,
            quality: "standard",
            response_format: "url"
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error?.message || `HTTP ${response.status}: 图片生成API调用失败`;
          logger.error(`第${i + 1}个图片API调用失败`, {
            requestId,
            index: i,
            status: response.status,
            statusText: response.statusText,
            errorData,
            prompt: prompt.substring(0, 50)
          });
          throw new Error(errorMessage);
        }

        const result = await response.json();

        // 验证返回数据结构
        if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
          logger.error(`第${i + 1}个图片返回数据格式异常`, {
            requestId,
            index: i,
            result,
            prompt: prompt.substring(0, 50)
          });
          throw new Error('图片生成API返回数据格式异常');
        }

        const imageUrl = result.data[0].url;
        if (!imageUrl) {
          logger.error(`第${i + 1}个图片未获得有效URL`, {
            requestId,
            index: i,
            resultData: result.data[0],
            prompt: prompt.substring(0, 50)
          });
          throw new Error('未获得有效的图片URL');
        }

        images.push({
          id: `image_${i + 1}`,
          url: imageUrl,
          prompt: prompt,
          sceneIndex: i
        });

        logger.info(`第${i + 1}个图片生成成功`, { 
          requestId,
          index: i,
          imageId: `image_${i + 1}`,
          prompt: prompt.substring(0, 50) + '...',
          imageUrl: imageUrl.substring(0, 50) + '...'
        });

      } catch (error) {
        logger.error(`第${i + 1}个图片生成失败`, {
          requestId,
          index: i,
          error: error.message,
          stack: error.stack,
          paragraph: story.paragraphs[i]
        });
        errors.push({
          sceneIndex: i,
          error: error.message,
          requestId
        });
      }
    }

    logger.info('批量图片生成完成', { 
      requestId,
      successCount: images.length,
      errorCount: errors.length,
      totalCount: story.paragraphs.length
    });

    res.json({
      success: true,
      images: images,
      errors: errors.length > 0 ? errors : undefined,
      requestId
    });

  } catch (error) {
    logger.error('批量生成图片失败', {
      requestId: requestId || 'unknown',
      error: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    res.status(500).json({ 
      success: false,
      error: error.message || '批量图片生成失败，请稍后重试',
      requestId: requestId || 'unknown'
    });
  }
});

// API路由 - 保存绘本
app.post('/api/save-book', async (req, res) => {
  const requestId = `save-${Date.now()}`;
  
  try {
    const bookData = req.body;
    
    logger.info('开始保存绘本:', { 
      requestId,
      title: bookData?.title,
      hasStory: !!bookData?.story,
      hasImages: !!bookData?.images,
      dataKeys: Object.keys(bookData || {})
    });

    // 详细数据验证
    const validationErrors = [];
    
    if (!bookData) {
      validationErrors.push('请求体为空');
    } else {
      if (!bookData.title || typeof bookData.title !== 'string' || !bookData.title.trim()) {
        validationErrors.push('书籍标题不能为空');
      }
      
      if (!bookData.story) {
        validationErrors.push('故事内容不能为空');
      } else if (typeof bookData.story !== 'object') {
        validationErrors.push('故事内容格式错误');
      } else if ((!bookData.story.paragraphs || !Array.isArray(bookData.story.paragraphs) || bookData.story.paragraphs.length === 0) && (!bookData.story.scenes || !Array.isArray(bookData.story.scenes) || bookData.story.scenes.length === 0)) {
        validationErrors.push('故事段落或场景不能为空');
      }
      
      if (bookData.images && !Array.isArray(bookData.images)) {
        validationErrors.push('图片数据格式错误');
      }
    }

    if (validationErrors.length > 0) {
      logger.warn('书籍数据验证失败:', { 
        requestId,
        errors: validationErrors,
        receivedData: bookData
      });
      
      return res.status(400).json({ 
        success: false,
        error: `数据验证失败: ${validationErrors.join(', ')}`,
        details: validationErrors,
        requestId
      });
    }

    // 数据清理和标准化
    const cleanBookData = {
      title: bookData.title.trim(),
      description: bookData.description?.trim() || '',
      category: bookData.category || 'children',
      tags: Array.isArray(bookData.tags) ? bookData.tags : [],
      isPublic: Boolean(bookData.isPublic),
      story: {
        ...bookData.story,
        paragraphs: bookData.story.paragraphs.filter(p => p && (p.text || p.imagePrompt))
      },
      images: Array.isArray(bookData.images) ? bookData.images : [],
      status: 'completed',
      createdAt: bookData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requestId
    };

    logger.info('保存清理后的绘本数据:', { 
      requestId,
      title: cleanBookData.title,
      paragraphCount: cleanBookData.story.paragraphs.length,
      imageCount: cleanBookData.images.length
    });

    // 使用BookModel的save方法保存完整书籍数据
    const savedBook = await BookModel.save(cleanBookData);

    res.json({
      success: true,
      book: savedBook,
      requestId
    });

    logger.info('绘本保存成功:', { 
      requestId,
      bookId: savedBook.id,
      title: cleanBookData.title
    });

  } catch (error) {
    logger.error('保存绘本失败:', {
      requestId,
      error: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    
    res.status(500).json({ 
      success: false,
      error: `保存绘本失败: ${error.message}`,
      requestId
    });
  }
});

// API路由 - 获取绘本列表
app.get('/api/books', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    logger.info('获取绘本列表:', { limit });

    const books = await BookModel.getRecent(parseInt(limit));

    res.json({
      success: true,
      books
    });

    logger.info('获取绘本列表成功:', { count: books.length });

  } catch (error) {
    logger.error('获取绘本列表失败:', error);
    res.status(500).json({ 
      success: false,
      error: '获取绘本列表失败，请稍后重试' 
    });
  }
});

// API路由 - 获取完整绘本
app.get('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: '缺少绘本ID' 
      });
    }

    logger.info('获取完整绘本:', { bookId: id });

    const book = await BookModel.getFullBook(id);
    
    if (!book) {
      return res.status(404).json({ 
        success: false,
        error: '绘本不存在或未完成' 
      });
    }

    res.json({
      success: true,
      book
    });

    logger.info('获取完整绘本成功:', { bookId: id });

  } catch (error) {
    logger.error('获取完整绘本失败:', error);
    res.status(500).json({ 
      success: false,
      error: '获取完整绘本失败，请稍后重试' 
    });
  }
});

// 异常日志收集接口
app.post('/logs', (req, res) => {
  try {
    const { level = 'error', message, stack, timestamp } = req.body;
    
    logger.log(level, message, {
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

// 处理前端路由 - 使用正确的语法
app.use((req, res, next) => {
  // 如果是API路由，继续处理
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // 检查是否是静态文件
  const filePath = path.join(publicPath, req.path);
  if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
    return res.sendFile(filePath);
  }
  
  // 对于前端路由，返回index.html
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 全局错误处理中间件
app.use((error, req, res, next) => {

  logger.error('全局错误:', error);
  res.status(500).json({ 
    success: false,
    error: '服务器内部错误' 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`服务器启动成功，端口: ${PORT}`);
  logger.info(`静态文件目录: ${publicPath}`);
  logger.info('GLM-4-Flash模型配置完成');
  logger.info('CogView-3-Flash模型配置完成');
});
