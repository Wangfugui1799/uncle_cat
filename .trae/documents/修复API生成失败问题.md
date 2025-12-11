**问题分析**：
根据错误信息和代码检查，问题是DeepSeek模型的max\_tokens值设置过大。错误信息显示：`Invalid max_tokens value, the valid range of max_tokens is [1, 8192]`，但代码中所有模型的max\_tokens都被硬编码为32768。

**修复方案**：

1. 修改`generateContent`函数，为不同模型设置合适的max\_tokens值
2. 为DeepSeek模型设置最大8192的max\_tokens
3. 保持其他模型的兼容性
4. 重新构建单页HTML文件

**修改点**：

* 文件：`services/apiService.ts`

* 函数：`generateContent`

* 位置：第54-81行的body构造部分

* 内容：根据模型类型动态设置max\_tokens值

**具体实现**：

* 对于DeepSeek模型，设置max\_tokens: 8192

* 对于Claude模型，保持32768

* 对于其他模型，根据模型特性设置合适的值

**预期效果**：

* API测试连接成功后，生成内容也能成功

* 不同模型使用各自合适的max\_tokens值

* 修复后重新构建的单页HTML能正常使用

