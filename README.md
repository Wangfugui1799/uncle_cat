# 猫叔智能小说创作助手

## 项目介绍

猫叔智能小说创作助手是一个基于AI驱动的智能小说创作平台，帮助作者完成从创意构思到章节写作的全流程创作。该平台集成了多种AI模型，提供了完整的小说创作工作流，包括核心架构生成、角色设计、世界观构建、情节架构和章节写作等功能。

## 核心功能

- **结构化创作流程**：引导用户从初始创意到完整小说的八步创作流程
- **多AI模型支持**：兼容Google Gemini、OpenAI、Claude、DeepSeek、OpenRouter等多种AI提供商，提供10+精选模型
- **OpenRouter集成**：新增OpenRouter AI模型聚合服务，支持Gemini 2.5系列、Claude 3.5 Sonnet、GPT-4o等主流模型
- **智能状态管理**：自动同步全局摘要与角色状态，保持剧情一致性
- **丰富的可视化展示**：支持Markdown渲染、DNA可视化、世界观可视化
- **灵活的自定义选项**：支持自定义提示词、模板和创作要求
- **项目管理功能**：支持项目的导入、导出和自动保存

## OpenRouter AI模型聚合

OpenRouter是一个统一的AI模型访问平台，通过单一API接口即可使用多种顶级AI模型。本项目现已全面集成OpenRouter服务：

### 支持的模型

- **🔮 Gemini系列**
  - Gemini 2.5 Flash Experimental - 最新的实验版本，性能卓越
  - Gemini 2.5 Pro - 专业版本，能力全面
  - Gemini 1.5 Pro - 稳定版本，经过验证

- **🧠 Anthropic Claude**
  - Claude 3.5 Sonnet - 业界顶级对话模型

- **⚡ OpenAI**
  - GPT-4o - 旗舰模型
  - GPT-4o Mini - 经济高效选择

- **🦙 Meta Llama**
  - Llama 3.3 70B - 开源大模型

- **🇨🇳 国产模型**
  - Qwen 2.5 72B (Alibaba) - 优秀的国产开源模型
  - DeepSeek Chat (DeepSeek) - 商业级中文模型

### 配置说明

1. 获取OpenRouter API密钥：[https://openrouter.ai/keys](https://openrouter.ai/keys)
2. 在应用设置中选择"OpenRouter (AI模型聚合)"提供商
3. 输入API密钥并选择合适的模型

## 快速开始

### 环境要求

- Node.js 18+（推荐使用最新LTS版本）
- npm或yarn包管理器
- 现代浏览器（Chrome、Firefox、Edge等）

### 安装与运行

1. **克隆仓库**
   ```bash
   git clone https://github.com/Wangfugui1799/uncle_cat.git
   cd uncle_cat
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   打开浏览器访问 `http://localhost:5173`

### 生产构建

```bash
# 标准构建
npm run build

# 构建带隐藏提示词管理的版本
npm run build:hide-prompts

# 预览构建结果
npm run preview
```

## 技术栈

- **前端框架**：React 19
- **类型系统**：TypeScript
- **构建工具**：Vite
- **样式框架**：Tailwind CSS
- **UI组件**：lucide-react图标库
- **API集成**：支持多种AI模型接口
- **状态管理**：React内置状态管理

## 项目结构

```
uncle_cat/
├── components/          # React 组件
├── services/           # 服务层
├── public/             # 静态资源
├── docs/               # 项目文档
├── App.tsx             # 主应用组件
├── constants.ts        # 常量定义
├── types.ts            # 类型定义
├── package.json        # 项目配置
└── vite.config.ts      # Vite 配置
```

## 完整文档

查看[猫叔智能小说创作助手使用指南](docs/USER_GUIDE.md)获取详细的使用说明和高级功能介绍，包括：

- 详细的八步创作流程
- AI模型配置和管理
- 提示词管理功能
- 创作技巧与最佳实践
- 常见问题解答

## 开发与贡献

### 开发脚本

```bash
npm run dev        # 启动开发服务器
npm run build      # 生产构建
npm run preview    # 预览构建结果
```

### 贡献指南

1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用MIT许可证，详细信息请查看[LICENSE](LICENSE)文件。

## 联系方式

- GitHub Issues：https://github.com/Wangfugui1799/uncle_cat/issues
- 项目主页：https://github.com/Wangfugui1799/uncle_cat

## 更新日志

### v1.1.0（2025-12-15）

- ✨ 新增OpenRouter AI模型聚合服务支持
- 🔧 集成10个精选模型，包括Gemini 2.5系列、Claude 3.5 Sonnet、GPT-4o
- 🎯 优化模型选择体验，按提供商分组展示
- 📝 完善API配置界面，添加OpenRouter密钥指引
- 🚀 提升创作工具的多样性和灵活性

### v1.0.0（2025-12-12）

- 项目更名为"猫叔智能小说创作助手"
- 支持多AI模型提供商
- 优化创作流程和用户体验
- 增强状态同步功能
- 完善项目管理功能

### v0.9.0（2025-11-30）

- 初始版本发布
- 支持完整的八步创作流程
- 集成Gemini API
- 实现基础的AI生成功能

---

**感谢您使用猫叔智能小说创作助手！**

希望这个工具能帮助您创作出优秀的小说作品。如果您有任何建议或反馈，欢迎随时联系我们。

祝您创作愉快！