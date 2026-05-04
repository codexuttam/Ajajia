# Project Architecture

## Overview
Ajaia Docs is a high-fidelity, real-time collaborative document editor built to replicate the Google Docs experience. It leverages modern web technologies to provide a seamless word-processing interface in the browser.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Editor Engine**: Tiptap (based on ProseMirror)
- **Styling**: Vanilla CSS with a focus on premium, page-based layouts.
- **Icons**: Lucide React
- **Email Service**: Nodemailer with SMTP (Gmail) for invitations.
- **Persistence**: RESTful API routes with a debounced auto-save mechanism.
- **State Management**: React Hooks (useState, useEffect, useCallback, useRef).

## Core Components
- **Dashboard**: A landing page for managing documents, displaying personalized workspaces (e.g., "Bob's Workspace").
- **Document Editor**: A multi-pane layout featuring:
    - **Sidebar**: Document structure and outline.
    - **Multi-row Header**: Document title, menu system (File, Edit, etc.), and sharing tools.
    - **Toolbar**: Context-aware formatting tools with active state highlighting.
    - **Ruler**: Visual layout guide for document width.
    - **Page View**: A centered, A4-styled document page with standard margins.

## Key Mechanisms
- **Debounced Auto-Save**: Syncs changes to the server 1.5 seconds after the user stops typing to optimize performance.
- **Dynamic Menu System**: Interactive dropdowns with keyboard shortcuts and functional commands (Undo, Redo, Delete, etc.).
- **File Import**: Reads local `.txt` and `.md` files using `FileReader` and converts them into editor content using `marked`.
