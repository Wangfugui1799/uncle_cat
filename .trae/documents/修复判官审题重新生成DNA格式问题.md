# 修复判官审题重新生成DNA格式问题

## 问题分析
通过判官审题选择方案后重新生成的DNA格式与直接生成的不一致，主要原因是两个生成流程使用了不同的提示词模板和格式要求：

1. **直接生成（handleGenerateStep）**：
   - 使用 `PROMPTS.DNA` 模板
   - 模板包含严格的输出格式要求
   - 生成结果包含 `## 核心DNA (STORY_DNA)` 标题和特定格式

2. **判官审题重新生成（handleSelectJudgeProposal）**：
   - 使用自定义 systemPrompt
   - 对输出格式要求不够严格
   - 生成结果可能缺少标准格式
   - 没有使用 `cleanCodeBlock` 处理

## 修复方案

### 1. 统一DNA生成流程
修改 `handleSelectJudgeProposal` 函数，确保它生成的DNA格式与直接生成的一致：
- 使用 `PROMPTS.DNA` 模板生成DNA
- 确保生成结果包含标准的 `## 核心DNA (STORY_DNA)` 格式
- 对生成结果应用 `cleanCodeBlock` 处理

### 2. 优化提示词要求
在 `handleSelectJudgeProposal` 的用户提示词中添加更严格的格式要求：
- 明确要求输出包含 `## 核心DNA (STORY_DNA)` 标题
- 要求使用指定的DNA公式格式
- 确保生成结果可以直接使用

### 3. 统一数据处理
确保所有生成的DNA都经过相同的数据处理流程：
- 应用 `cleanCodeBlock` 函数移除代码块标记
- 确保格式一致

## 实现步骤

1. **修改 App.tsx**：
   - 更新 `handleSelectJudgeProposal` 函数
   - 使用 `PROMPTS.DNA` 模板生成DNA
   - 添加严格的格式要求
   - 对生成结果应用 `cleanCodeBlock` 处理

2. **验证修复**：
   - 运行构建命令确保没有错误
   - 测试判官审题重新生成DNA功能
   - 验证生成的DNA格式与直接生成的一致

## 预期效果
- 通过判官审题重新生成的DNA格式与直接生成的完全一致
- 都包含 `## 核心DNA (STORY_DNA)` 标题
- 都使用相同的DNA公式格式
- 都经过 `cleanCodeBlock` 处理
- 生成的内容都可以直接在核心DNA页面正常显示

## 文件修改
- `App.tsx`: 更新 `handleSelectJudgeProposal` 函数，统一DNA生成格式

## 实现代码示例
```typescript
const handleSelectJudgeProposal = async (proposalIndex: number) => {
    if (!judgeResult) return;

    setLoadingMessage(`正在根据方案${proposalIndex}重写DNA...`);
    setIsGenerating(true);
    try {
        // 使用PROMPTS.DNA模板生成DNA
        const template = customPrompts['DNA'] || PROMPTS.DNA;
        
        // 构建变量
        const variables = {
            novel_title: String(inputs.novelTitle || "未命名"),
            topic: String(inputs.topic || ""),
            genre: String(inputs.genre || ""),
            tone: String(inputs.tone || "未指定"),
            ending: String(inputs.ending || "未指定"),
            perspective: String(inputs.perspective || "未指定"),
            number_of_chapters: String(inputs.numberOfChapters || 10),
            word_count: String(inputs.wordCount || 2000),
            custom_requirements: String(inputs.customRequirements || "无"),
            custom_instruction: `根据判官评审方案${proposalIndex}重写DNA：${judgeResult}`,
            STORY_DNA: String(generatedData.dna || "暂无核心DNA"),
            character_dynamics: String(generatedData.characters || "暂无角色设定"),
            world_building: String(generatedData.world || "暂无世界观设定"),
            plot_architecture: String(generatedData.plot || "暂无情节架构"),
            plot_structure: selectedPlotStructure
        };
        
        // 格式化提示词
        let prompt = template;
        prompt = prompt.replace(/{novel_title}/g, String(inputs.novelTitle || "未命名"));
        prompt = prompt.replace(/{topic}/g, String(inputs.topic || ""));
        prompt = prompt.replace(/{genre}/g, String(inputs.genre || ""));
        prompt = prompt.replace(/{tone}/g, String(inputs.tone || "未指定"));
        prompt = prompt.replace(/{ending}/g, String(inputs.ending || "未指定"));
        prompt = prompt.replace(/{perspective}/g, String(inputs.perspective || "未指定"));
        prompt = prompt.replace(/{number_of_chapters}/g, String(inputs.numberOfChapters || 10));
        prompt = prompt.replace(/{word_count}/g, String(inputs.wordCount || 2000));
        prompt = prompt.replace(/{custom_requirements}/g, String(inputs.customRequirements || "无"));
        prompt = prompt.replace(/{user_guidance}/g, String(inputs.customRequirements || "无"));
        prompt = prompt.replace(/{custom_instruction}/g, `根据判官评审方案${proposalIndex}重写DNA：${judgeResult}`);
        prompt = prompt.replace(/{STORY_DNA}/g, String(generatedData.dna || "暂无核心DNA"));
        prompt = prompt.replace(/{character_dynamics}/g, String(generatedData.characters || "暂无角色设定"));
        prompt = prompt.replace(/{world_building}/g, String(generatedData.world || "暂无世界观设定"));
        prompt = prompt.replace(/{plot_architecture}/g, String(generatedData.plot || "暂无情节架构"));
        prompt = prompt.replace(/{plot_structure}/g, selectedPlotStructure);
        
        // 生成新的DNA
        const newDNA = await generateContent(prompt, "开始生成任务", apiConfig);
        // 应用cleanCodeBlock处理，确保格式一致
        const cleanedDNA = cleanCodeBlock(newDNA);
        setGeneratedData(prev => ({ ...prev, dna: cleanedDNA }));
        alert(`已采纳方案${proposalIndex}并重写DNA`);
    } catch (error: any) {
        console.error('重写DNA失败:', error);
        alert('重写失败：' + error.message);
    } finally {
        setIsGenerating(false);
    }
};
```