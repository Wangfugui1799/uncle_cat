1. 找到App.tsx文件中创作初始化页面的AI生成小说名称按钮
2. 在按钮的onClick处理函数开头添加API配置检查
3. 如果apiConfig.apiKey为空，调用setShowConfigModal(true)弹出配置窗口
4. 否则继续执行原有的生成逻辑
5. 确保检查逻辑与handleGenerateStep函数保持一致

