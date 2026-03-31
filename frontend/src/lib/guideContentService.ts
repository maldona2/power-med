import { loadSectionContent, sectionMetadata } from '@/content/guide';
import type {
  GuideSection,
  GuideHeading,
  GuideSectionMetadata,
} from '@/types/guide';

function extractHeadings(markdown: string): GuideHeading[] {
  const headings: GuideHeading[] = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      headings.push({ id, text, level });
    }
  }

  return headings;
}

export async function loadSection(id: string): Promise<GuideSection> {
  const content = await loadSectionContent(id);
  const headings = extractHeadings(content);
  const meta = sectionMetadata.find((s) => s.id === id);

  return {
    id,
    title: meta?.title ?? id,
    content,
    headings,
  };
}

export async function loadAllSections(): Promise<GuideSection[]> {
  return Promise.all(sectionMetadata.map((meta) => loadSection(meta.id)));
}

export function getSectionMetadata(): GuideSectionMetadata[] {
  return sectionMetadata;
}
