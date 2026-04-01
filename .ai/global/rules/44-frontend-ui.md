# Frontend - UI Components

## shadcn/ui

- Use shadcn/ui components from `src/components/ui/`.
- Add new components with `npx shadcn@latest add <component>`.
- Do not modify shadcn/ui components directly; wrap them if customization needed.
- Follow Radix UI accessibility patterns.

## Styling

- Use Tailwind CSS utility classes for styling.
- Follow mobile-first responsive design approach.
- Use consistent spacing scale (4px base unit).
- Maintain color consistency using Tailwind theme colors.
- Avoid inline styles; prefer Tailwind classes.

## Forms

- Use Zod schemas for form validation.
- Show validation errors inline near form fields.
- Disable submit buttons during form submission.
- Clear forms after successful submission.
- Handle server-side validation errors gracefully.

## Accessibility

- Use semantic HTML elements.
- Include ARIA labels for interactive elements.
- Ensure keyboard navigation works for all interactive elements.
- Maintain sufficient color contrast ratios.
- Test with screen readers when possible.
