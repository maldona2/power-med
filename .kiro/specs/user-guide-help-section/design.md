# Design Document: User Guide Help Section

## Overview

The User Guide Help Section provides comprehensive Spanish-language documentation to help users understand and effectively use the application's key features. This system includes a dedicated help page with navigation, search functionality, and contextual help links integrated throughout the application.

The design follows a content-first approach where guide content is stored as structured markdown files, enabling easy maintenance and updates without code changes. The system provides both a standalone help page accessible from the main navigation and contextual help links from each major module (Appointments, Patients, Profile).

### Key Design Goals

- Provide comprehensive Spanish-language documentation for all major features
- Enable quick access to relevant help content through search and navigation
- Support contextual help links from within each application module
- Allow easy content updates without requiring code changes or redeployment
- Ensure responsive design across mobile, tablet, and desktop devices
- Maintain consistency with existing application UI patterns

## Architecture

### High-Level Architecture

The help system consists of three main layers:

1. **Content Layer**: Markdown files organized by module, stored in `frontend/src/content/guide/`
2. **Service Layer**: Content loading, parsing, and search functionality
3. **Presentation Layer**: React components for displaying guide content with navigation and search

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  HelpPage    │  │  Navigation  │  │    Search    │  │
│  │  Component   │  │  Component   │  │  Component   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Content    │  │   Markdown   │  │    Search    │  │
│  │   Loader     │  │    Parser    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                     Content Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ appointments │  │   patients   │  │   profile    │  │
│  │     .md      │  │     .md      │  │     .md      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Content Organization

Guide content is organized by application module:

```
frontend/src/content/guide/
├── index.ts                 # Content registry and metadata
├── appointments.md          # Appointments module documentation
├── patients.md              # Patients module documentation
└── profile.md               # Profile module documentation
```

Each markdown file contains:
- Module overview
- Feature-specific sections with headings
- Step-by-step instructions
- Visual examples (screenshots or descriptions)
- Common workflows

### Routing Structure

The help system integrates into the existing routing structure:

- `/app/help` - Main help page with full navigation and search
- `/app/help/:section` - Direct link to specific section (e.g., `/app/help/appointments`)
- Contextual help links from each module open the help page with the relevant section pre-selected

## Components and Interfaces

### Component Hierarchy

```
HelpPage
├── HelpPageHeader
│   └── SearchBar
├── HelpPageLayout
│   ├── HelpSidebar
│   │   └── NavigationMenu
│   └── HelpContent
│       ├── ContentRenderer
│       └── TableOfContents
└── ContextualHelpButton (used in other pages)
```

### Core Components

#### HelpPage Component

Main container component for the help page.

```typescript
interface HelpPageProps {}

export function HelpPage(): JSX.Element
```

Responsibilities:
- Manages active section state
- Handles URL parameters for deep linking
- Coordinates between navigation, search, and content display
- Provides responsive layout switching (mobile/desktop)

#### HelpSidebar Component

Navigation sidebar for browsing guide sections.

```typescript
interface HelpSidebarProps {
  sections: GuideSection[];
  activeSection: string | null;
  onSectionSelect: (sectionId: string) => void;
  collapsed?: boolean;
}

export function HelpSidebar(props: HelpSidebarProps): JSX.Element
```

Responsibilities:
- Displays hierarchical navigation menu
- Highlights active section
- Supports collapsible behavior on mobile
- Provides visual indicators for section hierarchy

#### SearchBar Component

Search input and results display.

```typescript
interface SearchBarProps {
  onResultSelect: (sectionId: string, headingId?: string) => void;
}

export function SearchBar(props: SearchBarProps): JSX.Element
```

Responsibilities:
- Accepts user search queries
- Displays search results with highlighted matches
- Handles result selection and navigation
- Shows "no results" message when appropriate

#### ContentRenderer Component

Renders markdown content with proper styling.

```typescript
interface ContentRendererProps {
  content: string;
  sectionId: string;
}

export function ContentRenderer(props: ContentRendererProps): JSX.Element
```

Responsibilities:
- Parses markdown to React components
- Applies consistent styling to headings, lists, code blocks
- Handles image rendering
- Generates anchor links for headings

#### ContextualHelpButton Component

Small help button integrated into other pages.

```typescript
interface ContextualHelpButtonProps {
  section: 'appointments' | 'patients' | 'profile';
  variant?: 'icon' | 'button';
}

export function ContextualHelpButton(props: ContextualHelpButtonProps): JSX.Element
```

Responsibilities:
- Provides quick access to relevant help section
- Links to help page with section pre-selected
- Matches existing UI button styles
- Supports icon-only and button-with-text variants

### Service Interfaces

#### GuideContentService

Service for loading and managing guide content.

```typescript
interface GuideContentService {
  loadSection(sectionId: string): Promise<GuideSection>;
  loadAllSections(): Promise<GuideSection[]>;
  getSectionMetadata(): GuideSectionMetadata[];
}
```

#### SearchService

Service for searching guide content.

```typescript
interface SearchService {
  search(query: string): SearchResult[];
  indexContent(sections: GuideSection[]): void;
}

interface SearchResult {
  sectionId: string;
  sectionTitle: string;
  headingId?: string;
  headingText?: string;
  matchedText: string;
  score: number;
}
```

## Data Models

### GuideSection

Represents a complete guide section (one markdown file).

```typescript
interface GuideSection {
  id: string;                    // e.g., 'appointments', 'patients', 'profile'
  title: string;                 // e.g., 'Gestión de Turnos'
  icon: LucideIcon;              // Icon for navigation
  content: string;               // Raw markdown content
  headings: GuideHeading[];      // Extracted headings for TOC
  order: number;                 // Display order in navigation
}
```

### GuideHeading

Represents a heading within a guide section.

```typescript
interface GuideHeading {
  id: string;                    // Anchor ID (slugified heading text)
  text: string;                  // Heading text
  level: number;                 // Heading level (1-6)
  children: GuideHeading[];      // Nested headings
}
```

### GuideSectionMetadata

Lightweight metadata for navigation without loading full content.

```typescript
interface GuideSectionMetadata {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;           // Short description for navigation
  order: number;
}
```

### Content File Structure

Each markdown file follows this structure:

```markdown
# Section Title

Brief overview of the section.

## Feature Name

### How to [Action]

1. Step one
2. Step two
3. Step three

### Common Workflows

#### Workflow Name

Description and steps...

## Another Feature

...
```

### Content Registry

The `index.ts` file exports section metadata:

```typescript
// frontend/src/content/guide/index.ts
import { Calendar, Users, User } from 'lucide-react';
import type { GuideSectionMetadata } from '@/types/guide';

export const guideSections: GuideSectionMetadata[] = [
  {
    id: 'appointments',
    title: 'Gestión de Turnos',
    icon: Calendar,
    description: 'Aprende a crear, ver y gestionar turnos',
    order: 1,
  },
  {
    id: 'patients',
    title: 'Gestión de Pacientes',
    icon: Users,
    description: 'Aprende a gestionar registros de pacientes',
    order: 2,
  },
  {
    id: 'profile',
    title: 'Perfil y Configuración',
    icon: User,
    description: 'Configura tu perfil, tratamientos y suscripción',
    order: 3,
  },
];

// Dynamic imports for content
export async function loadSectionContent(sectionId: string): Promise<string> {
  const module = await import(`./${sectionId}.md?raw`);
  return module.default;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Navigation State Consistency

*For any* guide section selection (whether through navigation menu click, URL parameter, or contextual link), the system should display the corresponding content, highlight the active section in the navigation menu, and update the URL to reflect the current section.

**Validates: Requirements 3.3, 3.4, 3.5, 9.4**

### Property 2: Search Result Relevance

*For any* search query string, all returned search results should contain text that matches the query (case-insensitive), and the results should be ordered by relevance score.

**Validates: Requirements 4.2**

### Property 3: Search Result Highlighting

*For any* search result returned by the search function, the matched terms in the result preview text should be visually distinguished (highlighted) from non-matching text.

**Validates: Requirements 4.3**

## Error Handling

### Content Loading Errors

**Scenario**: Markdown file fails to load or parse

**Handling**:
- Display user-friendly error message: "No se pudo cargar el contenido de ayuda"
- Log error details to console for debugging
- Provide fallback UI with navigation still functional
- Show "Reintentar" button to retry loading

**Implementation**:
```typescript
try {
  const content = await loadSectionContent(sectionId);
  setContent(content);
} catch (error) {
  console.error('Failed to load guide content:', error);
  setError('No se pudo cargar el contenido de ayuda');
}
```

### Search Errors

**Scenario**: Search query is empty or contains only whitespace

**Handling**:
- Clear search results
- Do not display error message (empty state is valid)
- Show placeholder text in search input

**Scenario**: Search returns no results

**Handling**:
- Display message: "No se encontraron resultados para '[query]'"
- Suggest: "Intenta con otros términos de búsqueda"
- Do not show error styling (this is a valid state)

### Navigation Errors

**Scenario**: User navigates to invalid section ID via URL

**Handling**:
- Redirect to help page with first available section
- Display toast notification: "Sección no encontrada"
- Log warning to console

**Scenario**: No sections are available (content loading failed completely)

**Handling**:
- Display error state with message: "El contenido de ayuda no está disponible"
- Provide link to return to main application
- Log error to console

### Responsive Behavior

**Mobile Devices** (< 768px):
- Navigation sidebar collapses into a sheet/drawer
- Search bar remains in header
- Content takes full width
- Contextual help buttons use icon-only variant

**Tablet Devices** (768px - 1024px):
- Navigation sidebar visible but narrower
- Content area adjusts to remaining space
- Search bar in header
- Contextual help buttons show icon + text

**Desktop Devices** (> 1024px):
- Full navigation sidebar visible
- Content area with comfortable reading width
- Search bar in header
- Contextual help buttons show icon + text

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, content completeness, component rendering, and edge cases
- **Property tests**: Verify universal properties across all inputs (navigation behavior, search functionality)

### Unit Testing

Unit tests will focus on:

1. **Content Completeness**: Verify that each markdown file contains required sections
   - Test that appointments.md includes sections on list view, calendar view, creation, management
   - Test that patients.md includes sections on creation, search, detail viewing
   - Test that profile.md includes sections on treatments, calendar integration, working hours, subscriptions
   - Test that workflow examples are present (appointment creation, patient creation, treatment setup)

2. **Component Rendering**: Verify that components render correctly
   - Test that HelpPage renders without errors
   - Test that navigation menu displays all sections
   - Test that search bar accepts input
   - Test that contextual help buttons render on appropriate pages

3. **Edge Cases**: Verify handling of edge conditions
   - Test search with empty query
   - Test search with no results
   - Test navigation to invalid section ID
   - Test content loading failure

4. **Integration Points**: Verify integration with existing application
   - Test that /app/help route is accessible
   - Test that contextual help buttons link to correct sections
   - Test that help page matches application theme

### Property-Based Testing

Property tests will use **fast-check** (JavaScript property-based testing library) with minimum 100 iterations per test.

Each property test will be tagged with a comment referencing the design property:

```typescript
// Feature: user-guide-help-section, Property 1: Navigation State Consistency
test.prop([fc.constantFrom('appointments', 'patients', 'profile')])(
  'selecting any section updates navigation, content, and URL',
  (sectionId) => {
    // Test implementation
  }
);
```

Property tests will verify:

1. **Navigation State Consistency** (Property 1):
   - Generate random section selections
   - Verify content, navigation highlight, and URL all update consistently
   - Test via navigation menu, URL parameters, and contextual links

2. **Search Result Relevance** (Property 2):
   - Generate random search queries
   - Verify all results contain matching text
   - Verify results are ordered by relevance score

3. **Search Result Highlighting** (Property 3):
   - Generate random search queries that return results
   - Verify matched terms are highlighted in result preview
   - Verify highlighting markup is present and correct

### Test Organization

```
frontend/src/
├── components/
│   └── help/
│       ├── __tests__/
│       │   ├── HelpPage.test.tsx
│       │   ├── HelpSidebar.test.tsx
│       │   ├── SearchBar.test.tsx
│       │   ├── ContentRenderer.test.tsx
│       │   └── ContextualHelpButton.test.tsx
│       └── __tests__/
│           └── help.properties.test.tsx  # Property-based tests
├── content/
│   └── guide/
│       └── __tests__/
│           └── content-completeness.test.ts
└── lib/
    └── __tests__/
        ├── guideContentService.test.ts
        └── searchService.test.ts
```

### Testing Tools

- **Vitest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **fast-check**: Property-based testing
- **MSW** (Mock Service Worker): Mock content loading if needed

### Continuous Integration

All tests must pass before merging:
- Unit tests: 100% of tests must pass
- Property tests: All properties must hold for 100+ iterations
- Coverage target: 80% code coverage for new components
