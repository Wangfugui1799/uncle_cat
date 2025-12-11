import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, ChevronLeft, ChevronRight, Edit, ThumbsUp, Star, MinusCircle, Check, Download, Sparkles, Skull, MessageSquare, Zap, Eye, PenTool, FileText, GitMerge, Activity, X } from 'lucide-react';
import { UserInputs, GeneratedData, ApiConfig, ThemeMatch } from '../types';
import { THEME_MATCH_PROMPT, THEME_LIBRARY_CONTENT, PROMPTS } from '../constants';
import { generateContent, formatPrompt, cleanAIResponse } from '../services/apiService';
import MarkdownViewer from './MarkdownViewer';
import { useAlert } from './CustomAlert';

declare const __HIDE_PROMPT_MANAGEMENT__: boolean;

interface Props {
    inputs: UserInputs;
    generatedData: GeneratedData;
    onGenerate: (chapterNum: number, params: any, theme: any) => void;
    onRewrite: (chapterNum: number, content: string) => void;
    onUpdateChapterTitle: (chapterNum: number, title: string) => void;
    isGenerating: boolean;
    isSyncingContext: boolean;
    loadingMessage?: string; // New prop for specific status text
    copyToClipboard: (text: string) => void;
    apiConfig: ApiConfig;
    onEditPrompt: (key: string) => void;
    onSyncContext: (chapterNum: number) => void;
    onUpdateViewChapter: (chapterNum: number) => void;
    onUpdateSelectedTheme: (theme: any) => void;
    viewChapter: number;
    selectedTheme: any;
}

const WritingStep: React.FC<Props> = ({
    inputs,
    generatedData,
    onGenerate,
    onRewrite,
    onUpdateChapterTitle,
    isGenerating,
    isSyncingContext,
    loadingMessage,
    copyToClipboard,
    apiConfig,
    onEditPrompt,
    onSyncContext,
    onUpdateViewChapter,
    onUpdateSelectedTheme,
    viewChapter,
    selectedTheme
}) => {
    const { showAlert } = useAlert();
    const currentChapter = generatedData.chapters[viewChapter - 1];

    const [chapterParams, setChapterParams] = useState({
        title: '', role: '', purpose: '', suspense: '正常', foreshadowing: '', twist: '低', summary: ''
    });

    // 跟踪手动编辑过的章节标题
    const [manuallyEditedTitles, setManuallyEditedTitles] = useState<Set<number>>(new Set());

    const [userFeedback, setUserFeedback] = useState("");
    const [showFeedbackInput, setShowFeedbackInput] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isTitleEditing, setIsTitleEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState("");
    const [matchedThemes, setMatchedThemes] = useState<ThemeMatch[]>([]);
    const [isThemeGenerating, setIsThemeGenerating] = useState(false);

    const [demonCritique, setDemonCritique] = useState<string | null>(null);
    const [isDemonEditing, setIsDemonEditing] = useState(false);
    const [isCritiqueEditMode, setIsCritiqueEditMode] = useState(false);
    const [activeRewriteOption, setActiveRewriteOption] = useState<string | null>(null);
    const [isFeedbackEditing, setIsFeedbackEditing] = useState(false);
    // 控制右侧边栏显示/隐藏的状态
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    // 人性化改写功能状态
    const [isHumanizeRewriting, setIsHumanizeRewriting] = useState(false);
    const [humanizePrompt, setHumanizePrompt] = useState("");
    const [showHumanizeInput, setShowHumanizeInput] = useState(false);

    useEffect(() => {
        const existingTitle = generatedData.chapters[viewChapter - 1]?.title;
        const existingSummary = generatedData.chapters[viewChapter - 1]?.summary;

        if (generatedData.blueprint) {
            try {
                const blueprint = generatedData.blueprint;
                console.log(`[WritingStep] Processing blueprint for chapter ${viewChapter}`);
                
                // 增强鲁棒性：清理蓝图内容，移除可能的格式问题
                let cleanedBlueprint = blueprint
                    .replace(/\r\n/g, '\n') // 统一换行符
                    .trim();
                
                // 重新设计提取逻辑：使用分割方法而非正则匹配，更可靠处理章节边界
                // 1. 按章节标题分割蓝图，支持不同的章节标题格式
                const chapterSections = cleanedBlueprint.split(/###\s*第\d+章/);
                console.log(`[WritingStep] Split blueprint into ${chapterSections.length} sections`);
                
                // 2. 找到当前章节对应的部分（章节号从1开始，数组索引从1开始）
                if (chapterSections.length > viewChapter) {
                    // 获取当前章节内容，添加回章节标题前缀
                    const chapterContent = `### 第${viewChapter}章${chapterSections[viewChapter]}`;
                    console.log(`[WritingStep] Chapter ${viewChapter} blueprint content:`, chapterContent);
                    
                    // 3. 增强标题提取，支持多种格式
                    let extractedTitle = `第${viewChapter}章`;
                    
                    // 主要提取方式：针对"### 第X章 - 标题"格式
                    const titleLineMatch = chapterContent.match(/^###\s*第\d+章\s*[-:：\s]+(.+?)(?=\n|$)/m);
                    if (titleLineMatch) {
                        extractedTitle = titleLineMatch[1].trim()
                            .replace(/\*\*/g, '') // 清理加粗格式
                            .replace(/\*/g, '') // 清理斜体格式
                            .replace(/_/g, '') // 清理下划线格式
                            .trim();
                    } else {
                        // 备选提取方式1：从内容中查找标题行
                        const altTitleMatch = chapterContent.match(/第\d+章\s*[-:：\s]+(.+?)(?=\n|$)/m);
                        if (altTitleMatch) {
                            extractedTitle = altTitleMatch[1].trim()
                                .replace(/\*\*/g, '')
                                .replace(/\*/g, '')
                                .replace(/_/g, '')
                                .trim();
                        } else {
                            // 备选提取方式2：查找包含"标题"关键字的行
                            const keywordTitleMatch = chapterContent.match(/[\*_]*标题[\*_]*[:：]\s*([^\n]+)/i);
                            if (keywordTitleMatch) {
                                extractedTitle = keywordTitleMatch[1].trim()
                                    .replace(/\*\*/g, '')
                                    .replace(/\*/g, '')
                                    .replace(/_/g, '')
                                    .trim();
                            }
                        }
                    }
                    
                    // 增强容错：确保标题不为空
                    if (!extractedTitle || extractedTitle === `第${viewChapter}章`) {
                        console.log(`[WritingStep] Using default title for chapter ${viewChapter}`);
                    } else {
                        console.log(`[WritingStep] Successfully extracted title:`, extractedTitle);
                    }
                    
                    console.log(`[WritingStep] Extracted title:`, extractedTitle, `(titleLineMatch:`, titleLineMatch, `)`);
                    
                    // 4. 只有未手动编辑过的标题才从蓝图中提取
                    const title = manuallyEditedTitles.has(viewChapter)
                        ? (existingTitle || `第${viewChapter}章`)
                        : extractedTitle;
                    console.log(`[WritingStep] Final title (after manual edit check):`, title, `(manuallyEdited:`, manuallyEditedTitles.has(viewChapter), `)`);

                    // 5. 增强参数提取，添加更多容错机制
                    const extractField = (fieldName: string, defaultValue: string = '') => {
                        // 支持多种格式变体：加粗、斜体、无格式
                        const formats = [
                            new RegExp(`[\*_]*${fieldName}[\*_]*[:：]\s*([^\n]+)`, 'i'),
                            new RegExp(`${fieldName}\s*[:：]\s*([^\n]+)`, 'i'),
                            new RegExp(`[\*_]*${fieldName}[\*_]*\s*[-:]\s*([^\n]+)`, 'i')
                        ];
                        
                        for (const regex of formats) {
                            const match = chapterContent.match(regex);
                            if (match) {
                                let extractedContent = match[1].trim();
                                
                                // 清理Markdown格式：移除双星号、单星号、下划线等格式标记
                                extractedContent = extractedContent
                                    .replace(/\*\*/g, '') // 移除加粗格式
                                    .replace(/\*/g, '') // 移除斜体格式
                                    .replace(/_/g, '') // 移除下划线格式
                                    .trim(); // 再次清理首尾空格
                                
                                return extractedContent;
                            }
                        }
                        return defaultValue;
                    };
                    
                    const role = extractField('本章定位');
                    const purpose = extractField('核心作用');
                    const suspense = extractField('悬念密度', '正常');
                    const foreshadowing = extractField('伏笔操作');
                    
                    // 6. 提取认知颠覆，增强容错
                    let twist = '低';
                    const twistMatch = chapterContent.match(/[\*_]*认知颠覆[\*_]*[:：]\s*([^\n]+)/i);
                    if (twistMatch) {
                        let rawTwist = twistMatch[1];
                        
                        // 清理Markdown格式
                        rawTwist = rawTwist
                            .replace(/\*\*/g, '') // 清理加粗格式
                            .replace(/\*/g, '') // 清理斜体格式
                            .replace(/_/g, '') // 清理下划线格式
                            .trim();
                        
                        console.log(`[WritingStep] Raw twist value:`, rawTwist);
                        
                        // 支持多种星级格式变体
                        if (/★★★★★/.test(rawTwist)) twist = '极高';
                        else if (/★★★★/.test(rawTwist)) twist = '高';
                        else if (/★★★/.test(rawTwist)) twist = '中';
                        else if (/★★/.test(rawTwist)) twist = '低';
                        console.log(`[WritingStep] Final twist value:`, twist);
                    }
                    
                    // 7. 提取本章简述，增强多行内容处理
                    const summaryMatch = chapterContent.match(/[\*_]*本章简述[\*_]*[:：]\s*([\s\S]*?)(?=\n\s*###|$)/i);
                    let blueprintSummary = '';
                    if (summaryMatch) {
                        blueprintSummary = summaryMatch[1]
                            .trim()
                            .replace(/\*\*/g, '') // 清理加粗格式
                            .replace(/\*/g, '') // 清理斜体格式
                            .replace(/_/g, '') // 清理下划线格式
                            .replace(/\n\s*\n/g, '\n') // 移除多余空行
                            .replace(/^\s+|\s+$/g, ''); // 清理首尾空格
                    } else {
                        // 备选提取方式：查找包含"简述"或"简介"关键字的内容
                        const altSummaryMatch = chapterContent.match(/[\*_]*(本章简述|本章简介|简述|简介)[\*_]*[:：]\s*([\s\S]*?)(?=\n\s*[\*_]{2,}|$)/i);
                        if (altSummaryMatch) {
                            blueprintSummary = altSummaryMatch[2]
                                .trim()
                                .replace(/\*\*/g, '') // 清理加粗格式
                                .replace(/\*/g, '') // 清理斜体格式
                                .replace(/_/g, '') // 清理下划线格式
                                .replace(/\n\s*\n/g, '\n') // 移除多余空行
                                .replace(/^\s+|\s+$/g, ''); // 清理首尾空格
                        }
                    }
                    console.log(`[WritingStep] Extracted summary:`, blueprintSummary, `(summaryMatch:`, summaryMatch, `)`);

                    const summary = existingSummary || blueprintSummary;
                    
                    // 8. 准备最终参数
                    const finalParams = {
                        title,
                        role,
                        purpose,
                        suspense,
                        foreshadowing,
                        twist,
                        summary
                    };
                    
                    console.log(`[WritingStep] Final extracted params for chapter ${viewChapter}:`, finalParams);

                    setChapterParams(finalParams);
                } else {
                    console.log(`[WritingStep] No blueprint section found for chapter ${viewChapter}. Sections available: ${chapterSections.length - 1}`);
                    // 增强容错：使用现有数据或默认值
                    setChapterParams(prev => ({
                        ...prev,
                        title: existingTitle || `第${viewChapter}章`,
                        summary: existingSummary || ''
                    }));
                }
            } catch (error) {
                console.error(`[WritingStep] Error processing blueprint for chapter ${viewChapter}:`, error);
                // 增强容错：发生错误时使用现有数据或默认值
                setChapterParams({
                    title: existingTitle || `第${viewChapter}章`,
                    role: '', purpose: '', suspense: '正常', foreshadowing: '', twist: '低',
                    summary: existingSummary || ''
                });
            }
        } else {
            console.log(`[WritingStep] No blueprint available`);
            setChapterParams({
                title: existingTitle || `第${viewChapter}章`,
                role: '', purpose: '', suspense: '正常', foreshadowing: '', twist: '低',
                summary: existingSummary || ''
            });
        }

    }, [viewChapter, generatedData.blueprint, generatedData.chapters, manuallyEditedTitles]);

    const startEditing = () => {
        const currentTitle = chapterParams.title;
        if (currentTitle === `第${viewChapter}章`) {
            setTempTitle("");
        } else {
            setTempTitle(currentTitle);
        }
        setIsTitleEditing(true);
    };

    const fetchMatchedThemes = async () => {
        if (!chapterParams.title) return;

        setIsThemeGenerating(true);
        try {
            const prompt = formatPrompt(THEME_MATCH_PROMPT, {
                THEME_LIBRARY_CONTENT,
                chapterTitle: chapterParams.title,
                chapterSummary: chapterParams.summary || "暂无摘要",
                chapterPurpose: chapterParams.purpose || "推进剧情"
            });

            // 使用统一的generateContent函数，支持所有API提供商
            const text = await generateContent(prompt, "开始匹配题材", apiConfig);
            console.log("Raw theme match response:", text);

            let themes = [];
            try {
                // 首先尝试直接解析整个文本
                themes = JSON.parse(text);
            } catch (directParseError) {
                // 如果直接解析失败，尝试提取JSON部分
                try {
                    // 查找JSON数组的起始和结束位置
                    const start = text.indexOf('[');
                    const end = text.lastIndexOf(']');
                    if (start !== -1 && end !== -1) {
                        const jsonStr = text.substring(start, end + 1);
                        themes = JSON.parse(jsonStr);
                    } else {
                        // 如果没有找到完整的JSON数组，尝试查找JSON对象
                        const objStart = text.indexOf('{');
                        const objEnd = text.lastIndexOf('}');
                        if (objStart !== -1 && objEnd !== -1) {
                            const jsonStr = text.substring(objStart, objEnd + 1);
                            const singleTheme = JSON.parse(jsonStr);
                            themes = [singleTheme];
                        } else {
                            // 尝试清理文本，移除可能的Markdown格式
                            const cleanedText = text.replace(/```json|```/g, '').trim();
                            themes = JSON.parse(cleanedText);
                        }
                    }
                } catch (extractParseError) {
                    // 如果提取后解析仍然失败，尝试使用更严格的清理
                    try {
                        // 移除所有非JSON内容，只保留可能的JSON结构
                        const cleanedText = text.replace(/[^\[\]{}:,"'\w\s.-]/g, '');
                        themes = JSON.parse(cleanedText);
                    } catch (strictCleanError) {
                        // 如果所有尝试都失败，使用空数组
                        themes = [];
                        console.error("Failed to parse themes JSON after all attempts:", strictCleanError);
                        console.error("Raw text from AI:", text);
                    }
                }
            }
            
            // 确保themes是数组
            if (!Array.isArray(themes)) {
                themes = [];
            }
            
            setMatchedThemes(themes);
        } catch (e: any) {
            console.error("Failed to fetch themes:", e);
            // 优化错误处理，不影响正常创作流程
            console.error("Theme match error details:", {
                message: e.message,
                chapterTitle: chapterParams.title,
                chapterSummary: chapterParams.summary,
                apiProvider: apiConfig.provider
            });
            // 只在控制台显示错误，不在UI中弹出提示
            // showAlert(`题材匹配失败: ${e.message}`, "error");
            setMatchedThemes([]);
        } finally {
            setIsThemeGenerating(false);
        }
    };

    useEffect(() => {
        if (chapterParams.title) {
            fetchMatchedThemes();
        }
    }, [chapterParams.title, chapterParams.summary, viewChapter]);

    // 当章节蓝图更新时，重置所有手动编辑状态，允许重新从蓝图提取标题
    useEffect(() => {
        setManuallyEditedTitles(new Set());
    }, [generatedData.blueprint]);

    const downloadChapter = () => {
        if (!currentChapter) return;
        const element = document.createElement("a");
        const file = new Blob([currentChapter.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        const safeTitle = chapterParams.title || `Chapter-${viewChapter}`;
        element.download = `第${viewChapter}章 ${safeTitle}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const getActiveParams = () => {
        const effectiveTitle = chapterParams.title || `第${viewChapter}章`;
        return {
            ...chapterParams,
            title: effectiveTitle
        };
    };

    const handleDemonCritique = async () => {
        if (!currentChapter?.content) return;
        setIsDemonEditing(true);
        try {
            const systemPrompt = PROMPTS.DEMON_EDITOR;
            const userMessage = `请对以下章节进行魔鬼编辑点评：

${currentChapter.content}`;

            // 使用generateContent函数调用API，包含完整的错误处理和重试机制
            const text = await generateContent(systemPrompt, userMessage, apiConfig);
            setDemonCritique(text);
            setIsCritiqueEditMode(false);
        } catch (e: any) {
            showAlert("魔鬼编辑罢工了：" + e.message, "error");
        } finally {
            setIsDemonEditing(false);
        }
    };

    const handleApplyDemonRewrite = async (option: string) => {
        if (!currentChapter?.content || !demonCritique) return;
        setIsDemonEditing(true);
        setActiveRewriteOption(option);
        try {
            const prompt = formatPrompt(PROMPTS.DEMON_REWRITE_SPECIFIC, {
                selected_option: option,
                original_content: currentChapter.content,
                critique_content: demonCritique,
                chapter_title: chapterParams.title || `第${viewChapter}章`
            });

            // 使用generateContent函数调用API，包含完整的错误处理和重试机制
            const rawContent = await generateContent("", prompt, apiConfig);
            let newContent = cleanAIResponse(rawContent);

            const titleLineRegex = /^##\s*第.+?章.*$/m;
            newContent = newContent.replace(titleLineRegex, '').trim();

            if (newContent) {
                onRewrite(viewChapter, newContent);
                setDemonCritique(null);
            }
        } catch (e: any) {
            showAlert("重写失败：" + e.message, "error");
        } finally {
            setIsDemonEditing(false);
            setActiveRewriteOption(null);
        }
    };

    const handleUserFeedbackRewrite = async () => {
        if (!userFeedback.trim()) return;
        setIsFeedbackEditing(true);
        try {
            const prompt = formatPrompt(PROMPTS.USER_FEEDBACK_REWRITE, {
                chapter_title: chapterParams.title || `第${viewChapter}章`,
                chapter_purpose: chapterParams.purpose || '未设定',
                suspense_level: chapterParams.suspense,
                user_feedback: userFeedback
            });

            const fullPrompt = `${prompt}\n\n【当前章节草稿】\n${currentChapter?.content || '(无内容)'}`;

            // 使用generateContent函数调用API，包含完整的错误处理和重试机制
            const rawContent = await generateContent("", fullPrompt, apiConfig);
            let newContent = cleanAIResponse(rawContent);

            const titleLineRegex = /^##\s*第.+?章.*$/m;
            newContent = newContent.replace(titleLineRegex, '').trim();

            if (newContent) {
                onRewrite(viewChapter, newContent);
                setUserFeedback("");
                setShowFeedbackInput(false);
            }

        } catch (e: any) {
            showAlert("重写失败：" + e.message, "error");
        } finally {
            setIsFeedbackEditing(false);
        }
    };

    // 人性化改写处理函数
    const handleHumanizeRewrite = async () => {
        if (!currentChapter?.content) return;
        setIsHumanizeRewriting(true);
        try {
            // 构建人性化改写提示词
            const systemPrompt = "你是一位专业的中文编辑，擅长模仿给定范文的风格，将生硬的文本改写为更自然、流畅的中文文章。";
            const userPrompt = `请根据以下要求改写提供的文本：

### 要求：
1. 保持原文的核心内容和意思不变
2. 仔细分析并模仿范文的写作风格、语气、句式和用词特点
3. 将原文改写成与范文风格一致的自然流畅的中文表达
4. 保持适当的段落结构

### 范文：
${humanizePrompt || '无范文，仅需提升文字的自然度和流畅度'}

### 原文：
${currentChapter.content}

### 改写后的文本：`;

            // 使用generateContent函数调用API，包含完整的错误处理和重试机制
            const rawContent = await generateContent(systemPrompt, userPrompt, apiConfig);
            let newContent = cleanAIResponse(rawContent);

            const titleLineRegex = /^##\s*第.+?章.*$/m;
            newContent = newContent.replace(titleLineRegex, '').trim();

            if (newContent) {
                onRewrite(viewChapter, newContent);
                setHumanizePrompt("");
                setShowHumanizeInput(false);
            }

        } catch (e: any) {
            console.error("人性化改写失败：", e);
            showAlert("人性化改写失败：" + e.message, "error");
        } finally {
            setIsHumanizeRewriting(false);
        }
    };

    // 显示/隐藏人性化改写输入框
    const handleShowHumanizeInput = () => {
        setShowHumanizeInput(!showHumanizeInput);
    };

    // 取消人性化改写
    const handleCancelHumanize = () => {
        setShowHumanizeInput(false);
        setHumanizePrompt("");
    };

    const handleTitleSave = () => {
        setIsTitleEditing(false);
        const newTitle = tempTitle.trim() || `第${viewChapter}章`;
        setChapterParams(prev => ({ ...prev, title: newTitle }));
        onUpdateChapterTitle(viewChapter, newTitle);

        // 标记为手动编辑
        setManuallyEditedTitles(prev => {
            const newSet = new Set(prev);
            newSet.add(viewChapter);
            return newSet;
        });
    };

    const renderRecBadge = (level: string) => {
        if (level === 'highly_recommended') {
            return <span className="text-[10px] font-bold bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded flex items-center"><ThumbsUp size={10} className="mr-1" /> 强烈推荐</span>;
        } else if (level === 'recommended') {
            return <span className="text-[10px] font-bold bg-orange-900 text-orange-300 px-1.5 py-0.5 rounded flex items-center"><Star size={10} className="mr-1" /> 推荐</span>;
        } else if (level === 'not_recommended') {
            return <span className="text-[10px] font-bold bg-stone-700 text-stone-400 px-1.5 py-0.5 rounded flex items-center"><MinusCircle size={10} className="mr-1" /> 一般</span>;
        }
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-stone-900/50 rounded-xl overflow-hidden border border-stone-800">
            {/* Header */}
            <div className="p-4 border-b border-stone-800 bg-stone-900 flex flex-wrap justify-between items-center gap-3 shrink-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                        disabled={viewChapter === 1}
                        onClick={() => {
                            onUpdateViewChapter(viewChapter - 1);
                        }}
                        className="p-3 text-stone-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-stone-800 min-w-[40px] flex items-center justify-center"
                        type="button"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-mono font-bold text-orange-400 bg-orange-950 border border-orange-900 px-2 py-0.5 rounded">
                                第 {viewChapter} 章
                            </span>
                            {!isTitleEditing && (
                                <span className="text-xs text-stone-500 truncate max-w-[150px] md:max-w-xs">
                                    {chapterParams.role ? `定位: ${chapterParams.role}` : ''}
                                </span>
                            )}
                        </div>

                        {isTitleEditing ? (
                            <div className="flex items-center h-8">
                                <input
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    placeholder={`输入第${viewChapter}章标题...`}
                                    className="bg-stone-800 text-white text-sm px-2 py-1.5 rounded border border-stone-600 focus:border-orange-500 outline-none w-48 md:w-64"
                                    autoFocus
                                />
                                <button onClick={handleTitleSave} className="ml-2 text-emerald-400 hover:text-emerald-300 p-2 hover:bg-stone-800 rounded-lg" type="button"><Check size={16} /></button>
                            </div>
                        ) : (
                            <h2 className="font-bold text-base md:text-lg flex items-center cursor-pointer hover:text-orange-400 h-8" onClick={startEditing}>
                                {chapterParams.title === `第${viewChapter}章` ? <span className="text-stone-500 italic font-normal text-sm">点击输入标题...</span> : chapterParams.title}
                                <Edit size={12} className="ml-2 opacity-50" />
                            </h2>
                        )}
                    </div>
                    <button
                        disabled={viewChapter >= (inputs.numberOfChapters || 12)}
                        onClick={() => {
                            if (viewChapter < (inputs.numberOfChapters || 12)) {
                                const nextChapterNum = viewChapter + 1;
                                onUpdateViewChapter(nextChapterNum);
                                setDemonCritique(null);
                                setUserFeedback("");
                                setShowFeedbackInput(false);
                                setMatchedThemes([]);
                                onUpdateSelectedTheme(null);
                                setIsEditMode(false);
                            }
                        }}
                        className="p-3 text-stone-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-stone-800 ml-2 min-w-[40px] flex items-center justify-center"
                        type="button"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`p-3 rounded-lg transition-colors min-w-[40px] flex items-center justify-center ${isEditMode ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'}`}
                        title={isEditMode ? "切换到阅读模式" : "切换到编辑模式"}
                        type="button"
                    >
                        {isEditMode ? <Eye size={18} /> : <PenTool size={18} />}
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSyncContext(viewChapter);
                        }}
                        disabled={!currentChapter?.content || isGenerating || isSyncingContext}
                        className="p-3 bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-white rounded-lg transition-colors border border-amber-900/30 min-w-[40px] flex items-center justify-center"
                        title="状态更新"
                        type="button"
                    >
                        <Activity size={18} className={isSyncingContext ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={() => {
                            const params = getActiveParams();
                            onGenerate(viewChapter, params, selectedTheme);
                        }}
                        disabled={isGenerating}
                        className="p-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg hover:text-white transition-colors min-w-[40px] flex items-center justify-center"
                        title="重新生成"
                        type="button"
                    >
                        <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={downloadChapter}
                        disabled={!currentChapter?.content}
                        className="p-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg min-w-[40px] flex items-center justify-center"
                        title="下载章节"
                        type="button"
                    >
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Background Overlay for Mobile Panel */}
                {isRightPanelOpen && (
                    <div 
                        className="absolute inset-0 bg-black/50 z-10 lg:hidden"
                        onClick={() => setIsRightPanelOpen(false)}
                    />
                )}

                {/* Main Editor */}
                <div className="flex-1 overflow-hidden bg-stone-900 relative flex flex-col">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-orange-400 space-y-4 py-20">
                            <RefreshCw className="animate-spin w-10 h-10" />
                            <div className="text-center">
                                <p className="font-bold text-lg">{loadingMessage || `AI 正在${currentChapter?.content ? '重新' : ''}撰写 ${chapterParams.title || `第${viewChapter}章`}`}</p>
                                {!loadingMessage && (
                                    <p className="text-sm opacity-75 mt-1">
                                        {selectedTheme ? `正在应用 [${selectedTheme.name}] 构建情节...` : '正在构建场景、安排伏笔...'}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : !currentChapter?.content ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-stone-500 space-y-4 py-20">
                            <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center">
                                <Edit size={32} className="opacity-50" />
                            </div>
                            <p>本章暂无内容</p>
                            <button
                                onClick={() => onGenerate(viewChapter, getActiveParams(), selectedTheme)}
                                className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-orange-500/20"
                                type="button"
                            >
                                {selectedTheme ? (
                                    <span className="flex items-center">
                                        <Sparkles size={16} className="mr-2 text-amber-300" />
                                        使用【{selectedTheme.name}】生成
                                    </span>
                                ) : '开始生成'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 w-full h-full flex flex-col">
                            {isEditMode ? (
                                <textarea
                                    className="w-full flex-1 bg-transparent text-stone-300 leading-loose resize-none outline-none font-serif text-lg py-12 px-4 md:px-[calc(50%-20rem)] lg:px-[calc(50%-24rem)] border-none focus:ring-0 block custom-scrollbar"
                                    value={currentChapter.content}
                                    onChange={(e) => onRewrite(viewChapter, e.target.value)}
                                    placeholder="在此开始创作..."
                                    autoFocus
                                />
                            ) : (
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <div className="max-w-3xl mx-auto p-12">
                                        <MarkdownViewer content={currentChapter.content} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Panel Toggle Button */}
                    <button
                        onClick={() => setIsRightPanelOpen(true)}
                        className="absolute bottom-6 right-6 z-10 p-3 bg-orange-600 hover:bg-orange-500 text-white rounded-full shadow-lg transition-all transform hover:scale-110 lg:hidden"
                        title="显示工具面板"
                    >
                        <Zap size={20} />
                    </button>
                </div>

                {/* Right Tools Panel - Mobile Responsive */}
                <div className={`
                    w-full lg:w-80 bg-stone-900 border-l border-stone-800 flex flex-col shrink-0 h-full
                    lg:flex
                    fixed lg:relative
                    top-0 right-0 z-20
                    transform transition-transform duration-300 ease-in-out
                    ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                `}>
                    {/* Theme Recommendation */}
                    <div className="flex flex-col max-h-[40%] min-h-0 border-b border-stone-800">
                        <div className="p-4 border-b border-stone-800 shrink-0 bg-stone-900 sticky top-0 z-10 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-stone-400 uppercase flex items-center">
                                <Sparkles size={14} className="mr-2 text-amber-500" /> 题材公式推荐
                            </h3>
                            <div className="flex space-x-2">
                                {!__HIDE_PROMPT_MANAGEMENT__ && (
                                    <button
                                        onClick={() => onEditPrompt('THEME_MATCH_PROMPT')}
                                        className="text-stone-600 hover:text-white transition-colors"
                                        title="查看/编辑题材匹配提示词"
                                    >
                                        <FileText size={12} />
                                    </button>
                                )}
                                {/* Mobile Close Button */}
                                <button
                                    onClick={() => setIsRightPanelOpen(false)}
                                    className="text-stone-600 hover:text-white transition-colors lg:hidden"
                                    title="关闭工具面板"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {isThemeGenerating ? (
                                <div className="text-xs text-stone-500 animate-pulse">正在分析剧情匹配题材...</div>
                            ) : matchedThemes.length > 0 ? (
                                matchedThemes.map((theme) => (
                                    <div
                                        key={theme.code}
                                        onClick={() => onUpdateSelectedTheme(selectedTheme?.code === theme.code ? null : theme)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all text-xs ${selectedTheme?.code === theme.code
                                            ? 'bg-orange-900/30 border-orange-500 shadow-sm shadow-orange-500/20'
                                            : 'bg-stone-800/50 border-stone-700 hover:bg-stone-800 hover:border-stone-600'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`font-bold ${selectedTheme?.code === theme.code ? 'text-orange-300' : 'text-stone-300'}`}>
                                                {theme.name}
                                            </span>
                                            {renderRecBadge(theme.level)}
                                        </div>
                                        <p className="text-stone-400 leading-relaxed mb-2">{theme.desc}</p>

                                        {selectedTheme?.code === theme.code && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const params = getActiveParams();
                                                    onGenerate(viewChapter, params, theme);
                                                }}
                                                disabled={isGenerating}
                                                className={`w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded flex items-center justify-center transition-colors shadow-sm ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                type="button"
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <RefreshCw size={12} className="mr-1.5 animate-spin" /> 生成中...
                                                    </>
                                                ) : (
                                                    <>
                                                        <PenTool size={12} className="mr-1.5" /> 立即应用生成
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-stone-600 text-center py-4">暂无匹配题材</div>
                            )}
                        </div>
                    </div>

                    {/* Demon Editor & Tools */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-4 flex flex-col flex-1 min-h-0 space-y-4">
                            {/* Demon Editor Card */}
                            <div className={`bg-stone-800/30 rounded-lg border border-stone-700/50 transition-all duration-300 flex flex-col ${demonCritique ? 'flex-1 min-h-0' : 'shrink-0 p-3'}`}>
                                <div className={`flex items-center justify-between shrink-0 ${demonCritique ? 'p-3 border-b border-stone-700/50' : 'mb-2'}`}>
                                    <h3 className="text-xs font-bold text-red-400 flex items-center">
                                        <Skull size={14} className="mr-2" /> 魔鬼编辑审阅
                                    </h3>
                                    {!__HIDE_PROMPT_MANAGEMENT__ && (
                                            <button
                                                onClick={() => onEditPrompt('DEMON_EDITOR')}
                                                className="text-stone-600 hover:text-white transition-colors"
                                                title="查看/编辑魔鬼编辑提示词"
                                            >
                                                <FileText size={12} />
                                            </button>
                                        )}
                                </div>

                                {!demonCritique ? (
                                    <button
                                        onClick={handleDemonCritique}
                                        disabled={!currentChapter?.content || isDemonEditing}
                                        className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-300 text-xs rounded border border-red-900/50 transition-colors"
                                        type="button"
                                    >
                                        {isDemonEditing ? '审阅中...' : '召唤魔鬼编辑'}
                                    </button>
                                ) : (
                                    <div className="flex flex-col flex-1 min-h-0">
                                        {/* Scrollable Text Area */}
                                        <div className="flex-1 overflow-y-auto p-3 text-xs text-stone-400 bg-stone-950/50 custom-scrollbar">
                                            <MarkdownViewer content={demonCritique} compact />
                                        </div>

                                        {/* Buttons Pinned to Bottom */}
                                        <div className="p-3 border-t border-stone-700/50 bg-stone-900/50 shrink-0 space-y-2">
                                            <div className="flex justify-end mb-2">
                                                {!__HIDE_PROMPT_MANAGEMENT__ && (
                                                    <button
                                                        onClick={() => onEditPrompt('DEMON_REWRITE_SPECIFIC')}
                                                        className="text-[10px] text-stone-600 hover:text-white flex items-center transition-colors"
                                                        title="查看/编辑重写提示词"
                                                    >
                                                        <FileText size={10} className="mr-1" /> 重写提示词
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                <button
                                                    onClick={() => handleApplyDemonRewrite('安全润色')}
                                                    disabled={isDemonEditing}
                                                    className={`text-xs py-2 rounded flex items-center justify-center transition-all ${activeRewriteOption === '安全润色'
                                                        ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20'
                                                        : 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50'
                                                        } ${isDemonEditing && activeRewriteOption !== '安全润色' ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                    type="button"
                                                >
                                                    {activeRewriteOption === '安全润色' ? <RefreshCw size={12} className="mr-1.5 animate-spin" /> : <span className="mr-1.5">🛡️</span>}
                                                    {activeRewriteOption === '安全润色' ? '正在润色...' : '安全润色'}
                                                </button>

                                                <button
                                                    onClick={() => handleApplyDemonRewrite('激进重构')}
                                                    disabled={isDemonEditing}
                                                    className={`text-xs py-2 rounded flex items-center justify-center transition-all ${activeRewriteOption === '激进重构'
                                                        ? 'bg-amber-900 text-white shadow-lg shadow-amber-900/20'
                                                        : 'bg-amber-900/30 text-amber-300 hover:bg-amber-900/50'
                                                        } ${isDemonEditing && activeRewriteOption !== '激进重构' ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                    type="button"
                                                >
                                                    {activeRewriteOption === '激进重构' ? <RefreshCw size={12} className="mr-1.5 animate-spin" /> : <span className="mr-1.5">🔥</span>}
                                                    {activeRewriteOption === '激进重构' ? '正在重构...' : '激进重构'}
                                                </button>

                                                <button
                                                    onClick={() => handleApplyDemonRewrite('封神方案')}
                                                    disabled={isDemonEditing}
                                                    className={`text-xs py-2 rounded flex items-center justify-center transition-all border border-red-900/50 ${activeRewriteOption === '封神方案'
                                                        ? 'bg-red-900 text-white shadow-lg shadow-red-900/20'
                                                        : 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                                                        } ${isDemonEditing && activeRewriteOption !== '封神方案' ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                    type="button"
                                                >
                                                    {activeRewriteOption === '封神方案' ? <RefreshCw size={12} className="mr-1.5 animate-spin" /> : <span className="mr-1.5">🌟</span>}
                                                    {activeRewriteOption === '封神方案' ? '正在封神...' : '封神重写'}
                                                </button>
                                            </div>
                                            <button onClick={() => setDemonCritique(null)} className="w-full text-xs text-stone-500 hover:text-white" type="button">关闭审阅</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Feedback (Pinned to bottom of tools panel when not collapsed) */}
                            <div className="bg-stone-800/30 rounded-lg p-3 border border-stone-700/50 shrink-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold text-orange-400 flex items-center">
                                        <MessageSquare size={14} className="mr-2" /> 读者反馈模拟
                                    </h3>
                                    {!__HIDE_PROMPT_MANAGEMENT__ && (
                                            <button
                                                onClick={() => onEditPrompt('USER_FEEDBACK_REWRITE')}
                                                className="text-stone-600 hover:text-white transition-colors"
                                                title="查看/编辑反馈提示词"
                                            >
                                                <FileText size={12} />
                                            </button>
                                        )}
                                </div>
                                {!showFeedbackInput ? (
                                    <button
                                        onClick={() => setShowFeedbackInput(true)}
                                        className="w-full py-2 bg-orange-900/20 hover:bg-orange-900/40 text-orange-300 text-xs rounded border border-orange-900/50 transition-colors"
                                        type="button"
                                    >
                                        输入修改意见
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <textarea
                                            value={userFeedback}
                                            onChange={(e) => setUserFeedback(e.target.value)}
                                            placeholder="比如：这一段对话太尴尬了，改得自然点..."
                                            className="w-full h-20 bg-stone-950 border border-stone-700 rounded p-2 text-xs text-stone-300 resize-none outline-none focus:border-orange-500"
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleUserFeedbackRewrite}
                                                disabled={!userFeedback.trim() || isFeedbackEditing}
                                                className="flex-1 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-500 disabled:opacity-50 flex items-center justify-center gap-1"
                                                type="button"
                                            >
                                                {isFeedbackEditing ? (
                                                    <>
                                                        <RefreshCw size={12} className="animate-spin" />
                                                        修改中...
                                                    </>
                                                ) : (
                                                    "确认修改"
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setShowFeedbackInput(false)}
                                                className="px-2 py-1 bg-stone-700 text-stone-300 text-xs rounded hover:bg-stone-600"
                                                type="button"
                                            >
                                                取消
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Humanize Rewrite Feature */}
                            <div className="bg-stone-800/30 rounded-lg p-3 border border-stone-700/50 shrink-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold text-blue-400 flex items-center">
                                        <PenTool size={14} className="mr-2" /> 人性化改写
                                    </h3>
                                    {!__HIDE_PROMPT_MANAGEMENT__ && (
                                            <button
                                                onClick={() => onEditPrompt('HUMANIZE_REWRITE')}
                                                className="text-stone-600 hover:text-white transition-colors"
                                                title="查看/编辑人性化改写提示词"
                                            >
                                                <FileText size={12} />
                                            </button>
                                        )}
                                </div>
                                {!showHumanizeInput ? (
                                    <button
                                        onClick={handleShowHumanizeInput}
                                        className="w-full py-2 bg-blue-900/20 hover:bg-blue-900/40 text-blue-300 text-xs rounded border border-blue-900/50 transition-colors"
                                        type="button"
                                    >
                                        开始人性化改写
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <textarea
                                            value={humanizePrompt}
                                            onChange={(e) => setHumanizePrompt(e.target.value)}
                                            placeholder="请输入范文，AI将模仿其风格进行改写..."
                                            className="w-full h-20 bg-stone-950 border border-stone-700 rounded p-2 text-xs text-stone-300 resize-none outline-none focus:border-blue-500"
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleHumanizeRewrite}
                                                disabled={isHumanizeRewriting}
                                                className="flex-1 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-1"
                                                type="button"
                                            >
                                                {isHumanizeRewriting ? (
                                                    <>
                                                        <RefreshCw size={12} className="animate-spin" />
                                                        改写中...
                                                    </>
                                                ) : (
                                                    "确认改写"
                                                )}
                                            </button>
                                            <button
                                                onClick={handleCancelHumanize}
                                                className="px-2 py-1 bg-stone-700 text-stone-300 text-xs rounded hover:bg-stone-600"
                                                type="button"
                                            >
                                                取消
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WritingStep;