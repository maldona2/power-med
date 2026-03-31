import type { GuideSection, SearchResult } from '@/types/guide';

const EXCERPT_RADIUS = 80;

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
}

function buildExcerpt(text: string, index: number, query: string): string {
  const start = Math.max(0, index - EXCERPT_RADIUS);
  const end = Math.min(text.length, index + query.length + EXCERPT_RADIUS);
  let excerpt = text.slice(start, end);
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';
  return excerpt;
}

export function search(
  sections: GuideSection[],
  query: string
): SearchResult[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const section of sections) {
    const plainContent = stripMarkdown(section.content);
    const lowerContent = plainContent.toLowerCase();

    let score = 0;
    let matchIndex = lowerContent.indexOf(q);

    if (matchIndex === -1) continue;

    // Score: title match is worth more
    const titleMatch = section.title.toLowerCase().includes(q);
    if (titleMatch) score += 10;

    // Count occurrences for relevance
    let idx = 0;
    while ((idx = lowerContent.indexOf(q, idx)) !== -1) {
      score += 1;
      idx += q.length;
    }

    // Find the heading closest to the first match in the original content
    let headingId: string | undefined;
    let headingText: string | undefined;

    const lines = section.content.split('\n');
    let charCount = 0;
    let lastHeading: GuideHeading | undefined;

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const text = headingMatch[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        lastHeading = { id, text, level: headingMatch[1].length };
      }
      charCount += line.length + 1;
      if (charCount >= matchIndex && lastHeading) {
        headingId = lastHeading.id;
        headingText = lastHeading.text;
        break;
      }
    }

    const excerpt = buildExcerpt(plainContent, matchIndex, q);

    results.push({
      sectionId: section.id,
      sectionTitle: section.title,
      headingId,
      headingText,
      excerpt,
      matchStart: excerpt.toLowerCase().indexOf(q),
      matchEnd: excerpt.toLowerCase().indexOf(q) + q.length,
      score,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
