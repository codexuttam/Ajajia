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
  List, ListOrdered, ChevronLeft, Save, Users, X
} from 'lucide-react';
import Cookies from 'js-cookie';

export default function DocumentEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [ownerId, setOwnerId] = useState('');
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareInput, setShareInput] = useState('');

  const currentUser = Cookies.get('userId') || 'user1';
  const isOwner = currentUser === ownerId;

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
          throw new Error('Document not found or forbidden');
        }
        return res.json();
      })
      .then(data => {
        setTitle(data.title);
        setOwnerId(data.ownerId);
        setSharedWith(data.sharedWith || []);
        if (editor && data.content) {
          editor.commands.setContent(data.content);
        }
      })
      .catch(console.error);
  }, [id, editor, router]);

  const saveDocument = useCallback(async (updates?: any) => {
    if (!editor) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/docs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: editor.getHTML(),
          ...(updates || {})
        }),
      });
      if (res.ok) {
        setLastSaved(new Date());
      }
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

  const handleShare = () => {
    if (!shareInput.trim()) return;
    if (sharedWith.includes(shareInput.trim())) return;
    
    const newSharedWith = [...sharedWith, shareInput.trim()];
    setSharedWith(newSharedWith);
    saveDocument({ sharedWith: newSharedWith });
    setShareInput('');
  };

  const removeShare = (userId: string) => {
    const newSharedWith = sharedWith.filter(u => u !== userId);
    setSharedWith(newSharedWith);
    saveDocument({ sharedWith: newSharedWith });
  };

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
          onBlur={() => saveDocument()}
          placeholder="Untitled Document"
          readOnly={!isOwner}
          style={{ opacity: isOwner ? 1 : 0.7 }}
        />
        
        {!isOwner && <span style={{ fontSize: '12px', background: '#e9ecef', padding: '2px 6px', borderRadius: '4px', color: '#495057' }}>View/Edit Shared</span>}

        {lastSaved && (
          <span className="status-text">
            {isSaving ? 'Saving...' : `Last saved at ${lastSaved.toLocaleTimeString()}`}
          </span>
        )}

        <div className="header-actions">
          {isOwner && (
            <button className="btn btn-secondary" onClick={() => setShowShareModal(true)}>
              <Users size={16} />
              Share
            </button>
          )}
          <button className="btn btn-primary" onClick={() => saveDocument()} disabled={isSaving}>
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Share Modal */}
      {showShareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--doc-bg)', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Share Document</h2>
              <button onClick={() => setShowShareModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Enter user ID (e.g., user2)" 
                value={shareInput}
                onChange={e => setShareInput(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--doc-border)' }}
              />
              <button className="btn btn-primary" onClick={handleShare}>Add</button>
            </div>

            <div>
              <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#666' }}>Shared with:</h3>
              {sharedWith.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#999' }}>Not shared with anyone yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {sharedWith.map(user => (
                    <li key={user} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      <span>{user}</span>
                      <button onClick={() => removeShare(user)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc3545' }}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

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
