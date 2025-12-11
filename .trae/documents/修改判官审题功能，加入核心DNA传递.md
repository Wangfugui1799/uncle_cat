1. 修改handleJudge函数，将核心DNA加入到用户提示词中
2. 确保在核心DNA不存在时能正确处理
3. 检查并更新判官提示词模板，让AI能理解和处理核心DNA
4. 测试修改后的功能是否正常工作

修改点：

* App.tsx文件中的handleJudge函数

* 可能需要更新constants.ts中的PROMPTS.JUDGE模板

预期效果：

* 当核心DNA存在时，将其传递给AI用于评审

* AI能基于核心DNA提供更有针对性的重写建议

* 保持现有功能的兼容性，核心DNA不存在时仍能正常工作

