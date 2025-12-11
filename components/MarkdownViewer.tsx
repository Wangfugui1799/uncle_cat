import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
  compact?: boolean;
}

const MarkdownViewer: React.FC<Props> = ({ content, compact = false }) => {
  // 预处理内容，确保正确显示
  const processedContent = content
    // 修复可能的格式问题
    .replace(/\r\n/g, '\n')
    // 移除多余的空行
    .replace(/\n\s*\n/g, '\n\n')
    // 确保文本正确换行
    .trim();

  return (
    <div className={`prose prose-invert prose-stone max-w-none prose-headings:text-orange-200 prose-p:text-stone-300 prose-strong:text-white prose-ul:text-stone-300 ${compact ? 'text-xs' : 'text-base sm:text-lg'} break-words`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className={`${compact ? 'text-lg mt-3 mb-2' : 'text-xl sm:text-2xl mt-6 mb-4'} font-bold pb-2 border-b border-stone-700`} {...props} />,
          h2: ({ node, ...props }) => <h2 className={`${compact ? 'text-base mt-3 mb-2' : 'text-lg sm:text-xl mt-5 mb-3'} font-semibold text-orange-300`} {...props} />,
          h3: ({ node, ...props }) => <h3 className={`${compact ? 'text-sm mt-2 mb-1' : 'text-base sm:text-lg mt-4 mb-2'} font-semibold text-amber-300`} {...props} />,
          ul: ({ node, ...props }) => <ul className={`list-disc pl-5 ${compact ? 'my-1 space-y-0' : 'my-3 space-y-1'} text-stone-300 sm:pl-6`} {...props} />,
          ol: ({ node, ...props }) => <ol className={`list-decimal pl-5 ${compact ? 'my-1 space-y-0' : 'my-3 space-y-1'} text-stone-300 sm:pl-6`} {...props} />,
          li: ({ node, ...props }) => <li className={`${compact ? 'my-0.5' : 'my-1'} text-stone-300`} {...props} />,
          p: ({ node, ...props }) => <p className={`${compact ? 'my-1 leading-normal' : 'my-3 leading-relaxed'} text-stone-300`} {...props} />,
          strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
          em: ({ node, ...props }) => <em className="text-amber-300 italic" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className={`border-l-4 border-orange-500 pl-3 sm:pl-4 py-1 ${compact ? 'my-2' : 'my-4'} bg-stone-800/50 italic text-stone-400`} {...props} />,
          code: ({ node, ...props }) => <code className="bg-stone-800 text-rose-300 px-1 py-0.5 rounded text-sm font-mono" {...props} />,

          // Table styles
          table: ({ node, ...props }) => <div className={`overflow-x-auto ${compact ? 'my-2' : 'my-4'} border border-stone-700 rounded-lg`}><table className="min-w-full divide-y divide-stone-700 bg-stone-900/50" {...props} /></div>,
          thead: ({ node, ...props }) => <thead className="bg-stone-800" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="divide-y divide-stone-700" {...props} />,
          tr: ({ node, ...props }) => <tr className="hover:bg-stone-800/50 transition-colors" {...props} />,
          th: ({ node, ...props }) => <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-stone-300 uppercase tracking-wider border-b border-stone-700" {...props} />,
          td: ({ node, ...props }) => <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm text-stone-300 whitespace-pre-wrap" {...props} />,
          // 添加对span的处理，确保文本正确显示
          span: ({ node, ...props }) => <span className="inline-block" {...props} />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;