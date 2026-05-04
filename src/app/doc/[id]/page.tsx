'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useEditor, EditorContent } from '@tiptap/react';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  Heading1, Heading2, Heading3, 
  List, ListOrdered, ChevronLeft, Save
} from 'lucide-react';

export default function DocumentEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: '',
    immediatelyRender: false,
    onUpdate: () => {
      // Auto-save logic could go here
    },
  });

  useEffect(() => {
    // Load document
    fetch(`/api/docs/${id}`)
      .then(res => {
        if (!res.ok) {
          router.push('/');
          throw new Error('Document not found');
        }
        return res.json();
      })
      .then(data => {
        setTitle(data.title);
        if (editor && data.content) {
          editor.commands.setContent(data.content);
        }
      })
      .catch(console.error);
  }, [id, editor, router]);

  const saveDocument = useCallback(async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      await fetch(`/api/docs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: editor.getHTML(),
        }),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save', error);
    } finally {
      setIsSaving(false);
    }
  }, [id, title, editor]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveDocument();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveDocument]);

  if (!editor) return null;

  return (
    <div className="app-container">
      <header className="app-header">
        <button className="toolbar-btn" onClick={() => router.push('/')} title="Back to Dashboard">
          <ChevronLeft size={20} />
        </button>
        
        <input
          type="text"
          className="doc-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveDocument}
          placeholder="Untitled Document"
        />
        
        {lastSaved && (
          <span className="status-text">
            {isSaving ? 'Saving...' : `Last saved at ${lastSaved.toLocaleTimeString()}`}
          </span>
        )}

        <div className="header-actions">
          <button className="btn btn-primary" onClick={saveDocument} disabled={isSaving}>
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <div className="editor-toolbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
          title="Bold (Cmd+B)"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
          title="Italic (Cmd+I)"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
          title="Underline (Cmd+U)"
        >
          <UnderlineIcon size={18} />
        </button>

        <div className="toolbar-divider" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>

        <div className="toolbar-divider" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>
      </div>

      <div className="editor-container">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
