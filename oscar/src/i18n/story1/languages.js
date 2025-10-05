// 中英双语配置文件
export const languages = {
  en: {
    // UI界面翻译
    ui: {
      title: "A Study in Scarlet - An Interactive Audio Tableau",
      subtitle: "Scroll to explore the story • Click play buttons to hear audio",
      
      // 导航和控制
      navigation: {
        previous: "Previous Scene",
        next: "Next Scene",
        bookmark: "Bookmark this scene",
        removeBookmark: "Remove bookmark",
        fullscreen: "Toggle fullscreen",
        settings: "Settings",
        help: "Help"
      },
      
      // 设置面板
      settings: {
        title: "Settings",
        autoplay: "Audio Autoplay",
        autoplayDesc: "Automatically play audio when navigating to new scenes",
        autoplayNote: "📝 Note: Following browser autoplay policies, autoplay can only be enabled after user interaction with the page.",
        volume: "Volume Control",
        volumeDesc: "Adjust audio playback volume (0-100%)",
        language: "Language / 语言",
        languageDesc: "Choose your preferred language",
        usage: "Usage Guide",
        usageDesc: "How to operate this interactive story",
        usageGuide: [
          "🔼 **Navigation:** Use mouse wheel, arrow keys, or side buttons",
          "🎧 **Audio:** Click play buttons to hear scene narration",
          "📖 **Bookmarks:** Star your favorite scenes for quick access",
          "⌨️ **Keyboard:** Press H key to view all shortcuts",
          "📱 **Mobile:** Swipe gestures for touch navigation",
          "🖥️ **Fullscreen:** F key or fullscreen button for immersive reading"
        ],
        reset: "Reset Settings",
        resetWarning: "This will reset all settings to default values. Continue?"
      },
      
      // 书签面板
      bookmarks: {
        title: "Bookmarks",
        empty: "No bookmarks yet",
        emptyDesc: "Star your favorite scenes to bookmark them",
        goTo: "Go to Scene"
      },
      
      // 帮助面板
      help: {
        title: "📚 Keyboard Shortcuts Help",
        intro: "Use keyboard shortcuts to navigate \"A Study in Scarlet\" interactive reading experience more efficiently.",
        categories: {
          navigation: "🧭 Navigation Control",
          audio: "🎧 Audio Control",
          features: "🔧 Feature Toggle",
          general: "⌨️ General Operations"
        },
        shortcuts: {
          upDown: "Switch to previous/next scene",
          pageUpDown: "Quick page turn (3 scenes)",
          homeEnd: "Jump to first/last scene",
          tabShiftTab: "Switch focus between interactive elements",
          space: "Play/pause current scene audio",
          m: "Mute/unmute audio",
          leftRight: "Audio rewind/fast forward 10 seconds",
          plusMinus: "Increase/decrease volume",
          f: "Toggle fullscreen mode",
          b: "Open/close bookmarks panel",
          s: "Open/close settings panel",
          h: "Show/hide this help panel",
          esc: "Close open panels or exit fullscreen",
          enter: "Activate focused button or link",
          f11: "Browser native fullscreen toggle"
        },
        tips: {
          title: "💡 Usage Tips",
          items: [
            "**Focus Navigation:** Use Tab key to navigate between interactive elements, visible focus indicators will guide you.",
            "**Audio Control:** All audio controls support keyboard operation, no need to use mouse.",
            "**Quick Bookmarks:** Press B key to quickly access bookmarked scenes.",
            "**Fullscreen Reading:** Press F key to enter immersive reading mode.",
            "**Mobile Support:** All functions work normally on touch devices."
          ]
        }
      },
      
      // 音频控制
      audio: {
        play: "Play",
        pause: "Pause",
        loading: "Loading...",
        error: "Audio playback failed, please try again later",
        muted: "Muted",
        unmuted: "Unmuted",
        volume: "Volume",
        errors: {
          aborted: "Audio loading was interrupted",
          network: "Network error, unable to load audio",
          decode: "Audio decoding failed",
          notSupported: "Unsupported audio format",
          notFound: "Audio file does not exist or cannot be accessed"
        }
      },
      
      // 通用
      common: {
        close: "Close",
        scene: "Scene",
        duration: "Duration",
        loading: "Loading...",
        error: "Error",
        retry: "Retry",
        confirm: "Confirm",
        cancel: "Cancel"
      },
      
      // 圖片控制
      image: {
        loading: "Loading image...",
        error: "Failed to load image",
        retry: "Retry loading",
        errors: {
          notFound: "Image file not found",
          network: "Network error loading image",
          format: "Unsupported image format"
        }
      }
    }
  },
  
  zh: {
    // UI界面翻译
    ui: {
      title: "血字的研究 - 互动音频场景剧",
      subtitle: "滚动探索故事 • 点击播放按钮收听音频",
      
      // 导航和控制
      navigation: {
        previous: "上一场景",
        next: "下一场景",
        bookmark: "收藏此场景",
        removeBookmark: "取消收藏",
        fullscreen: "切换全屏",
        settings: "设置",
        help: "帮助"
      },
      
      // 设置面板
      settings: {
        title: "设置",
        autoplay: "音频自动播放",
        autoplayDesc: "在翻页到新场景时自动播放音频",
        autoplayNote: "📝 注意：遵循浏览器的自动播放策略，只有在用户与页面交互后才能启用自动播放。",
        volume: "音量控制",
        volumeDesc: "调节音频播放音量 (0-100%)",
        language: "语言 / Language",
        languageDesc: "选择您的首选语言",
        usage: "使用说明",
        usageDesc: "如何操作这个交互式故事",
        usageGuide: [
          "🔼 **翻页：**使用鼠标滚轮、上下箭头键或侧边按钮",
          "🎧 **音频：**点击播放按钮收听场景旁白",
          "📖 **书签：**为喜爱的场景添加星标以便快速访问",
          "⌨️ **键盘：**按H键查看所有快捷键",
          "📱 **移动端：**支持滑动手势触控导航",
          "🖥️ **全屏：**F键或全屏按钮进入沉浸式阅读"
        ],
        reset: "重置设置",
        resetWarning: "这将重置所有设置为默认值，是否继续？"
      },
      
      // 书签面板
      bookmarks: {
        title: "书签",
        empty: "暂无书签",
        emptyDesc: "为喜爱的场景添加星标以收藏",
        goTo: "跳转到场景"
      },
      
      // 帮助面板
      help: {
        title: "📚 键盘快捷键帮助",
        intro: "使用键盘快捷键可以让您更高效地浏览《血字的研究》交互式阅读体验。",
        categories: {
          navigation: "🧭 导航控制",
          audio: "🎧 音频控制",
          features: "🔧 功能切换",
          general: "⌨️ 通用操作"
        },
        shortcuts: {
          upDown: "切换上一个/下一个场景",
          pageUpDown: "快速翻页（3个场景）",
          homeEnd: "跳转到第一个/最后一个场景",
          tabShiftTab: "在可交互元素间切换焦点",
          space: "播放/暂停当前场景音频",
          m: "静音/取消静音音频",
          leftRight: "音频快退/快进10秒",
          plusMinus: "增加/减少音量",
          f: "切换全屏模式",
          b: "打开/关闭书签面板",
          s: "打开/关闭设置面板",
          h: "显示/隐藏此帮助面板",
          esc: "关闭打开的面板或退出全屏",
          enter: "激活聚焦的按钮或链接",
          f11: "浏览器原生全屏切换"
        },
        tips: {
          title: "💡 使用技巧",
          items: [
            "**焦点导航：** 使用Tab键在交互元素间导航，可见的焦点指示器会引导您。",
            "**音频控制：** 所有音频控制都支持键盘操作，无需使用鼠标。",
            "**快速书签：** 按B键快速访问收藏的场景。",
            "**全屏阅读：** 按F键进入沉浸式阅读模式。",
            "**移动端支持：** 所有功能在触摸设备上都能正常工作。"
          ]
        }
      },
      
      // 音频控制
      audio: {
        play: "播放",
        pause: "暂停",
        loading: "加载中...",
        error: "音频播放失败，请稍后重试",
        muted: "已静音",
        unmuted: "取消静音",
        volume: "音量",
        errors: {
          aborted: "音频加载被中断",
          network: "网络错误，无法加载音频",
          decode: "音频解码失败",
          notSupported: "不支持的音频格式",
          notFound: "音频文件不存在或无法访问"
        }
      },
      
      // 通用
      common: {
        close: "关闭",
        scene: "场景",
        duration: "时长",
        loading: "加载中...",
        error: "错误",
        retry: "重试",
        confirm: "确认",
        cancel: "取消"
      }
    }
  }
};

// 语言选项
export const languageOptions = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' }
];

// 默认语言
export const defaultLanguage = 'en';
