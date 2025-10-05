import React from 'react';
import './LoadingPlaceholder.css';

interface LoadingPlaceholderProps {
  progress?: number;
  message?: string;
  className?: string;
}

const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  progress = 0,
  message = '加载中...',
  className = ''
}) => {
  return (
    <div className={`loading-placeholder ${className}`}>
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        <div className="loading-text">{message}</div>
        {progress > 0 && (
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="progress-text">{Math.round(progress)}%</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingPlaceholder;