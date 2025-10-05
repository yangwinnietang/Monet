# Oscar Picture Book - Vercel 部署指南

## 项目概述
Oscar Picture Book 是一个AI驱动的儿童绘本生成平台，包含React前端和Node.js后端API。

## 部署架构
- **前端**: React应用 (oscar目录) → Vercel静态托管
- **后端**: Node.js API (reference目录) → Vercel Serverless Functions
- **API路由**: `/api/*` → 后端函数，其他路由 → 前端应用

## 部署步骤

### 1. 准备工作
确保项目根目录包含以下文件：
- `vercel.json` - Vercel配置文件
- `.vercelignore` - 忽略文件配置
- `.env.example` - 环境变量示例

### 2. 安装Vercel CLI
```bash
npm install -g vercel
```

### 3. 登录Vercel
```bash
vercel login
```

### 4. 配置环境变量
在Vercel Dashboard中设置以下环境变量：
- `OPENAI_API_KEY`: GLM-4-Flash API密钥
- `COGVIEW_API_KEY`: CogView-3-Flash图像生成API密钥
- `NODE_ENV`: production

### 5. 部署项目
在项目根目录执行：
```bash
vercel --prod
```

## 项目结构
```
AI_book/
├── oscar/                 # React前端应用
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── reference/             # Node.js后端API
│   ├── api/
│   │   └── index.js      # Vercel函数入口
│   ├── models/
│   ├── server.js         # 本地开发服务器
│   └── package.json
├── vercel.json           # Vercel配置
├── .vercelignore         # 忽略文件
└── .env.example          # 环境变量示例
```

## API端点
- `GET /api/health` - 健康检查
- `POST /api/generate-story` - 生成故事
- `POST /api/generate-image` - 生成单张图片
- `POST /api/generate-images-batch` - 批量生成图片
- `GET /api/stories` - 获取故事列表
- `GET /api/stories/:id` - 获取单个故事
- `POST /api/log` - 前端日志记录

## 环境变量说明
| 变量名 | 说明 | 必需 |
|--------|------|------|
| OPENAI_API_KEY | GLM-4-Flash模型API密钥 | 是 |
| COGVIEW_API_KEY | CogView-3-Flash图像生成API密钥 | 是 |
| NODE_ENV | 运行环境 (production) | 是 |

## 故障排除

### 1. 部署失败
- 检查`package.json`中的依赖版本
- 确保所有必需的环境变量已设置
- 查看Vercel部署日志

### 2. API调用失败
- 验证API密钥是否正确设置
- 检查网络连接和API服务状态
- 查看函数日志

### 3. 前端路由问题
- 确保`vercel.json`中的路由配置正确
- 检查前端构建是否成功

## 本地开发
```bash
# 启动前端开发服务器
cd oscar
npm run dev

# 启动后端开发服务器
cd reference
npm run dev
```

## 生产环境URL
部署成功后，Vercel会提供生产环境URL，格式通常为：
`https://your-project-name.vercel.app`