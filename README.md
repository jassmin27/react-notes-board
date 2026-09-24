# Notes Board

A CRUD notes app built with React and Supabase.

Create, edit, delete, search and filter tagged notes with Supabase persistence, async request handling, and tested user flows.

Live demo: https://react-notes-board.vercel.app/

## Preview

![Notes Board preview](src/assets/preview.png)

## Features

- Add, edit and delete notes
- Add optional tags to notes
- Search notes by title or content
- Filter notes by tags
- Persist notes using Supabase
- Debounced search
- Loading, error and retry states
- Request cancellation to prevent stale requests
- Feedback for create, update and delete operations
- Cancel editing without changing the original note
- Built with accessibility in mind

## React Patterns Used

- Component-based UI structure
- Props for component communication
- Controlled form inputs
- State management with hooks
- Derived state for search and filters
- `useEffect` for data fetching and debounced search
- `useRef` for scrolling to the edit form
- Conditional rendering for loading, error, search and status states
- Logic separated into dedicated utilities and services

## Tech Stack

- React
- JavaScript
- Supabase
- HTML
- CSS
- Vite
- Vitest
- React Testing Library
- jest-dom
- user-event
- lucide-react

## Testing

Tests cover key user behaviours including:

- Creating notes
- Editing notes
- Deleting notes
- Searching and filtering
- Loading and error states
- Supabase interactions using mocked requests

## Getting Started

```bash
npm install
npm run dev
```

Run tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

## Project Status

The current version includes the complete CRUD notes workflow with Supabase persistence, search and tag filtering, debounced search, loading and error handling, retries, request cancellation, accessibility, and test coverage for key user behaviours.

Future improvements include migrating the app to TypeScript.
