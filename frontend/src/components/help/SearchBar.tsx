import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/types/guide';

interface SearchBarProps {
  results: SearchResult[];
  onSearch: (query: string) => void;
  onResultSelect: (result: SearchResult) => void;
  className?: string;
}

function HighlightedExcerpt({
  excerpt,
  matchStart,
  matchEnd,
}: {
  excerpt: string;
  matchStart: number;
  matchEnd: number;
}) {
  if (matchStart < 0 || matchEnd <= matchStart) {
    return <span className="text-xs text-muted-foreground">{excerpt}</span>;
  }

  return (
    <span className="text-xs text-muted-foreground">
      {excerpt.slice(0, matchStart)}
      <mark className="bg-yellow-200 dark:bg-yellow-800 text-foreground rounded px-0.5">
        {excerpt.slice(matchStart, matchEnd)}
      </mark>
      {excerpt.slice(matchEnd)}
    </span>
  );
}

export function SearchBar({
  results,
  onSearch,
  onResultSelect,
  className,
}: SearchBarProps) {
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  }

  function handleClear() {
    setQuery('');
    setOpen(false);
    onSearch('');
  }

  function handleSelect(result: SearchResult) {
    setQuery('');
    setOpen(false);
    onResultSelect(result);
  }

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const showResults = open && query.trim().length > 0;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={handleChange}
          onFocus={() => query.trim() && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar en la guía..."
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No se encontraron resultados para "{query}"
            </p>
          ) : (
            <ul>
              {results.map((result, i) => (
                <li key={i}>
                  <button
                    onMouseDown={() => handleSelect(result)}
                    className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {result.sectionTitle}
                      {result.headingText &&
                        result.headingText !== result.sectionTitle && (
                          <span className="text-muted-foreground font-normal">
                            {' '}
                            › {result.headingText}
                          </span>
                        )}
                    </p>
                    <HighlightedExcerpt
                      excerpt={result.excerpt}
                      matchStart={result.matchStart}
                      matchEnd={result.matchEnd}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
