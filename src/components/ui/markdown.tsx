
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  children: string;
  className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ children, className }) => {
  return (
    <ReactMarkdown
      className={cn("prose dark:prose-invert max-w-none", className)}
      components={{
        h1: ({ node, ...props }) => (
          <h1 {...props} className="text-2xl font-bold mb-4 mt-6" />
        ),
        h2: ({ node, ...props }) => (
          <h2 {...props} className="text-xl font-bold mb-3 mt-5" />
        ),
        h3: ({ node, ...props }) => (
          <h3 {...props} className="text-lg font-bold mb-2 mt-4" />
        ),
        p: ({ node, ...props }) => (
          <p {...props} className="mb-4" />
        ),
        ul: ({ node, ...props }) => (
          <ul {...props} className="list-disc pl-6 mb-4" />
        ),
        ol: ({ node, ...props }) => (
          <ol {...props} className="list-decimal pl-6 mb-4" />
        ),
        li: ({ node, ...props }) => (
          <li {...props} className="mb-1" />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote {...props} className="border-l-4 border-muted pl-4 italic my-4" />
        ),
        code: ({ node, ...props }) => (
          <code {...props} className="bg-muted px-1 py-0.5 rounded text-sm" />
        ),
        pre: ({ node, ...props }) => (
          <pre {...props} className="bg-muted p-4 rounded-md overflow-x-auto my-4" />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
};
