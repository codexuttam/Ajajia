# AI Workflow Note

## Overview
Ajaia Docs integrates AI capabilities directly into the writing experience, inspired by modern "Writing with Gemini" features.

## AI Implementation Strategy
The AI workflow is built around a persistent, non-intrusive "Gemini Bar" at the bottom of the editor. This interface allows users to trigger AI actions without leaving their current context.

### 1. UI Components
- **Floating Input Bar**: A sleek, bottom-aligned bar for prompting the AI.
- **Dedicated Gemini Menu**: A top-level menu providing quick access to common AI tasks (Summarize, Suggest Edits, Settings).
- **Interactive Buttons**: Integration with Lucide icons (Sparkles, Layout) for visual consistency.

### 2. Workflow Logic
- **Contextual Prompts**: The AI logic is designed to take the current editor content (HTML/Text) as context.
- **Streaming Responses**: The proposed architecture supports streaming text back from an AI provider into the Tiptap editor using `editor.commands.insertContent()`.
- **Refinement Cycle**: Users can highlight text and use the Gemini menu to refine specific sections (e.g., "Summarize selected text").

### 3. Future Integration
While the current version focuses on the UI/UX of AI interaction, the backend is prepared for integration with Google's Gemini API via Next.js server actions or API routes.
