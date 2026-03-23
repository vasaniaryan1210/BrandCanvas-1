# Design Guidelines: Photo Collage Combination Maker

## Design Approach: Material Design System with Creative Studio Aesthetic

**Rationale:** This productivity tool requires clear interaction feedback and efficient workflows while maintaining visual appeal for creative users. Material Design provides robust patterns for drag-and-drop, previews, and complex interactions, enhanced with studio-grade visual polish.

**Key Design Principles:**
- Immediate visual clarity of collage combinations and options
- Seamless drag-and-drop with clear affordances
- Real-time preview as the central focus
- Efficient workflow from upload to download

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: `220 25% 12%` (deep blue-gray)
- Surface: `220 20% 18%` (elevated cards/panels)
- Surface Variant: `220 15% 22%` (hover states)
- Primary Action: `210 100% 60%` (vibrant blue for CTAs)
- Primary Hover: `210 100% 55%`
- Success/Active: `142 76% 45%` (green for active selections)
- Text Primary: `220 15% 95%`
- Text Secondary: `220 10% 70%`
- Border: `220 15% 28%`

**Light Mode:**
- Background Base: `220 20% 98%`
- Surface: `0 0% 100%`
- Surface Variant: `220 15% 96%`
- Primary Action: `210 100% 50%`
- Text Primary: `220 25% 15%`
- Text Secondary: `220 15% 45%`

### B. Typography

**Font Stack:**
- Primary: 'Inter' (via Google Fonts CDN) - Clean, modern, readable
- Monospace: 'JetBrains Mono' (for combination labels like "a+b+c")

**Type Scale:**
- Hero/Page Title: 3xl (30px) / font-bold
- Section Headers: 2xl (24px) / font-semibold
- Card Titles: lg (18px) / font-medium
- Body Text: base (16px) / font-normal
- Labels/Captions: sm (14px) / font-medium
- Combination Names: sm (14px) / font-mono

### C. Layout System

**Spacing Units:** Use Tailwind units of **4, 6, 8, 12, 16, 24** for consistent rhythm
- Component padding: p-6 or p-8
- Section gaps: gap-8 or gap-12
- Card spacing: m-4
- Grid gutters: gap-6

**Layout Structure:**
- Header: Fixed top nav (h-16) with logo, mode toggle, help
- Main Workspace: Three-panel layout
  - Left Panel (w-80): Upload zone + image library with alphabetic labels
  - Center Panel (flex-1): Live collage preview (dominant focus)
  - Right Panel (w-96): Controls (collage settings, text customization, download)
- Responsive: Stack panels vertically on mobile (md:flex-row)

### D. Component Library

**1. Upload Zone**
- Large dashed border dropzone (min-h-64)
- Prominent upload icon (w-16 h-16) in center
- "Drag & Drop or Click to Upload" text
- File type badge showing "JPG, PNG (Max 9 images)"
- Uploaded thumbnails in grid (grid-cols-3 gap-3) with alphabetic overlay badges

**2. Image Library Cards**
- Thumbnail size: w-20 h-20 rounded-lg
- Alphabetic badge: Absolute positioned (top-1 left-1), bg-primary text-white, px-2 py-0.5 rounded-md text-xs font-bold
- Remove button: Top-right corner, opacity-0 group-hover:opacity-100 transition
- Selected state: border-2 border-primary shadow-lg shadow-primary/20

**3. Combination Settings Panel**
- Slider for "Images per Collage" (2-9) with large numeric display
- Combination calculator card: Shows "X unique collages will be generated" in highlighted box
- Layout template selector: Grid of 4-5 thumbnail previews per collage size
- Template thumbnails (w-24 h-24) with hover scale and border highlight

**4. Live Preview Canvas**
- Central focus with shadow-2xl elevation
- Aspect ratio: Square (1:1) or auto-adjust to template
- Zoom controls: Bottom-right floating buttons (+ / - / Fit)
- Preview border: 1px solid border color
- Loading skeleton when generating combinations

**5. Text Overlay Controls**
- Text input field with real-time preview update
- Color picker: Swatches grid + custom hex input
- Font size slider: 12px - 72px range with live preview
- Position controls: 9-point grid selector (top-left, center, bottom-right, etc.)
- Text preview card showing current settings

**6. Layout Template Gallery**
- Horizontal scrollable row of template previews
- Active template: border-2 border-primary shadow-lg
- Template names: "Grid 2x2", "Asymmetric Stack", "Polaroid Style", "Magazine Layout", "Creative Overlap"
- Hover state: scale-105 transition-transform

**7. Download Section**
- Combination preview list: Scrollable with collage names (a+b+c) and mini thumbnails
- Bulk download button: Large, prominent w-full py-4 with download icon
- Format selector: PNG / JPG toggle
- Quality slider for JPG (70-100%)
- Progress indicator during ZIP generation

**8. Navigation & Controls**
- Top nav: Logo left, Settings/Help icons right, theme toggle
- Breadcrumb: Upload → Configure → Preview → Download (shows current step)
- Action buttons: Primary (solid bg-primary), Secondary (outline), Destructive (bg-red-600)

### E. Interactions & Animations

**Micro-interactions (minimal, purposeful):**
- Drag feedback: Opacity-50 and dashed outline on dragged image
- Drop zones: Highlight with bg-primary/10 and border-primary-500 on drag-over
- Button hovers: Scale-105 for template selections only
- Preview updates: 200ms fade-in transition when collage changes
- Slider changes: Debounced updates to preview (300ms)
- Success states: Brief green pulse (500ms) on successful generation

**No animations for:** Navigation, text input, color picker, most button clicks

---

## Unique Feature Implementations

### Combination Visualization
- Display total combinations clearly: Large number with "collages will be generated" subtitle
- Preview first 6 combinations as thumbnail grid below settings
- "View All" expands to scrollable modal with all combination previews

### Alphabetic Labeling System
- Badge design: Circular or rounded-square, high contrast (white on primary)
- Consistent placement: Top-left corner of every thumbnail
- Font: font-bold, uppercase, 12px minimum

### Collage Naming Display
- Show name in monospace font below each preview
- Format: "a+b+c+d.png" with + signs as separators
- Copy name button on hover (clipboard icon)

### Live Preview Features
- Pan/Zoom controls for detailed inspection
- Toggle between all generated combinations with prev/next arrows
- Current combination indicator (e.g., "3 of 20")
- Text overlay visible with edit controls active

---

## Responsive Behavior

**Desktop (lg+):** Three-panel layout as described
**Tablet (md):** Stack panels vertically, maintain side-by-side for settings + preview
**Mobile (base):** Full stack, collapsible panels with accordion pattern, preview full-width

---

## Images

**Hero Section:** No traditional hero image. The app opens directly to the functional workspace. 

**Visual Assets:**
- Empty state illustration in upload zone (creative photography/collage themed graphic)
- Template preview mockups showing sample photo arrangements
- Help documentation screenshots for onboarding
- Use icon library: Heroicons for all UI icons (upload, download, settings, zoom, etc.)

This design creates a professional, efficient collage creation tool that prioritizes the preview experience while providing powerful combination-generation capabilities through clear, intuitive controls.