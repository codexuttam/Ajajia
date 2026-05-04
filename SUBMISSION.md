# Project Submission: Ajaia Docs

This project is a high-fidelity Google Docs clone with collaborative features and AI integration UI.

## Included Features

### 1. Collaborative Editor
- **Rich-Text Support**: Bold, Italic, Underline, Color, Highlight, Headings, and Lists.
- **Table Support**: Insert and manage tables directly from the menu.
- **Page-Based Layout**: Centered A4 document view with a visual ruler and standard margins.
- **Auto-Save**: Debounced persistence to the backend.

### 2. Google Docs-Style Interface
- **Interactive Header**: Title editing, sharing modal, and multi-row layout.
- **Drop-down Menus**: Fully functional File, Edit, View, Insert, Format, Tools, and Gemini menus.
- **Toolbar**: Grouped tools with real-time "active" state highlighting.
- **Sidebar**: Document structure navigation.

### 3. File Management & Sharing
- **File Upload**: Support for importing `.txt` and `.md` files.
- **Real-Time Sharing**: Professional SMTP email invitation system.
- **Dynamic Workspaces**: Personalized dashboard based on user identity.
- **Document Management**: Create, Rename, and Delete documents with full confirmation flows.

### 4. AI Features
- **Gemini Bar**: Persistent AI prompt interface.
- **AI Menu**: Dedicated shortcuts for summarization and assistance.

## Technology Stack
- Next.js 16 (App Router)
- Tiptap (Rich-Text Engine)
- Lucide React (Icons)
- Nodemailer (SMTP/Gmail)
- marked (Markdown Parsing)
- js-cookie (Session Management)

## Project Structure
- `ARCHITECTURE.md`: Technical details and component breakdown.
- `AI_WORKFLOW.md`: Documentation of AI features and strategy.
- `/src/app/doc/[id]/page.tsx`: Core editor implementation.
- `/src/app/globals.css`: Comprehensive styling for the Google Docs UI.
- `/src/app/api/`: RESTful routes for document storage and email sharing.
