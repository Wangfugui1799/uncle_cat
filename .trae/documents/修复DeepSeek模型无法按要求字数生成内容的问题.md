### 修复章节蓝图提取问题

**问题分析**：
1. `useEffect` 依赖数组缺少 `manuallyEditedTitles` 状态，导致手动编辑状态变化时不会重新计算标题提取
2. UI 显示的是 `chapterParams.purpose`（核心作用），而不是 `chapterParams.role`（本章定位），与用户预期不符
3. 提取逻辑需要确保覆盖所有可能的蓝图格式

**修复方案**：

1. **完善依赖数组**：在 WritingStep.tsx 的 useEffect 钩子（第144行）中添加 `manuallyEditedTitles` 到依赖数组
2. **修正UI显示映射**：在第428行将显示的 `chapterParams.purpose` 改为 `chapterParams.role`，正确显示本章定位
3. **优化提取逻辑**：确保正则表达式能够处理各种可能的蓝图格式变体
4. **增强调试信息**：添加更多调试日志，帮助追踪提取过程

**文件修改**：
- `components/WritingStep.tsx`：修复 useEffect 依赖数组和 UI 显示逻辑

**预期效果**：
- 章节标题和本章定位能正确从蓝图中提取
- 手动编辑状态能正确影响提取逻辑
- UI 显示与用户预期一致，显示本章定位而非核心作用