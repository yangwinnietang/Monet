import React from 'react';
import { useLanguage } from '../../hooks/story1/useLanguage';

function BookmarkPanel({ bookmarks, scenes, onJumpToScene, onClose }) {
  const { t } = useLanguage();
  const bookmarkedScenes = scenes.filter(scene => bookmarks.includes(scene.id));
  
  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="bookmark-panel" onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <h3>{t('ui.bookmarks.title')}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="panel-content">
          {bookmarkedScenes.length === 0 ? (
            <div className="empty-state">
              <p>{t('ui.bookmarks.empty')}</p>
              <small>{t('ui.bookmarks.emptyDesc')}</small>
            </div>
          ) : (
            <div className="bookmarks-list">
              {bookmarkedScenes.map(scene => (
                <div 
                  key={scene.id}
                  className="bookmark-item"
                  onClick={() => onJumpToScene(scene.id)}
                >
                  <div className="bookmark-image">
                    <img src={scene.image} alt={scene.title} />
                    <div className="bookmark-overlay">
                      <span className="play-icon">▶️</span>
                    </div>
                  </div>
                  <div className="bookmark-info">
                    <h4>{scene.title}</h4>
                    <p>{scene.description}</p>
                    <span className="bookmark-duration">{scene.duration}</span>
                  </div>
                  <div className="bookmark-star">★</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {bookmarkedScenes.length > 0 && (
          <div className="panel-footer">
            <small>{t('ui.common.scene')} {bookmarkedScenes.length} {t('ui.bookmarks.title')}</small>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookmarkPanel;