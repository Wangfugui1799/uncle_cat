# 核心DNA显示问题修复计划

## 问题分析
根据用户反馈和代码分析，核心DNA显示存在问题，可能的原因包括：
1. 核心DNA提取不完整或格式不正确
2. Markdown渲染问题导致显示异常
3. 内容清理逻辑不完善

## 修复方案

### 1. 增强核心DNA提取逻辑
- 优化 `parseGeneratedResult` 函数中的正则表达式，确保正确提取基础设定和核心DNA
- 修复 `cleanGeneratedResult` 函数，确保核心DNA格式正确

### 2. 改进内容清理逻辑
- 增强 `cleanCodeBlock` 函数，处理更多边缘情况
- 添加核心DNA内容的验证和修复逻辑

### 3. 优化Markdown渲染
- 检查MarkdownViewer组件的配置，确保正确渲染核心DNA内容
- 添加针对核心DNA内容的特殊处理

## 具体修改点

1. **App.tsx:345** - 优化基础设定提取正则，确保正确匹配到核心DNA之前的内容
2. **App.tsx:349** - 优化核心DNA提取正则，确保只提取核心DNA部分
3. **App.tsx:493** - 增强核心DNA格式修复逻辑，确保正确的Markdown格式
4. **App.tsx:333-338** - 增强 `cleanCodeBlock` 函数，处理更多格式问题
5. **components/MarkdownViewer.tsx** - 优化Markdown渲染配置，确保正确显示核心DNA

## 预期效果
- 核心DNA内容正确提取和显示
- Markdown格式正确渲染
- 基础设定和核心DNA清晰分离
- 显示效果符合预期

## 测试计划
1. 重新生成核心DNA，检查显示效果
2. 测试不同格式的核心DNA内容
3. 验证基础设定和核心DNA的分离显示

## 实施步骤
1. 修改核心DNA提取和清理逻辑
2. 优化Markdown渲染配置
3. 测试修复效果
4. 部署修复后的代码