import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ContentRenderer } from '@/components/help/ContentRenderer';
import { HelpSidebar } from '@/components/help/HelpSidebar';
import { SearchBar } from '@/components/help/SearchBar';
import { loadSection, getSectionMetadata } from '@/lib/guideContentService';
import { search } from '@/lib/searchService';
import type { GuideSection, SearchResult } from '@/types/guide';

export function HelpPage() {
  const { section: sectionParam } = useParams<{ section?: string }>();
  const navigate = useNavigate();

  const metadata = getSectionMetadata();
  const defaultSection = metadata[0]?.id ?? 'appointments';
  const activeSectionId = sectionParam ?? defaultSection;

  const [activeSection, setActiveSection] = React.useState<GuideSection | null>(
    null
  );
  const [allSections, setAllSections] = React.useState<GuideSection[]>([]);
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Load the active section
  React.useEffect(() => {
    setLoading(true);
    setError(null);
    loadSection(activeSectionId)
      .then((s) => {
        setActiveSection(s);
        setLoading(false);
        contentRef.current?.scrollTo({ top: 0 });
      })
      .catch(() => {
        setError('No se pudo cargar el contenido de esta sección.');
        setLoading(false);
      });
  }, [activeSectionId]);

  // Preload all sections for search
  React.useEffect(() => {
    Promise.all(metadata.map((m) => loadSection(m.id)))
      .then(setAllSections)
      .catch(() => {});
  }, []);

  function handleSectionSelect(id: string) {
    navigate(`/app/help/${id}`);
    setMobileNavOpen(false);
  }

  function handleSearch(query: string) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchResults(search(allSections, query));
  }

  function handleSearchResultSelect(result: SearchResult) {
    navigate(`/app/help/${result.sectionId}`);
    if (result.headingId) {
      setTimeout(() => {
        document
          .getElementById(result.headingId!)
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="size-6 text-primary shrink-0" />
        <div>
          <h1 className="text-xl font-bold leading-none">Guía de uso</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Todo lo que necesitas saber para usar la aplicación
          </p>
        </div>
        {/* Mobile nav toggle */}
        <Button
          variant="outline"
          size="icon"
          className="ml-auto md:hidden"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="size-4" />
        </Button>
      </div>

      {/* Search */}
      <SearchBar
        results={searchResults}
        onSearch={handleSearch}
        onResultSelect={handleSearchResultSelect}
        className="md:max-w-md"
      />

      {/* Main layout */}
      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <HelpSidebar
            sections={metadata}
            activeSectionId={activeSectionId}
            onSectionSelect={handleSectionSelect}
          />
        </aside>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto rounded-lg border bg-card p-6"
        >
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          )}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <X className="size-8 text-destructive" />
              <p className="text-muted-foreground">{error}</p>
            </div>
          )}
          {!loading && !error && activeSection && (
            <ContentRenderer content={activeSection.content} />
          )}
        </div>
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b px-4 py-4">
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="size-4" />
              Guía de uso
            </SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <HelpSidebar
              sections={metadata}
              activeSectionId={activeSectionId}
              onSectionSelect={handleSectionSelect}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
