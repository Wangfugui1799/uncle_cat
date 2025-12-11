1. 修改handleSelectJudgeProposal函数，更明确地要求AI按照原始DNA的格式生成
2. 调整systemPrompt和userPrompt，确保AI理解需要保持的格式结构
3. 确保生成的DNA包含正确的标题和代码块格式
4. 重新构建项目并测试效果

修改点：

* App.tsx文件中的handleSelectJudgeProposal函数

预期效果：

* 判官审题重写的DNA格式与原始生成的DNA格式一致
* 包含正确的标题和代码块
* 遵循相同的DNA公式模板
* 显示效果统一
