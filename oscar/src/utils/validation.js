// 数据验证工具函数
export const validateStoryData = (story) => {
  const errors = [];
  
  // 验证story对象存在
  if (!story) {
    errors.push('故事数据不能为空');
    return { isValid: false, errors };
  }
  
  // 验证story是对象类型
  if (typeof story !== 'object') {
    errors.push('故事数据必须是对象格式');
    return { isValid: false, errors };
  }
  
  // 验证paragraphs字段存在
  if (!story.paragraphs) {
    errors.push('故事数据必须包含paragraphs字段');
    return { isValid: false, errors };
  }
  
  // 验证paragraphs是数组
  if (!Array.isArray(story.paragraphs)) {
    errors.push('paragraphs必须是数组格式');
    return { isValid: false, errors };
  }
  
  // 强制验证段落数量为6个
  if (story.paragraphs.length !== 6) {
    errors.push(`故事必须包含恰好6个段落，当前为${story.paragraphs.length}个段落`);
    return { isValid: false, errors };
  }
  
  // 验证每个paragraph的结构
  story.paragraphs.forEach((paragraph, index) => {
    if (!paragraph || typeof paragraph !== 'object') {
      errors.push(`第${index + 1}个段落必须是有效对象`);
      return;
    }
    
    // 验证必要字段
    if (!paragraph.text && !paragraph.imagePrompt) {
      errors.push(`第${index + 1}个段落必须包含text或imagePrompt字段`);
    }
    
    // 验证字段类型
    if (paragraph.text && typeof paragraph.text !== 'string') {
      errors.push(`第${index + 1}个段落的text字段必须是字符串`);
    }
    
    if (paragraph.imagePrompt && typeof paragraph.imagePrompt !== 'string') {
      errors.push(`第${index + 1}个段落的imagePrompt字段必须是字符串`);
    }
    
    // 验证内容长度
    if (paragraph.text && paragraph.text.trim().length === 0) {
      errors.push(`第${index + 1}个段落的text内容不能为空`);
    }
    
    if (paragraph.imagePrompt && paragraph.imagePrompt.trim().length === 0) {
      errors.push(`第${index + 1}个段落的imagePrompt内容不能为空`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 验证故事内容并转换为scenes格式 - 强制6段落
export const validateAndConvertStoryContent = (storyContent) => {
  if (!storyContent || typeof storyContent !== 'string') {
    return {
      isValid: false,
      errors: ['故事内容必须是有效的字符串'],
      scenes: null
    };
  }
  
  const trimmedContent = storyContent.trim();
  if (trimmedContent.length === 0) {
    return {
      isValid: false,
      errors: ['故事内容不能为空'],
      scenes: null
    };
  }
  
  // 将故事内容按段落分割
  const paragraphs = trimmedContent
    .split(/\n\s*\n/) // 按双换行分割段落
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  // 强制要求6个段落
  if (paragraphs.length !== 6) {
    return {
      isValid: false,
      errors: [`故事内容必须包含恰好6个段落，当前为${paragraphs.length}个段落`],
      scenes: null
    };
  }
  
  // 转换为scenes格式
  const scenes = paragraphs.map((text, index) => ({
    id: `scene_${index + 1}`,
    text: text,
    imagePrompt: text // 使用文本内容作为图片提示词
  }));
  
  return {
    isValid: true,
    errors: [],
    scenes
  };
};

// 记录验证错误
export const logValidationError = (context, errors) => {
  console.error(`[数据验证失败] ${context}:`, {
    timestamp: new Date().toISOString(),
    errors,
    context
  });
};