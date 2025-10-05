import React, { useState, useEffect } from 'react'; // # 引入状态管理和副作用
import './StoryInputForm.css';

interface StoryInputData {
  theme: string; // # 故事主题
  protagonist: string; // # 主角设定
  setting: string; // # 场景描述
  style: string; // # 绘画风格
}

interface StoryInputFormProps {
  onSubmit: (data: StoryInputData) => void; // # 提交回调
  isLoading?: boolean; // # 加载状态
  initialData?: StoryInputData | null; // # 初始数据
}

const StoryInputForm: React.FC<StoryInputFormProps> = ({ onSubmit, isLoading = false, initialData }) => {
  const [formData, setFormData] = useState<StoryInputData>({
    theme: '',
    protagonist: '',
    setting: '',
    style: '印象派'
  });

  const [errors, setErrors] = useState<Partial<StoryInputData>>({}); // # 验证错误

  // # 恢复初始数据
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const maxLengths = { theme: 100, protagonist: 80, setting: 150, style: 50 }; // # 字符限制

  const handleInputChange = (field: keyof StoryInputData, value: string) => {
    if (value.length <= maxLengths[field]) {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' })); // # 清除错误
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StoryInputData> = {};
    if (!formData.theme.trim()) newErrors.theme = '请输入故事主题';
    if (!formData.protagonist.trim()) newErrors.protagonist = '请输入主角设定';
    if (!formData.setting.trim()) newErrors.setting = '请输入场景描述';
    if (!formData.style.trim()) newErrors.style = '请选择绘画风格';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && !isLoading) {
      onSubmit(formData);
    }
  };

  const styleOptions = ['印象派', '水彩画', '油画', '素描', '卡通', '写实主义', '抽象派']; // # 风格选项

  return (
    <form className="story-input-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>创作您的绘本故事</h2>
        <p>请填写以下信息，AI将为您生成精美的绘本</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="theme">故事主题 *</label>
          <input
            id="theme"
            type="text"
            value={formData.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
            placeholder="例如：小兔子的冒险之旅"
            className={errors.theme ? 'error' : ''}
            disabled={isLoading}
          />
          <div className="form-meta">
            <span className={`char-count ${formData.theme.length > maxLengths.theme * 0.8 ? 'warning' : ''}`}>
              {formData.theme.length}/{maxLengths.theme}
            </span>
            {errors.theme && <span className="error-text">{errors.theme}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="protagonist">主角设定 *</label>
          <input
            id="protagonist"
            type="text"
            value={formData.protagonist}
            onChange={(e) => handleInputChange('protagonist', e.target.value)}
            placeholder="例如：勇敢的小兔子，喜欢探索"
            className={errors.protagonist ? 'error' : ''}
            disabled={isLoading}
          />
          <div className="form-meta">
            <span className={`char-count ${formData.protagonist.length > maxLengths.protagonist * 0.8 ? 'warning' : ''}`}>
              {formData.protagonist.length}/{maxLengths.protagonist}
            </span>
            {errors.protagonist && <span className="error-text">{errors.protagonist}</span>}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="setting">场景描述 *</label>
          <textarea
            id="setting"
            value={formData.setting}
            onChange={(e) => handleInputChange('setting', e.target.value)}
            placeholder="例如：美丽的森林，有高大的树木和清澈的小溪"
            rows={3}
            className={errors.setting ? 'error' : ''}
            disabled={isLoading}
          />
          <div className="form-meta">
            <span className={`char-count ${formData.setting.length > maxLengths.setting * 0.8 ? 'warning' : ''}`}>
              {formData.setting.length}/{maxLengths.setting}
            </span>
            {errors.setting && <span className="error-text">{errors.setting}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="style">绘画风格 *</label>
          <select
            id="style"
            value={formData.style}
            onChange={(e) => handleInputChange('style', e.target.value)}
            className={errors.style ? 'error' : ''}
            disabled={isLoading}
          >
            {styleOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.style && <span className="error-text">{errors.style}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className={`generate-btn ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              生成中...
            </>
          ) : (
            <>
              <span className="generate-icon">✨</span>
              开始生成绘本
            </>
          )}
        </button>
      </div>

      <div className="form-tips">
        <h4>💡 创作小贴士</h4>
        <ul>
          <li>主题要简洁明了，便于AI理解</li>
          <li>主角设定可以包含性格特点和外观描述</li>
          <li>场景描述越详细，生成的图片越精美</li>
          <li>不同的绘画风格会带来不同的视觉效果</li>
        </ul>
      </div>
    </form>
  );
};

export default StoryInputForm;