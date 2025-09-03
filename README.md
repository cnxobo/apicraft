# APICraft - API测试工具

一个类似Postman的现代化API测试工具，使用React + Vite + TailwindCSS + shadcn/ui + Framer Motion构建。

## 功能特性

### 🎨 现代化UI设计
- 支持暗黑/亮色主题，自动跟随系统主题
- 流畅的动画过渡效果
- 响应式布局设计
- 类似Postman的用户体验

### 📱 灵活的布局系统
- **顶部工具栏**：全局搜索、用户信息、主题切换
- **左侧面板**：API集合树，支持拖拽调整宽度
- **中间面板**：多标签页请求编辑器
- **右侧面板**：环境变量、历史记录、日志等
- **底部状态栏**：环境状态、网络状态、请求统计

### 🚀 强大的API测试功能
- 支持所有HTTP方法（GET、POST、PUT、DELETE等）
- 参数、请求头、请求体编辑
- 响应结果格式化显示
- 请求历史记录
- 环境变量管理

### 🎯 交互体验
- 拖拽调整面板宽度
- 平滑的展开/收起动画
- 多标签页管理
- 虚拟化长列表（性能优化）

## 技术栈

- **React 18** - 现代化React框架
- **Vite** - 快速构建工具
- **TailwindCSS** - 原子化CSS框架
- **shadcn/ui** - 现代化UI组件库
- **Framer Motion** - 动画库
- **Zustand** - 轻量级状态管理
- **Lucide React** - 图标库

## 快速开始

### 安装依赖

```bash
# 使用npm
npm install

# 或使用yarn
yarn install

# 或使用pnpm
pnpm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── ui/             # shadcn/ui基础组件
│   ├── layout/         # 布局组件
│   ├── common/         # 通用组件
│   └── features/       # 功能组件
├── hooks/              # 自定义Hooks
├── store/              # 状态管理
├── data/               # 模拟数据
├── lib/                # 工具函数
└── main.jsx           # 应用入口
```

## 主要组件说明

### 布局组件
- `Header.jsx` - 顶部工具栏
- `LeftPanel.jsx` - 左侧面板（API集合）
- `CenterPanel.jsx` - 中间面板（请求编辑器）
- `RightPanel.jsx` - 右侧面板（环境变量等）
- `Footer.jsx` - 底部状态栏

### 功能组件
- `ApiTree.jsx` - API集合树
- `RequestEditor.jsx` - 请求编辑器
- `ResponseViewer.jsx` - 响应查看器
- `EnvironmentPanel.jsx` - 环境变量面板

### 自定义Hooks
- `useResize.js` - 拖拽调整大小
- `useLocalStorage.js` - 本地存储

## 功能演示

### 1. API集合管理
- 支持多层级API集合
- 展开/折叠动画
- 拖拽排序（开发中）

### 2. 请求编辑
- HTTP方法选择
- URL输入
- 参数、请求头、请求体编辑
- 一键发送请求

### 3. 响应查看
- 格式化JSON显示
- 原始响应查看
- 响应头信息
- 复制和下载功能

### 4. 环境管理
- 多环境配置
- 变量管理
- 敏感信息隐藏

### 5. 主题切换
- 亮色主题
- 暗色主题
- 跟随系统主题

## 开发说明

### 添加新的API集合
在 `src/data/mockData.js` 中添加新的集合数据。

### 自定义主题
在 `tailwind.config.js` 中修改主题配置。

### 添加新功能面板
1. 在 `src/components/features/` 中创建新组件
2. 在 `RightPanel.jsx` 中注册新面板

## 待开发功能

- [ ] API文档生成
- [ ] 请求历史搜索
- [ ] 批量请求执行
- [ ] 请求脚本支持
- [ ] 团队协作功能
- [ ] 数据导入/导出
- [ ] 插件系统

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
