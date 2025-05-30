// components/TailwindMarkdownTable.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from 'react-markdown';

interface MarkdownTableProps {
    markdownContent: string;
}

const MarkdownTable: React.FC<MarkdownTableProps> = ({ markdownContent }) => {
    const components: Components = {
        table: ({ node, ...props }) => (
            <div className="overflow-x-auto w-full my-4">
                <table className="w-full border-collapse bg-white text-left" {...props} />
            </div>
        ),
        thead: ({ node, ...props }) => (
            <thead className="bg-gray-100" {...props} />
        ),
        tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-gray-200" {...props} />
        ),
        tr: ({ node, ...props }) => (
            <tr className="hover:bg-gray-50" {...props} />
        ),
        th: ({ node, ...props }) => (
            <th className="px-6 py-3 border border-gray-200 font-medium text-gray-700" {...props} />
        ),
        td: ({ node, ...props }) => (
            <td className="px-6 py-4 border border-gray-200 text-gray-600" {...props} />
        ),
    };

    return (
        <ReactMarkdown
            components={components}
            remarkPlugins={[remarkGfm]}
        >
            {markdownContent}
        </ReactMarkdown>
    );
};

export default MarkdownTable;