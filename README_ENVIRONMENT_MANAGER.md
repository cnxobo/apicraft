# 环境变量管理器

一个完整的环境变量管理解决方案，已集成到 APIcraft 项目中。

## 🚀 快速开始

### 1. 启动项目
```bash
npm install
npm run dev
```

### 2. 访问环境管理器
1. 打开浏览器访问 `http://localhost:3000`
2. 点击左侧导航栏的齿轮图标（Environments）
3. 开始管理你的环境变量

## 📋 功能特性

### ✨ 环境管理
- **Globals 环境**：系统固定环境，存储全局变量
- **自定义环境**：创建、重命名、删除自定义环境
- **环境切换**：快速在不同环境间切换
- **搜索过滤**：按名称搜索环境

### 🔧 变量管理
- **多种类型**：String、Number、Boolean、DateTime、Secret
- **双值系统**：初始值和当前值分离管理
- **批量操作**：添加、编辑、删除变量
- **安全显示**：Secret 类型自动隐藏

### 🎨 用户体验
- **流畅动画**：基于 Framer Motion 的自然过渡
- **响应式设计**：适配各种屏幕尺寸
- **键盘支持**：Enter 确认、Escape 取消
- **主题适配**：支持深色/浅色主题

## 🛠️ 技术架构

### 状态管理
使用 Zustand + LocalStorage 持久化：

```javascript
// 数据结构
{
  "globals": {
    "id": "globals",
    "name": "Globals",
    "variables": [...]
  },
  "environments": [...]
}
```

### 核心组件
- `EnvironmentManager` - 主管理界面
- `VariableTable` - 变量表格
- `EnvironmentVariableDemo` - 功能演示

### UI 组件库
基于 Radix UI + Tailwind CSS：
- Select、Input、Button、ScrollArea
- 完全可定制的设计系统

## 📖 使用指南

### 基础操作

#### 创建环境
1. 点击 "Create New Environment"
2. 输入环境名称
3. 按 Enter 或点击确认

#### 管理变量
1. 选择目标环境
2. 点击 "Add Variable"
3. 填写变量信息：
   - **名称**：变量标识符
   - **类型**：选择合适的数据类型
   - **初始值**：默认值
   - **当前值**：实际使用值

#### 变量引用
在文本中使用以下格式引用变量：
- `{{variableName}}` - 双花括号格式
- `${variableName}` - 美元符号格式

### 高级功能

#### 编程接口
```javascript
import { 
  resolveEnvironmentVariables,
  resolveObjectVariables,
  getEnvironmentVariables 
} from '@/utils/environmentVariables'

// 解析单个字符串
const url = resolveEnvironmentVariables('{{host}}/api/users')

// 解析整个对象
const request = resolveObjectVariables({
  url: '{{host}}/api/users',
  headers: {
    'Authorization': 'Bearer {{token}}'
  }
})

// 获取所有变量
const variables = getEnvironmentVariables('env_1')
```

#### React Hook
```javascript
import { useEnvironmentResolver } from '@/utils/environmentVariables'

function MyComponent() {
  const resolver = useEnvironmentResolver()
  
  const handleRequest = () => {
    const url = resolver('{{host}}/api/data')
    // 发送请求...
  }
}
```

## 🔍 演示功能

项目包含一个完整的演示组件 `EnvironmentVariableDemo`，展示：

- **实时解析**：输入包含变量的文本，实时查看解析结果
- **变量验证**：检查变量引用是否有效
- **示例模板**：预设常用的变量使用场景
- **环境切换**：动态切换环境查看不同结果

## 📁 文件结构

```
src/
├── components/
│   ├── features/
│   │   ├── EnvironmentManager.jsx      # 主管理界面
│   │   ├── VariableTable.jsx           # 变量表格
│   │   └── EnvironmentVariableDemo.jsx # 功能演示
│   ├── layout/
│   │   └── LeftPanel.jsx               # 左侧导航（已修改）
│   └── ui/                             # UI 组件库
├── store/
│   └── index.js                        # Zustand 状态管理
└── utils/
    └── environmentVariables.js         # 工具函数
```

## 🧪 测试

```bash
# 运行测试
npm test

# 运行特定测试
npm test EnvironmentManager
```

## 🔧 自定义配置

### 添加新的变量类型
在 `VariableTable.jsx` 中的 `TypeSelector` 组件添加新类型：

```javascript
const types = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'datetime', label: 'DateTime' },
  { value: 'secret', label: 'Secret' },
  { value: 'custom', label: 'Custom' }  // 新类型
]
```

### 修改存储键名
在 `store/index.js` 中修改持久化配置：

```javascript
{
  name: "your-custom-storage-key",
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
