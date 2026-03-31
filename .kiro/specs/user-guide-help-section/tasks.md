# Implementation Plan: User Guide Help Section

## Overview

This implementation plan breaks down the User Guide Help Section feature into discrete coding tasks. The approach follows a bottom-up strategy: first creating the content and type definitions, then building the service layer for content loading and search, followed by the presentation components, and finally integrating contextual help links and routing.

## Tasks

- [x] 1. Create guide content structure and markdown files
  - [x] 1.1 Create content directory structure and index file
    - Create `frontend/src/content/guide/` directory
    - Create `frontend/src/content/guide/index.ts` with section metadata and dynamic import function
    - Define section metadata for appointments, patients, and profile modules
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2_

  - [x] 1.2 Write appointments.md guide content in Spanish
    - Create `frontend/src/content/guide/appointments.md`
    - Include sections on list view, calendar view, appointment creation, editing, filtering, and session notes
    - Include complete workflow example for creating an appointment
    - _Requirements: 1.1, 1.2, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 10.1_

  - [x] 1.3 Write patients.md guide content in Spanish
    - Create `frontend/src/content/guide/patients.md`
    - Include sections on patient creation, search, detail viewing, editing, and list interface
    - Include complete workflow example for creating a patient and scheduling first appointment
    - _Requirements: 1.1, 1.3, 6.1, 6.2, 6.3, 6.4, 6.5, 10.2_

  - [x] 1.4 Write profile.md guide content in Spanish
    - Create `frontend/src/content/guide/profile.md`
    - Include sections on treatment catalog, calendar integration, working hours, appointment duration, and subscription plans
    - Include complete workflow example for setting up treatment catalog and assigning treatments
    - _Requirements: 1.1, 1.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 10.3_

  - [ ]* 1.5 Write unit tests for content completeness
    - Create `frontend/src/content/guide/__tests__/content-completeness.test.ts`
    - Test that each markdown file contains required sections
    - Test that workflow examples are present
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 2. Define TypeScript types and interfaces
  - [x] 2.1 Create guide type definitions
    - Create `frontend/src/types/guide.ts`
    - Define `GuideSection`, `GuideHeading`, `GuideSectionMetadata`, and `SearchResult` interfaces
    - _Requirements: 3.1, 4.1, 4.2_

- [x] 3. Implement service layer for content loading and search
  - [x] 3.1 Implement GuideContentService
    - Create `frontend/src/lib/guideContentService.ts`
    - Implement `loadSection`, `loadAllSections`, and `getSectionMetadata` functions
    - Parse markdown content and extract headings for table of contents
    - _Requirements: 1.1, 2.3, 3.3, 8.1, 8.2_

  - [ ]* 3.2 Write unit tests for GuideContentService
    - Create `frontend/src/lib/__tests__/guideContentService.test.ts`
    - Test content loading, heading extraction, and error handling
    - _Requirements: 2.3, 8.1, 8.2_

  - [x] 3.3 Implement SearchService
    - Create `frontend/src/lib/searchService.ts`
    - Implement `search` and `indexContent` functions
    - Support case-insensitive search with relevance scoring
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 3.4 Write unit tests for SearchService
    - Create `frontend/src/lib/__tests__/searchService.test.ts`
    - Test search functionality, empty queries, and no results scenarios
    - _Requirements: 4.1, 4.2, 4.4_

- [x] 4. Implement core help page components
  - [x] 4.1 Create ContentRenderer component
    - Create `frontend/src/components/help/ContentRenderer.tsx`
    - Parse markdown to React components using react-markdown or similar
    - Apply consistent styling to headings, lists, code blocks, and images
    - Generate anchor links for headings
    - _Requirements: 1.5, 1.6, 2.3_

  - [ ]* 4.2 Write unit tests for ContentRenderer
    - Create `frontend/src/components/help/__tests__/ContentRenderer.test.tsx`
    - Test markdown rendering and styling
    - _Requirements: 1.5, 2.3_

  - [x] 4.3 Create HelpSidebar component
    - Create `frontend/src/components/help/HelpSidebar.tsx`
    - Display hierarchical navigation menu with section metadata
    - Highlight active section
    - Support collapsible behavior for mobile
    - _Requirements: 2.4, 3.1, 3.2, 3.3, 3.4_

  - [ ]* 4.4 Write unit tests for HelpSidebar
    - Create `frontend/src/components/help/__tests__/HelpSidebar.test.tsx`
    - Test navigation rendering and active section highlighting
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 4.5 Create SearchBar component
    - Create `frontend/src/components/help/SearchBar.tsx`
    - Implement search input with debouncing
    - Display search results with highlighted matches
    - Handle result selection and navigation
    - Show "no results" message when appropriate
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 4.6 Write unit tests for SearchBar
    - Create `frontend/src/components/help/__tests__/SearchBar.test.tsx`
    - Test search input, results display, and no results message
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement main HelpPage component and layout
  - [x] 6.1 Create HelpPage component
    - Create `frontend/src/pages/HelpPage.tsx`
    - Manage active section state and URL parameters for deep linking
    - Coordinate between navigation, search, and content display
    - Implement responsive layout switching (mobile/desktop)
    - Handle content loading and error states
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.3, 3.5_

  - [ ]* 6.2 Write unit tests for HelpPage
    - Create `frontend/src/pages/__tests__/HelpPage.test.tsx`
    - Test page rendering, section selection, and error handling
    - _Requirements: 2.1, 2.3, 2.4, 3.3, 3.5_

  - [ ]* 6.3 Write property test for navigation state consistency
    - Create `frontend/src/components/help/__tests__/help.properties.test.tsx`
    - **Property 1: Navigation State Consistency**
    - **Validates: Requirements 3.3, 3.4, 3.5, 9.4**
    - Test that selecting any section updates navigation, content, and URL consistently

  - [ ]* 6.4 Write property test for search result relevance
    - Add to `frontend/src/components/help/__tests__/help.properties.test.tsx`
    - **Property 2: Search Result Relevance**
    - **Validates: Requirements 4.2**
    - Test that all search results contain matching text and are ordered by relevance

  - [ ]* 6.5 Write property test for search result highlighting
    - Add to `frontend/src/components/help/__tests__/help.properties.test.tsx`
    - **Property 3: Search Result Highlighting**
    - **Validates: Requirements 4.3**
    - Test that matched terms are highlighted in search result previews

- [x] 7. Implement contextual help integration
  - [x] 7.1 Create ContextualHelpButton component
    - Create `frontend/src/components/help/ContextualHelpButton.tsx`
    - Support icon-only and button-with-text variants
    - Link to help page with section pre-selected
    - Match existing UI button styles
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 7.2 Write unit tests for ContextualHelpButton
    - Create `frontend/src/components/help/__tests__/ContextualHelpButton.test.tsx`
    - Test button rendering and linking behavior
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 7.3 Integrate ContextualHelpButton into AppointmentsPage
    - Add ContextualHelpButton to `frontend/src/pages/AppointmentsPage.tsx`
    - Link to appointments section of guide
    - _Requirements: 9.1, 9.4_

  - [x] 7.4 Integrate ContextualHelpButton into PatientsPage
    - Add ContextualHelpButton to `frontend/src/pages/PatientsPage.tsx`
    - Link to patients section of guide
    - _Requirements: 9.2, 9.4_

  - [x] 7.5 Integrate ContextualHelpButton into ProfilePage
    - Add ContextualHelpButton to `frontend/src/pages/ProfilePage.tsx`
    - Link to profile section of guide
    - _Requirements: 9.3, 9.4_

- [x] 8. Set up routing and navigation integration
  - [x] 8.1 Add help page route to application router
    - Update `frontend/src/App.tsx` to include `/app/help` and `/app/help/:section` routes
    - Configure route to render HelpPage component
    - _Requirements: 2.1, 3.5_

  - [x] 8.2 Add help link to main navigation
    - Update main navigation component to include link to help page
    - Use appropriate icon (HelpCircle or BookOpen from lucide-react)
    - _Requirements: 2.1_

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- Content is stored as markdown files for easy maintenance without code changes
- All guide content is in Spanish as specified in requirements
