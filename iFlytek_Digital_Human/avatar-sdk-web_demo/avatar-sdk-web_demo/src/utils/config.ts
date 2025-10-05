import fs from 'fs';
import path from 'path';

// 配置接口定义
export interface AvatarConfig {
  serverUrl: string;
  appId: string;
  apiKey: string;
  apiSecret: string;
  sceneId: string;
  avatar_id?: string;
  avatar_name?: string;
  vcn?: string;
  voice_name?: string;
}

export interface ProjectConfig {
  name: string;
  path: string;
  port: number;
  start_command: string;
  build_command: string;
}

export interface AppConfig {
  avatar: AvatarConfig;
  projects: {
    react_demo: ProjectConfig;
    vue2_demo: ProjectConfig;
  };
  settings: {
    auto_open_browser: boolean;
    concurrent_start: boolean;
    log_level: number;
    default_project: string;
  };
}

// 默认配置
const defaultConfig: AppConfig = {
  avatar: {
    serverUrl: 'wss://avatar.cn-huadong-1.xf-yun.com/v1/interact',
    appId: 'd93178dd',
    apiKey: '5150e817fd0911187217a67732dda82b',
    apiSecret: 'MzA4NGQ2ZTU5ZjExMTU0YTg4YWM4ZjFi',
    sceneId: '222287810449772544',
    avatar_id: '110017006',
    avatar_name: '马可',
    vcn: 'x4_xiaozhong',
    voice_name: '小钟'
  },
  projects: {
    react_demo: {
      name: "Avatar SDK Web Demo (React)",
      path: "./avatar-sdk-web_demo/avatar-sdk-web_demo",
      port: 5174,
      start_command: "npm run dev",
      build_command: "npm run build:lib"
    },
    vue2_demo: {
      name: "Web SDK Vue2 Demo",
      path: "./web-sdk-vue2-master/web-sdk-vue2-master",
      port: 8081,
      start_command: "npm run serve",
      build_command: "npm run build"
    }
  },
  settings: {
    auto_open_browser: true,
    concurrent_start: true,
    log_level: 0,
    default_project: "react_demo"
  }
};

// 获取配置文件路径
function getConfigPath(): string {
  // 尝试从项目根目录读取配置
  const rootConfigPath = path.resolve(process.cwd(), '../../config.json');
  const localConfigPath = path.resolve(process.cwd(), 'config.json');
  
  if (fs.existsSync(rootConfigPath)) {
    return rootConfigPath;
  } else if (fs.existsSync(localConfigPath)) {
    return localConfigPath;
  }
  
  return rootConfigPath; // 默认返回根目录路径
}

// 读取配置文件
export function loadConfig(): AppConfig {
  try {
    const configPath = getConfigPath();
    
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configContent) as AppConfig;
      
      // 合并默认配置，确保所有必需字段都存在
      return {
        ...defaultConfig,
        ...config,
        avatar: {
          ...defaultConfig.avatar,
          ...config.avatar
        },
        projects: {
          ...defaultConfig.projects,
          ...config.projects
        },
        settings: {
          ...defaultConfig.settings,
          ...config.settings
        }
      };
    }
  } catch (error) {
    console.warn('读取配置文件失败，使用默认配置:', error);
  }
  
  return defaultConfig;
}

// 保存配置文件
export function saveConfig(config: AppConfig): boolean {
  try {
    const configPath = getConfigPath();
    const configDir = path.dirname(configPath);
    
    // 确保目录存在
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log('配置文件保存成功:', configPath);
    return true;
  } catch (error) {
    console.error('保存配置文件失败:', error);
    return false;
  }
}

// 获取Avatar API配置
export function getAvatarConfig(): AvatarConfig {
  const config = loadConfig();
  return config.avatar;
}

// 获取项目配置
export function getProjectConfig(projectName: 'react_demo' | 'vue2_demo'): ProjectConfig {
  const config = loadConfig();
  return config.projects[projectName];
}

// 获取设置配置
export function getSettings() {
  const config = loadConfig();
  return config.settings;
}

// 从环境变量读取配置（浏览器环境的备用方案）
export function getConfigFromEnv(): AvatarConfig {
  return {
    serverUrl: import.meta.env.VITE_AVATAR_SERVER_URL || defaultConfig.avatar.serverUrl,
    appId: import.meta.env.VITE_AVATAR_APP_ID || defaultConfig.avatar.appId,
    apiKey: import.meta.env.VITE_AVATAR_API_KEY || defaultConfig.avatar.apiKey,
    apiSecret: import.meta.env.VITE_AVATAR_API_SECRET || defaultConfig.avatar.apiSecret,
    sceneId: import.meta.env.VITE_AVATAR_SCENE_ID || defaultConfig.avatar.sceneId,
    avatar_id: import.meta.env.VITE_AVATAR_ID || defaultConfig.avatar.avatar_id,
    avatar_name: import.meta.env.VITE_AVATAR_NAME || defaultConfig.avatar.avatar_name,
    vcn: import.meta.env.VITE_VOICE_VCN || defaultConfig.avatar.vcn,
    voice_name: import.meta.env.VITE_VOICE_NAME || defaultConfig.avatar.voice_name
  };
}

// 浏览器环境下的配置获取函数
export function getBrowserConfig(): AvatarConfig {
  // 在浏览器环境中，我们无法直接读取文件系统
  // 所以使用环境变量或localStorage作为备用方案
  
  try {
    // 尝试从localStorage读取配置
    const savedConfig = localStorage.getItem('avatar_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig) as AvatarConfig;
      return {
        ...defaultConfig.avatar,
        ...config
      };
    }
  } catch (error) {
    console.warn('从localStorage读取配置失败:', error);
  }
  
  // 回退到环境变量配置
  return getConfigFromEnv();
}

// 保存配置到localStorage（浏览器环境）
export function saveBrowserConfig(config: AvatarConfig): boolean {
  try {
    localStorage.setItem('avatar_config', JSON.stringify(config));
    console.log('配置已保存到localStorage');
    return true;
  } catch (error) {
    console.error('保存配置到localStorage失败:', error);
    return false;
  }
}

// 导出默认配置供外部使用
export { defaultConfig };