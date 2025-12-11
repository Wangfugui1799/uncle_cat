**问题分析**：
在WritingStep.tsx文件中，fetchMatchedThemes函数尝试从AI获取匹配的主题，并将返回结果解析为JSON。但AI返回的内容不是纯JSON格式，而是包含了一些前缀文本（如"Authentica..."），导致JSON解析失败，出现错误：`SyntaxError: Unexpected token 'A', "Authentica"... is not valid JSON`。

**修复方案**：

1. **增强JSON解析错误处理**：在fetchMatchedThemes函数中添加更健壮的错误处理机制
2. **改进JSON提取逻辑**：使用更可靠的方式从AI返回的文本中提取JSON内容
3. **添加默认值**：确保解析失败时应用仍能正常运行
4. **添加调试日志**：帮助追踪和调试问题

**修改点**：

* 文件：`components/WritingStep.tsx`

* 函数：`fetchMatchedThemes`

* 位置：第161-202行

**具体实现**：

1. 在JSON.parse周围添加更详细的错误处理
2. 改进JSON提取逻辑，处理AI返回的非纯JSON内容
3. 添加try-catch块包裹整个JSON处理过程
4. 确保解析失败时设置默认值，不影响应用正常运行

**预期效果**：

* 修复"Failed to fetch themes"错误

* 应用在JSON解析失败时仍能正常运行

* 提供更详细的错误日志，便于调试

* 增强应用的健壮性

