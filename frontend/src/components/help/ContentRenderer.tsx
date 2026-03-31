import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  return (
    <div
      className={cn('prose prose-sm max-w-none dark:prose-invert', className)}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');
            return (
              <h1
                id={id}
                className="scroll-mt-20 text-2xl font-bold tracking-tight text-foreground mb-4"
              >
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');
            return (
              <h2
                id={id}
                className="scroll-mt-20 text-xl font-semibold text-foreground mt-8 mb-3 border-b pb-2"
              >
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');
            return (
              <h3
                id={id}
                className="scroll-mt-20 text-lg font-semibold text-foreground mt-6 mb-2"
              >
                {children}
              </h3>
            );
          },
          p: ({ children }) => (
            <p className="text-muted-foreground leading-7 mb-4">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 ml-6 list-disc space-y-1 text-muted-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 ml-6 list-decimal space-y-1 text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          code: ({ children }) => (
            <code className="relative rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mt-4 border-l-4 border-primary pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
