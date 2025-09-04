# 环境变量管理器演示

## 功能概述

环境变量管理器已成功集成到 APIcraft 项目中，提供了完整的环境变量管理功能。

## 主要特性

### 1. 导航集成
- 在左侧导航栏新增了 "Environments" 图标（齿轮图标）
- 点击可在 "Collections" 和 "Environments" 视图之间切换
- 保持与现有设计风格的一致性

### 2. 环境管理
- **Globals 环境**：系统固定环境，不可删除，用于存储全局变量
- **自定义环境**：用户可创建、重命名、删除的环境
- **搜索功能**：支持按环境名称过滤
- **环境统计**：显示每个环境的变量数量

### 3. 变量管理
- **变量类型**：支持 String、Number、Boolean、DateTime、Secret 五种类型
- **双值系统**：每个变量有初始值（Initial Value）和当前值（Current Value）
- **密钥保护**：Secret 类型变量自动隐藏显示，支持显示/隐藏切换
- **批量操作**：支持添加、编辑、删除变量
- **值重置**：当前值与初始值不同时，可一键重置

### 4. 用户体验
- **流畅动画**：使用 Framer Motion 提供自然的过渡效果
- **响应式设计**：适配不同屏幕尺寸
- **键盘支持**：支持 Enter 确认、Escape 取消等快捷键
- **视觉反馈**：悬停效果、状态指示、变更高亮

## 技术实现

### 状态管理
使用 Zustand 进行状态管理，数据持久化到 LocalStorage：

```javascript
// 环境变量数据结构
{
  "globals": {
    "id": "globals",
    "name": "Globals", 
    "variables": [...]
  },
  "environments": [
    {
      "id": "env_1",
      "name": "1-local",
      "variables": [...]
    }
  ]
}
```

### 组件架构
- `EnvironmentManager`: 主管理界面
- `VariableTable`: 变量表格组件
- `TypeSelector`: 类型选择器
- `ValueInput`: 值输入组件

### UI 组件
基于 Radix UI 构建，包括：
- Select 下拉选择器
- Input 输入框
- Button 按钮
- ScrollArea 滚动区域

## 使用方法

### 1. 访问环境管理器
1. 启动项目：`npm run dev`
2. 打开浏览器访问：`http://localhost:3000`
3. 点击左侧导航栏的齿轮图标（Environments）

### 2. 创建环境
1. 点击 "Create New Environment" 按钮
2. 输入环境名称
3. 按 Enter 确认或点击确认按钮

### 3. 管理变量
1. 选择要管理的环境
2. 点击 "Add Variable" 添加新变量
3. 填写变量名、选择类型、设置初始值和当前值
4. 使用编辑/删除按钮管理现有变量

### 4. 环境操作
- **重命名**：点击环境名称旁的编辑图标
- **删除**：点击环境名称旁的删除图标（Globals 环境不可删除）
- **搜索**：使用搜索框过滤环境列表

## 数据持久化

所有环境变量数据自动保存到浏览器的 LocalStorage 中，键名为 `environment-storage`。数据在页面刷新后会自动恢复。

## 扩展性

该实现具有良好的扩展性：
- 可轻松添加新的变量类型
- 支持导入/导出功能扩展
- 可集成到 API 请求流程中
- 支持环境变量的引用和替换

## 兼容性

- 支持现代浏览器（Chrome、Firefox、Safari、Edge）
- 响应式设计，支持桌面和平板设备
- 深色/浅色主题自适应
