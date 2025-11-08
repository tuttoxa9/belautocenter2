'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Если нет контента, показываем заглушку
  if (!content) {
    return <div className={className}>Нет описания</div>
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{children}</h4>,
          h5: ({ children }) => <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{children}</h5>,
          h6: ({ children }) => <h6 className="text-sm font-medium text-slate-900 dark:text-white mb-2">{children}</h6>,
          p: ({ children }) => <p className="text-slate-700 dark:text-gray-300 mb-3 leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-800 dark:text-gray-200">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-slate-700 dark:text-gray-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-700 dark:text-gray-300">{children}</ol>,
          li: ({ children }) => <li className="text-slate-700 dark:text-gray-300">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 mb-3 bg-slate-50 dark:bg-gray-800 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-slate-100 dark:bg-gray-800 p-4 rounded-lg mb-3 overflow-x-auto">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="border-slate-300 dark:border-gray-700 my-4" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
