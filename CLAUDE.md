# Claude Development Configuration

This file contains important information for Claude Code to understand and work with the Asetta project effectively.

## Project Overview
Asetta is a student assessment management platform built with Next.js, React, TypeScript, and Firebase. It helps students track academic assessments, deadlines, and grades across semesters.

## /init
When working on this project, prioritize:
1. **User Experience**: Ensure all features are intuitive and cohesive
2. **Accessibility**: Maintain proper dark mode support and responsive design
3. **Data Consistency**: Ensure Firebase operations maintain data integrity
4. **Code Quality**: Follow existing TypeScript patterns and component structure

## Key Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

## Architecture
- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Database**: Firebase Firestore with real-time updates
- **Auth**: Firebase Authentication
- **Styling**: Tailwind CSS with custom dark theme variables
- **Rich Text**: Tiptap editor for notes functionality

## Important Patterns
- All components follow the existing dark theme pattern using CSS variables
- Firebase operations should include proper error handling
- Status updates trigger parent component refreshes via callbacks
- Local storage is used for user preferences (filters, sorting)

## Known Issues
- Filter dropdown should always be visible (not conditionally rendered)
- Assessment status needs "Missed" option added
- Ensure consistent spacing and visual hierarchy

## File Structure
- `/src/components/` - Reusable UI components
- `/src/types/` - TypeScript type definitions
- `/src/lib/` - Firebase and utility configurations
- `/src/utils/` - Helper functions
- `/src/contexts/` - React contexts (Auth, etc.)
- `/src/pages/` - Next.js pages and API routes

## Testing
Before committing changes:
1. Run `npm run lint` to check for code issues
2. Test in both light and dark modes
3. Verify responsive behavior on mobile
4. Check Firebase operations in browser dev tools

## ⚠️ CRITICAL RULE ⚠️
**NEVER commit or push code automatically. ONLY make file changes and let the user handle all git operations (add, commit, push). The user controls deployment timing and commit messages.**