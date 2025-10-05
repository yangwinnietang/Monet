# 数字人项目一键启动解决方案

这是一个为数字人项目提供的一键启动解决方案，包含React和Vue2两个演示项目，支持统一配置管理和快速启动。

## 项目结构

```
.
├── avatar-sdk-web_demo/          # React演示项目
├── web-sdk-vue2-master/          # Vue2演示项目
├── config.json                   # 统一配置文件
├── .env.template                 # 环境变量模板
├── start.bat                     # Windows一键启动脚本
├── start.sh                      # Linux/Mac一键启动脚本
├── setup.js                      # 配置向导
└── README.md                     # 说明文档
```

## 快速开始

### 1. 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 2. 一键启动

**Windows用户：**
```bash
# 双击运行或在命令行执行
start.bat
```

**Linux/Mac用户：**
```bash
# 添加执行权限
chmod +x start.sh
# 运行脚本
./start.sh
```

### 3. 启动选项

脚本会提供以下选项：
1. 启动React Demo (端口: 5173)
2. 启动Vue2 Demo (端口: 8081)
3. 同时启动两个项目
4. 运行配置向导
5. 退出

## 配置说明

### 统一配置文件 (config.json)

项目使用统一的配置文件管理所有API信息：

```json
{
  "api": {
    "serverUrl": "wss://avatar.cn-huadong-1.xf-yun.com/v1/interact",
    "appId": "d93178dd",
    "apiKey": "5150e817fd0911187217a67732dda82b",
    "apiSecret": "MzA4NGQ2ZTU5ZjExMTU0YTg4YWM4ZjFi",
    "sceneId": "222287810449772544",
    "avatar_id": "110017006",
    "vcn": "x4_xiaozhong"
  }
}
```

### 环境变量配置

每个项目都有对应的.env文件，从统一配置中读取信息：

**React项目 (.env):**
```
VITE_SERVER_URL=wss://avatar.cn-huadong-1.xf-yun.com/v1/interact
VITE_APP_ID=d93178dd
VITE_API_KEY=5150e817fd0911187217a67732dda82b
# ... 其他配置
```

**Vue2项目 (.env):**
```
VUE_APP_SERVER_URL=wss://avatar.cn-huadong-1.xf-yun.com/v1/interact
VUE_APP_APP_ID=d93178dd
VUE_APP_API_KEY=5150e817fd0911187217a67732dda82b
# ... 其他配置
```

### 配置向导

如果需要修改API配置，可以运行配置向导：

```bash
node setup.js
```

配置向导会引导您：
1. 输入API服务器地址
2. 输入APPID、API密钥等信息
3. 选择虚拟人形象和声音
4. 设置项目参数
5. 自动保存配置到相关文件

## API配置参数说明

### 基础API参数

- **serverUrl**: 数字人服务器地址
- **appId**: 应用ID（从交互平台获取）
- **apiKey**: API密钥（从交互平台获取）
- **apiSecret**: API密钥（从交互平台获取）
- **sceneId**: 场景ID（接口服务ID）

### 虚拟人参数

- **avatar_id**: 形象资源ID
  - `110017006`: 马可（默认）
  - 其他形象ID可从交互平台获取

- **vcn**: 声音资源ID
  - `x4_xiaozhong`: 小钟（默认）
  - 其他声音ID可从交互平台获取

### 高级参数

- **protocol**: 视频协议（webrtc/xrtc/rtmp）
- **alpha**: 是否开启透明背景
- **interactive_mode**: 交互模式（0追加/1打断）
- **subtitle**: 是否开启字幕

## 项目特性

### React项目特性
- 使用Vite构建工具
- 支持TypeScript
- 现代化的React Hooks
- 响应式设计

### Vue2项目特性
- Vue 2.x框架
- Element UI组件库
- 完整的数字人交互功能
- 实时视频流处理

## 故障排除

### 常见问题

1. **端口被占用**
   - React项目默认端口：5173
   - Vue2项目默认端口：8081
   - 可在.env文件中修改端口配置

2. **API连接失败**
   - 检查网络连接
   - 验证API密钥是否正确
   - 确认服务器地址是否可访问

3. **依赖安装失败**
   - 尝试删除node_modules文件夹
   - 重新运行npm install
   - 检查Node.js版本是否符合要求

### 日志查看

启动脚本会显示详细的启动日志，包括：
- 依赖安装进度
- 服务器启动状态
- 错误信息和解决建议

## 开发说明

### 修改配置

1. 直接编辑`config.json`文件
2. 使用配置向导`node setup.js`
3. 手动修改各项目的.env文件

### 添加新项目

1. 在`config.json`中添加项目配置
2. 修改启动脚本添加新的启动选项
3. 创建对应的.env文件

## 技术支持

如遇到问题，请检查：
1. Node.js版本是否符合要求
2. 网络连接是否正常
3. API密钥是否有效
4. 端口是否被占用

## 更新日志

### v1.0.0
- 初始版本发布
- 支持React和Vue2项目一键启动
- 统一配置管理
- 配置向导功能
- 跨平台启动脚本

---

**注意**: 请确保您有有效的数字人API密钥才能正常使用本项目。API密钥可从讯飞数字人交互平台获取。