### 问题分析
用户切换到正文创作时出现弹窗报错，控制台显示：`Failed to fetch themes: SyntaxError: Unexpected token 'A', "Authentica"... is not valid JSON`。

**根本原因**：
1. `fetchMatchedThemes`函数只处理了Gemini API的请求格式
2. 硬编码了API请求URL为Gemini API格式
3. 直接将API响应解析为JSON，但不同模型可能返回不同格式内容
4. 错误处理不够完善，影响整个创作流程

### 修复方案

#### 1. 使用统一的API服务
- **修改文件**：`components/WritingStep.tsx`
- **优化点**：
  - 将直接fetch调用替换为统一的`generateContent`函数
  - 确保能处理所有API提供商（Gemini、DeepSeek、OpenAI等）
  - 利用`generateContent`函数的错误处理机制

#### 2. 增强JSON解析容错性
- **修改文件**：`components/WritingStep.tsx`
- **优化点**：
  - 增强`fetchMatchedThemes`函数的JSON解析逻辑
  - 添加更多容错机制，处理非纯JSON响应
  - 确保主题获取失败不会影响整个创作流程

#### 3. 优化错误处理和用户体验
- **修改文件**：`components/WritingStep.tsx`
- **优化点**：
  - 添加更友好的错误提示，不影响正常创作
  - 记录详细日志便于调试
  - 提供备选方案，确保创作流程继续

### 实施步骤
1. 修改`fetchMatchedThemes`函数，使用统一的`generateContent`函数
2. 增强JSON解析逻辑，添加更多容错机制
3. 优化错误处理，确保主题获取失败不影响创作流程
4. 测试修复后的功能，确保能处理不同模型的响应

### 预期效果
- 修复主题获取失败导致的弹窗报错
- 支持所有API提供商的响应格式
- 增强系统容错性，确保创作流程顺畅
- 提供更友好的用户体验