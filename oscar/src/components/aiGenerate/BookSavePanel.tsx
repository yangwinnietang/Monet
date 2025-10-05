import React, { useState, useCallback } from 'react';
import './BookSavePanel.css';

interface BookSavePanelProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (bookData: BookSaveData) => Promise<void>;
  storyData?: any;
  imageData?: any[];
  isLoading?: boolean;
}

interface BookSaveData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
}

const CATEGORIES = [
  { value: 'children', label: '儿童故事' },
  { value: 'adventure', label: '冒险故事' },
  { value: 'fantasy', label: '奇幻故事' },
  { value: 'education', label: '教育故事' },
  { value: 'fairy-tale', label: '童话故事' },
  { value: 'science', label: '科普故事' },
  { value: 'other', label: '其他' }
];

const COMMON_TAGS = ['有趣', '教育', '温馨', '冒险', '友谊', '成长', '想象力', '勇敢'];

const BookSavePanel: React.FC<BookSavePanelProps> = ({
  isVisible,
  onClose,
  onSave,
  storyData,
  imageData,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<BookSaveData>({
    title: '',
    description: '',
    category: 'children',
    tags: [],
    isPublic: false
  });
  const [customTag, setCustomTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = useCallback((field: keyof BookSaveData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleTagToggle = useCallback((tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  }, []);

  const handleAddCustomTag = useCallback(() => {
    const tag = customTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setCustomTag('');
    }
  }, [customTag, formData.tags]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '请输入书籍标题';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '请输入书籍描述';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      await onSave(formData);
      setFormData({
        title: '',
        description: '',
        category: 'children',
        tags: [],
        isPublic: false
      });
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
    }
  }, [formData, validateForm, onSave, onClose]);

  if (!isVisible) return null;

  return (
    <div className="book-save-overlay">
      <div className="book-save-panel">
        <div className="panel-header">
          <h2>保存绘本</h2>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>×</button>
        </div>

        <div className="panel-content">
          <div className="form-group">
            <label htmlFor="title">书籍标题 *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="请输入书籍标题"
              disabled={isLoading}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">书籍描述 *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="请输入书籍描述"
              rows={3}
              disabled={isLoading}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">分类</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              disabled={isLoading}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>标签</label>
            <div className="tags-container">
              {COMMON_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-btn ${formData.tags.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                  disabled={isLoading}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="custom-tag-input">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="添加自定义标签"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
              />
              <button type="button" onClick={handleAddCustomTag} disabled={isLoading || !customTag.trim()}>
                添加
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="selected-tags">
                {formData.tags.map(tag => (
                  <span key={tag} className="selected-tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                disabled={isLoading}
              />
              公开分享（其他用户可以查看）
            </label>
          </div>

          {storyData && (
            <div className="preview-info">
              <h3>内容预览</h3>
              <p><strong>故事段落:</strong> {
                storyData?.paragraphs?.length || 
                storyData?.story?.paragraphs?.length || 
                storyData?.scenes?.length || 
                storyData?.story?.scenes?.length || 0
              } 段</p>
              <p><strong>生成图片:</strong> {imageData?.length || 0} 张</p>
            </div>
          )}
        </div>

        <div className="panel-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isLoading}>
            取消
          </button>
          <button 
            className="save-btn" 
            onClick={handleSave} 
            disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
          >
            {isLoading ? '保存中...' : '保存绘本'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookSavePanel;