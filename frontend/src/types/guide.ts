export interface GuideHeading {
  id: string;
  text: string;
  level: number;
}

export interface GuideSection {
  id: string;
  title: string;
  content: string;
  headings: GuideHeading[];
}

export interface GuideSectionMetadata {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface SearchResult {
  sectionId: string;
  sectionTitle: string;
  headingId?: string;
  headingText?: string;
  excerpt: string;
  matchStart: number;
  matchEnd: number;
  score: number;
}
