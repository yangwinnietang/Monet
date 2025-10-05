# 🎨 Monet - AI绘本生成平台

<div align="center">

![Monet Logo](https://img.shields.io/badge/Monet-AI%20Picture%20Book-blue?style=for-the-badge&logo=palette&logoColor=white)

**一个基于AI技术的智能绘本生成平台，让每个人都能创作属于自己的艺术故事**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=flat-square)](https://traec3jclmjc-ouj5ssxqv-tang-winnies-projects.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)

</div>

## ✨ 项目简介

Monet是一个创新的AI绘本生成平台，以印象派大师莫奈的艺术风格为灵感，结合现代AI技术，为用户提供沉浸式的故事创作和阅读体验。平台支持多语言、响应式设计，并集成了先进的图像生成和语音合成功能。

### 🌟 核心特性

- **🤖 AI故事生成** - 基于用户输入智能生成个性化故事内容
- **🎨 AI图像生成** - 自动生成与故事情节匹配的精美插图
- **🔊 语音合成** - 支持多语言语音朗读，提供沉浸式体验
- **🌍 多语言支持** - 支持中文、英文等多种语言界面
- **📱 响应式设计** - 完美适配桌面端、平板和移动设备
- **⚡ 性能优化** - 图像预加载、WebP格式支持、CSS性能优化
- **🎭 数字人集成** - 集成讯飞数字人技术，提供更丰富的交互体验

## 🚀 在线演示

🔗 **[立即体验 Monet 平台](https://traec3jclmjc-ouj5ssxqv-tang-winnies-projects.vercel.app)**

## 📁 项目结构

```
Monet/
├── 📂 oscar/                    # 主应用程序
│   ├── 📂 src/
│   │   ├── 📂 components/       # React组件
│   │   ├── 📂 pages/           # 页面组件
│   │   ├── 📂 services/        # API服务
│   │   ├── 📂 hooks/           # 自定义Hooks
│   │   ├── 📂 utils/           # 工具函数
│   │   └── 📂 i18n/            # 国际化配置
│   └── 📂 public/              # 静态资源
├── 📂 api/                     # 后端API服务
├── 📂 story-1/                 # 故事展示应用1
├── 📂 story-2/                 # 故事展示应用2
├── 📂 reference/               # 参考资料和数据
├── 📂 iFlytek_Digital_Human/   # 讯飞数字人集成
└── 📂 .trae/                   # 项目文档
```

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化的用户界面框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 快速的构建工具和开发服务器
- **Tailwind CSS** - 实用优先的CSS框架
- **React Router** - 客户端路由管理
- **React Query** - 数据获取和状态管理

### 后端技术
- **Node.js** - JavaScript运行时环境
- **Express.js** - Web应用框架
- **RESTful API** - 标准化的API设计

### AI集成
- **OpenAI API** - 故事生成和图像生成
- **讯飞数字人** - 语音合成和数字人交互
- **自定义AI服务** - 针对绘本场景优化的AI模型

### 部署和工具
- **Vercel** - 现代化的部署平台
- **Git** - 版本控制系统
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐) 或 npm >= 9.0.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/yangwinnietang/Monet.git
   cd Monet
   ```

2. **安装依赖**
   ```bash
   # 主应用
   cd oscar
   pnpm install
   
   # API服务
   cd ../api
   npm install
   ```

3. **环境配置**
   ```bash
   # 复制环境变量模板
   cp .env.example .env
   
   # 编辑环境变量
   # 配置API密钥和服务端点
   ```

4. **启动开发服务器**
   ```bash
   # 启动前端应用 (端口: 5173)
   cd oscar
   pnpm dev
   
   # 启动API服务 (端口: 3000)
   cd api
   npm start
   ```

5. **访问应用**
   - 前端应用: http://localhost:5173
   - API服务: http://localhost:3000

## 📖 使用指南

### 创建你的第一个绘本

1. **访问主页** - 进入Monet平台主页
2. **选择创作模式** - 点击"开始创作"按钮
3. **输入故事主题** - 描述你想要的故事内容和风格
4. **AI生成内容** - 系统将自动生成故事文本和配图
5. **预览和编辑** - 查看生成的绘本，可进行个性化调整
6. **保存和分享** - 保存你的作品并与他人分享

### 功能特色

#### 🎨 智能图像生成
- 基于故事内容自动生成匹配的插图
- 支持多种艺术风格选择
- 高质量图像输出，支持WebP格式优化

#### 🔊 多语言语音朗读
- 支持中文、英文等多种语言
- 自然流畅的语音合成
- 可调节语速和音调

#### 📱 响应式体验
- 完美适配各种设备尺寸
- 触摸友好的交互设计
- 流畅的动画和过渡效果

## 🔧 配置说明

### 环境变量配置

创建 `.env` 文件并配置以下变量：

```env
# API配置
VITE_API_BASE_URL=http://localhost:3000
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_IFLYTEK_API_KEY=your_iflytek_api_key

# 应用配置
VITE_APP_TITLE=Monet AI Picture Book
VITE_APP_DESCRIPTION=AI-powered picture book generation platform

# 部署配置
VITE_DEPLOY_URL=https://your-domain.com
```

### API服务配置

在 `api/` 目录下配置后端服务：

```javascript
// api/config.js
module.exports = {
  port: process.env.PORT || 3000,
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
  },
  iflytek: {
    apiKey: process.env.IFLYTEK_API_KEY,
    appId: process.env.IFLYTEK_APP_ID,
  }
};
```

## 🎯 核心功能

### 1. 故事生成引擎
- **智能内容生成**: 基于用户输入生成连贯的故事情节
- **多样化主题**: 支持童话、科幻、历史等多种故事类型
- **个性化定制**: 根据用户偏好调整故事风格和长度

### 2. 图像生成系统
- **AI绘图**: 自动生成与故事匹配的高质量插图
- **风格一致性**: 保持整本绘本的艺术风格统一
- **快速渲染**: 优化的图像生成流程，提升用户体验

### 3. 交互体验
- **实时预览**: 即时查看生成的内容和效果
- **编辑功能**: 支持对生成的内容进行修改和优化
- **导出分享**: 多种格式导出，便于分享和保存

## 📊 性能优化

### 前端优化
- **代码分割**: 基于路由的懒加载
- **图像优化**: WebP格式支持，渐进式加载
- **缓存策略**: 智能的资源缓存机制
- **Bundle优化**: Tree-shaking和代码压缩

### 后端优化
- **API缓存**: Redis缓存热门请求
- **并发处理**: 异步处理AI生成任务
- **负载均衡**: 支持水平扩展部署

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详细信息。

### 开发流程

1. Fork 项目到你的GitHub账户
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add some amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建Pull Request

### 代码规范

- 使用 ESLint 和 Prettier 保持代码风格一致
- 编写清晰的提交信息
- 为新功能添加相应的测试
- 更新相关文档

## 📝 更新日志

### v1.2.0 (2024-01-15)
- ✨ 新增图像预加载优化系统
- 🎨 优化背景图片加载性能
- 🔧 改进WebP格式支持
- 📱 增强移动端体验

### v1.1.0 (2024-01-10)
- 🚀 集成讯飞数字人技术
- 🌍 完善多语言支持
- ⚡ API性能优化
- 🐛 修复已知问题

### v1.0.0 (2024-01-01)
- 🎉 项目正式发布
- 🤖 AI故事生成功能
- 🎨 AI图像生成功能
- 🔊 语音合成功能

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详细信息。

## 🙏 致谢

- **OpenAI** - 提供强大的AI生成能力
- **讯飞开放平台** - 数字人和语音技术支持
- **React团队** - 优秀的前端框架
- **Vercel** - 出色的部署平台
- **所有贡献者** - 感谢每一位为项目做出贡献的开发者

## 📞 联系我们

- **项目维护者**: Winnie Tang
- **邮箱**: winnie.tang@example.com
- **GitHub**: [@yangwinnietang](https://github.com/yangwinnietang)
- **项目地址**: [https://github.com/yangwinnietang/Monet](https://github.com/yangwinnietang/Monet)

---

<div align="center">

**🎨 让AI艺术点亮每个人的创作梦想 🎨**

Made with ❤️ by [Winnie Tang](https://github.com/yangwinnietang)

</div>