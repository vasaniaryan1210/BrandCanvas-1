# Photo Collage Combination Maker

## Overview

A web application that generates all possible combinations of photo collages from uploaded images. Users can upload multiple photos (2-9), select how many images per collage, choose from various layout templates, and download all unique combinations as a ZIP file. The app features a Material Design aesthetic with dark/light theme support and real-time preview capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing
- Single-page application architecture with component-based design

**UI Component System**
- Shadcn UI component library with Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theme customization (dark/light mode support)
- Material Design-inspired visual language with custom color palette

**State Management**
- React hooks (useState, useEffect, useMemo) for local component state
- TanStack Query (React Query) for server state management and caching
- Custom hooks for reusable logic (useIsMobile, useToast)

**Key Features Implementation**
- Client-side image processing using Canvas API and html2canvas for collage generation
- JSZip for bundling multiple collages into downloadable ZIP files
- Drag-and-drop file upload with visual feedback
- Real-time collage preview with layout variations
- Combination calculator using factorial mathematics to display total collages

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for type-safe server-side development
- ESM module system for modern JavaScript imports
- Middleware-based request handling with custom logging

**Development Environment**
- Vite middleware integration for development mode with HMR
- Replit-specific plugins for runtime error handling and dev tools
- Separate development and production server configurations

**Storage Interface**
- Abstract storage interface (IStorage) for flexible data persistence
- In-memory storage implementation (MemStorage) for development
- Designed for future database integration (Drizzle ORM configured for PostgreSQL)

### Data Architecture

**Schema Design (Zod Validation)**
- `uploadedImageSchema`: Image metadata with labels (a, b, c, etc.)
- `collageSettingsSchema`: User configuration for images per collage and layout selection
- `textOverlaySchema`: Optional text overlay with position, color, and font size
- `generatedCollageSchema`: Combination metadata with image IDs and canvas data
- `collageLayouts`: Predefined layout templates organized by image count (2-9 images)

**Data Flow**
1. User uploads images → stored in-memory with generated labels
2. User selects settings → validates against schema
3. App calculates combinations → generates unique image groupings
4. Canvas rendering → creates visual collages for each combination
5. ZIP generation → bundles all collages for download

### External Dependencies

**UI & Component Libraries**
- Radix UI primitives (dialogs, dropdowns, tooltips, etc.) for accessible component foundation
- shadcn/ui component collection for pre-built, customizable UI elements
- lucide-react for consistent icon system
- class-variance-authority for variant-based component styling

**Image Processing & File Handling**
- html2canvas: Converts DOM elements to canvas for collage export
- JSZip: Creates ZIP archives of generated collages
- Browser File API for image upload and object URL management

**Form & Validation**
- react-hook-form with @hookform/resolvers for form state management
- Zod for runtime type validation and schema definition
- drizzle-zod for database schema to Zod schema conversion

**Database & ORM (Configured, Not Yet Implemented)**
- Drizzle ORM for type-safe database queries
- @neondatabase/serverless for PostgreSQL connection
- connect-pg-simple for session storage (when auth is added)
- Drizzle Kit for schema migrations

**Styling & Theming**
- Tailwind CSS with PostCSS for style processing
- Custom theme configuration with CSS variables
- Inter and JetBrains Mono fonts from Google Fonts
- Dark/light mode with localStorage persistence

**Development Tools**
- TypeScript for type safety across full stack
- Vite plugins for Replit integration (cartographer, dev banner, runtime errors)
- esbuild for server-side bundling in production

**Utility Libraries**
- clsx and tailwind-merge (via cn utility) for conditional class management
- date-fns for date manipulation
- nanoid for generating unique IDs