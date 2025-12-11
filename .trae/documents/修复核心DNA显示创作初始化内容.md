# 修复核心DNA显示创作初始化内容

## 问题分析
核心DNA生成后，之前修改的显示创作初始化内容的代码不见了，现在只显示生成的核心DNA，没有显示创作初始化中输入的内容。

## 修复方案

### 1. 添加核心DNA特定渲染逻辑
在`renderContent`函数中，添加一个特定的`if`分支，当`currentStepId === 'dna'`时：
- 首先显示创作初始化中输入的内容，格式为Markdown
- 然后显示生成的核心DNA
- 保持与其他步骤一致的视觉风格

### 2. 显示内容设计
创作初始化内容应包括：
- 核心脑洞
- 题材分类
- 小说名称
- 叙事视角
- 故事基调
- 结局倾向
- 预计章节数
- 每章字数
- 自定义特殊要求

### 3. 格式设计
- 使用Markdown格式，清晰易读
- 使用标题和列表组织内容
- 保持与核心DNA一致的样式
- 确保内容简洁明了

## 实现步骤

1. **修改 App.tsx**：
   - 在`renderContent`函数中添加`currentStepId === 'dna'`的特定处理
   - 构建包含创作初始化内容的Markdown字符串
   - 先渲染创作初始化内容，再渲染生成的核心DNA

2. **验证修复**：
   - 运行构建命令确保没有错误
   - 测试核心DNA生成功能
   - 验证生成的核心DNA页面显示了创作初始化内容

## 预期效果
- 核心DNA页面将首先显示创作初始化中输入的内容
- 然后显示生成的核心DNA
- 两者都使用Markdown格式，保持一致的视觉风格
- 用户可以清晰地看到核心DNA是基于哪些初始输入生成的

## 文件修改
- `App.tsx`: 在`renderContent`函数中添加核心DNA特定渲染逻辑

## 实现代码示例
```typescript
if (currentStepId === 'dna') {
    // 构建创作初始化内容的Markdown
    const initialContentMarkdown = `## 创作初始化内容

### 核心设定
**核心脑洞**: ${inputs.topic}
**题材分类**: ${inputs.genre || '未指定'}
**小说名称**: ${inputs.novelTitle || '未命名'}

### 叙事风格
**叙事视角**: ${inputs.perspective || '未指定'}
**故事基调**: ${inputs.tone || '未指定'}
**结局倾向**: ${inputs.ending || '未指定'}

### 篇幅规划
**预计章节数**: ${inputs.numberOfChapters || 10}章
**每章字数**: ${inputs.wordCount || 2000}字

### 特殊要求
**自定义特殊要求**: ${inputs.customRequirements || '无'}
`;

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-stone-900 p-4 rounded-xl border border-stone-800">
                <h2 className="text-xl font-bold text-white flex items-center">
                    {React.createElement(STEPS[currentStep].icon, { className: "mr-2 text-orange-400", size: 24 })} 
                    {STEPS[currentStep].title}
                </h2>
                {/* 右侧按钮组 */}
                <div className="flex space-x-3 flex-wrap justify-end">
                    {/* DNA特定按钮（判官审题） */}
                    <button
                        onClick={() => handleShowPrompt('JUDGE')}
                        className="text-stone-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-stone-800"
                        title="编辑判官提示词"
                    >
                        <FileText size={18} />
                    </button>
                    <button
                        onClick={handleJudge}
                        disabled={isJudging}
                        className={`px-4 py-2 bg-red-900/50 hover:bg-red-800/50 border border-red-800 text-red-200 rounded-lg flex items-center transition-all ${isJudging ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                    >
                        {isJudging ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Gavel size={18} className="mr-2" />}
                        {isJudging ? '审判中...' : '判官审题'}
                    </button>
                    
                    {/* 其他通用按钮 */}
                    {content && (
                        <button
                            onClick={() => openCustomModal(STEPS[currentStep].title, (val) => handleGenerateStep(currentStepId, val))}
                            className="flex items-center px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-colors border border-stone-700"
                        >
                            <RefreshCw size={16} className="mr-2" /> 重写/修改
                        </button>
                    )}
                    <button
                        onClick={() => handleGenerateStep(currentStepId)}
                        disabled={isGenerating}
                        className={`flex items-center px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-orange-500/20'}`}
                    >
                        {isGenerating ? <RefreshCw className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                        {content ? '重新生成' : '立即生成'}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-stone-900 border border-stone-800 rounded-xl p-6 overflow-y-auto relative">
                {isGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/90 z-10">
                        <RefreshCw className="animate-spin w-12 h-12 text-orange-500 mb-4" />
                        <p className="text-orange-300 font-mono animate-pulse">{loadingMessage || "AI 正在深度思考构建中..."}</p>
                    </div>
                ) : content ? (
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* 显示创作初始化内容 */}
                        <div>
                            <MarkdownViewer content={initialContentMarkdown} />
                        </div>
                        
                        {/* 显示生成的核心DNA */}
                        <div>
                            <div className="flex justify-end mb-2">
                                <button onClick={() => copyToClipboard(content as string)} className="text-stone-500 hover:text-white flex items-center text-xs">
                                    <Copy size={14} className="mr-1" /> 复制核心DNA
                                </button>
                            </div>
                            <MarkdownViewer content={cleanCodeBlock(content as string)} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-stone-500 opacity-50">
                        <BookOpen size={64} className="mb-4" />
                        <p>点击上方“生成”按钮开始构建</p>
                    </div>
                )}
            </div>

            {/* Next Step Button */}
            {currentStep < STEPS.length - 1 && content && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 hover:shadow-xl"
                    >
                        下一步：{STEPS[currentStep + 1].title}
                    </button>
                </div>
            )}
        </div>
    );
}
```

## 预期效果
- ✅ 核心DNA页面将首先显示创作初始化中输入的内容
- ✅ 然后显示生成的核心DNA
- ✅ 两者都使用Markdown格式，保持一致的视觉风格
- ✅ 用户可以清晰地看到核心DNA是基于哪些初始输入生成的
- ✅ 保持与其他步骤一致的交互体验

这个修复将恢复之前添加的显示创作初始化内容的功能，提升用户体验，让用户能够清楚地看到核心DNA是基于哪些初始输入生成的。