import React from 'react'; // # 引入React
import './GenerationProgress.css';

interface GenerationProgressProps {
  isGenerating: boolean; // # 是否正在生成
  progress: number; // # 进度百分比 0-100
  currentStep: string; // # 当前步骤描述
  error?: string; // # 错误信息
  estimatedTime?: number; // # 预估剩余时间(秒)
  onCancel?: () => void; // # 取消回调
  onRetry?: () => void; // # 重试回调
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({
  isGenerating,
  progress,
  currentStep,
  error,
  estimatedTime,
  onCancel,
  onRetry
}) => {
  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.ceil(seconds)}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${Math.ceil(remainingSeconds)}秒`;
  };

  // 获取进度状态类名
  const getProgressClass = (): string => {
    if (error) return 'error';
    if (progress === 100) return 'complete';
    if (isGenerating) return 'active';
    return 'idle';
  };

  return (
    <div className={`generation-progress ${getProgressClass()}`}>
      {/* 进度头部 */}
      <div className="progress-header">
        <h3 className="progress-title">
          {error ? '生成失败' : progress === 100 ? '生成完成' : '正在生成绘本...'}
        </h3>
        {estimatedTime && isGenerating && !error && (
          <span className="estimated-time">
            预计还需 {formatTime(estimatedTime)}
          </span>
        )}
      </div>

      {/* 进度条容器 */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          >
            <div className="progress-shine"></div>
          </div>
        </div>
        <span className="progress-percentage">{Math.round(progress)}%</span>
      </div>

      {/* 状态信息 */}
      <div className="progress-status">
        {error ? (
          <div className="status-error">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        ) : (
          <div className="status-info">
            <span className="status-icon">
              {progress === 100 ? '✅' : '🎨'}
            </span>
            <span className="status-text">{currentStep}</span>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="progress-actions">
        {error && onRetry && (
          <button 
            className="btn-retry"
            onClick={onRetry}
            type="button"
          >
            <span className="btn-icon">🔄</span>
            重新生成
          </button>
        )}
        
        {isGenerating && onCancel && (
          <button 
            className="btn-cancel"
            onClick={onCancel}
            type="button"
          >
            <span className="btn-icon">❌</span>
            取消生成
          </button>
        )}
        
        {progress === 100 && !error && (
          <div className="completion-message">
            <span className="completion-icon">🎉</span>
            <span className="completion-text">绘本生成成功！</span>
          </div>
        )}
      </div>

      {/* 加载动画 */}
      {isGenerating && !error && (
        <div className="loading-animation">
          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationProgress;