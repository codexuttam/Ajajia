'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { FontFamily } from '@tiptap/extension-font-family';
import { useEditor, EditorContent } from '@tiptap/react';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  Heading1, Heading2, Heading3, 
  List, ListOrdered, ChevronLeft, Save, Users, X, Mail, CheckCircle, AlertCircle, Loader,
  FileText, Plus, MoreVertical, Search, Undo, Redo, Printer, SpellCheck, Type, Highlighter, 
  Link as LinkIcon, Image, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  CheckSquare, MessageSquare, Mic, Sparkles, Send, Layout, ArrowUpRight
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
  const [shareStatus, setShareStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [shareStatusMsg, setShareStatusMsg] = useState('');

  const [currentUser, setCurrentUser] = useState('user1');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(Cookies.get('userId') || 'user1');
  }, []);

  const isOwner = currentUser === ownerId;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: () => {
      // Auto-save logic
    },
  });

  useEffect(() => {
    if (!mounted) return;
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

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleShare = async () => {
    const email = shareInput.trim();
    if (!email) return;
    if (!isValidEmail(email)) {
      setShareStatus('error');
      setShareStatusMsg('Please enter a valid email address.');
      return;
    }
    if (sharedWith.includes(email)) {
      setShareStatus('error');
      setShareStatusMsg('Already shared with this email.');
      return;
    }

    setShareStatus('sending');
    setShareStatusMsg('');

    const newSharedWith = [...sharedWith, email];
    setSharedWith(newSharedWith);
    saveDocument({ sharedWith: newSharedWith });

    try {
      const res = await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: email,
          docTitle: title,
          docId: id,
          sharedByUserId: currentUser,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setShareStatus('success');
      setShareStatusMsg(`Invite sent to ${email}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send email';
      setShareStatus('error');
      setShareStatusMsg(`Saved, but email failed: ${msg}`);
    }

    setShareInput('');
    setTimeout(() => { setShareStatus('idle'); setShareStatusMsg(''); }, 4000);
  };

  const removeShare = (userId: string) => {
    const newSharedWith = sharedWith.filter(u => u !== userId);
    setSharedWith(newSharedWith);
    saveDocument({ sharedWith: newSharedWith });
  };

  if (!editor) return null;

  return (
    <div className="editor-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <span style={{ fontSize: '18px', fontWeight: 600 }}>Document tabs</span>
          <Plus size={18} style={{ cursor: 'pointer' }} />
        </div>
        <div className="tab-list">
          <div className="tab-item active">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} className="tab-icon" />
              <span>Tab 1</span>
            </div>
            <MoreVertical size={14} />
          </div>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <p style={{ fontSize: '12px', color: '#5f6368', lineHeight: 1.5 }}>
            Headings you add to the document will appear here.
          </p>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button className="toolbar-btn-small" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <ChevronLeft size={16} />
            <span style={{ marginLeft: '8px' }}>Collapse sidebar</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="google-header">
          <div className="header-top">
            <div 
              style={{ cursor: 'pointer', padding: '8px', color: '#0b57d0' }}
              onClick={() => router.push('/')}
            >
              <FileText size={32} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  className="doc-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => saveDocument()}
                  placeholder="Untitled document"
                  readOnly={!isOwner}
                  style={{ 
                    fontSize: '18px', 
                    padding: '2px 8px', 
                    width: 'auto', 
                    minWidth: '100px',
                    fontWeight: 400
                  }}
                />
                <Sparkles size={16} style={{ color: '#0b57d0' }} />
              </div>
              
              <div className="menu-bar">
                <span className="menu-item">File</span>
                <span className="menu-item">Edit</span>
                <span className="menu-item">View</span>
                <span className="menu-item">Insert</span>
                <span className="menu-item">Format</span>
                <span className="menu-item">Tools</span>
                <span className="menu-item">Extensions</span>
                <span className="menu-item">Help</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <MessageSquare size={20} style={{ color: '#444746', cursor: 'pointer' }} />
                <Mic size={20} style={{ color: '#444746', cursor: 'pointer' }} />
              </div>
              
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowShareModal(true)}
                style={{ background: '#c2e7ff', border: 'none', borderRadius: '100px', padding: '8px 24px', gap: '8px', color: '#001d35' }}
              >
                <Users size={18} />
                Share
              </button>
              
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                {currentUser[0].toUpperCase()}
              </div>
            </div>
          </div>

          <div className="google-toolbar">
            <div className="toolbar-group">
              <button className="toolbar-btn-small" onClick={() => editor.chain().focus().undo().run()}><Undo size={16} /></button>
              <button className="toolbar-btn-small" onClick={() => editor.chain().focus().redo().run()}><Redo size={16} /></button>
              <button className="toolbar-btn-small"><Printer size={16} /></button>
              <button className="toolbar-btn-small"><SpellCheck size={16} /></button>
            </div>

            <div className="toolbar-group">
              <button className="toolbar-btn-small">100%</button>
            </div>

            <div className="toolbar-group">
              <select 
                className="toolbar-select"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'paragraph') editor.chain().focus().setParagraph().run();
                  else editor.chain().focus().toggleHeading({ level: parseInt(val) as any }).run();
                }}
                value={editor.isActive('heading', { level: 1 }) ? '1' : editor.isActive('heading', { level: 2 }) ? '2' : 'paragraph'}
              >
                <option value="paragraph">Normal text</option>
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
              </select>
            </div>

            <div className="toolbar-group">
              <select 
                className="toolbar-select"
                onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                value={editor.getAttributes('textStyle').fontFamily || 'Arial'}
              >
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
            </div>

            <div className="toolbar-group">
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`toolbar-btn-small ${editor.isActive('bold') ? 'active' : ''}`}><Bold size={16} /></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`toolbar-btn-small ${editor.isActive('italic') ? 'active' : ''}`}><Italic size={16} /></button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`toolbar-btn-small ${editor.isActive('underline') ? 'active' : ''}`}><UnderlineIcon size={16} /></button>
              <button className="toolbar-btn-small"><Type size={16} /></button>
              <button className="toolbar-btn-small"><Highlighter size={16} /></button>
            </div>

            <div className="toolbar-group">
              <button className="toolbar-btn-small"><LinkIcon size={16} /></button>
              <button className="toolbar-btn-small"><Image size={16} /></button>
            </div>

            <div className="toolbar-group">
              <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`toolbar-btn-small ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}><AlignLeft size={16} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`toolbar-btn-small ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}><AlignCenter size={16} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`toolbar-btn-small ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}><AlignRight size={16} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`toolbar-btn-small ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}><AlignJustify size={16} /></button>
            </div>

            <div className="toolbar-group">
              <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`toolbar-btn-small ${editor.isActive('bulletList') ? 'active' : ''}`}><List size={16} /></button>
              <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`toolbar-btn-small ${editor.isActive('orderedList') ? 'active' : ''}`}><ListOrdered size={16} /></button>
            </div>
          </div>
        </header>

        <div className="ruler-container">
          <div className="ruler-mark" style={{ left: '0%' }}>1</div>
          <div className="ruler-mark" style={{ left: '16.6%' }}>2</div>
          <div className="ruler-mark" style={{ left: '33.3%' }}>3</div>
          <div className="ruler-mark" style={{ left: '50%' }}>4</div>
          <div className="ruler-mark" style={{ left: '66.6%' }}>5</div>
          <div className="ruler-mark" style={{ left: '83.3%' }}>6</div>
          <div className="ruler-mark" style={{ left: '100%' }}>7</div>
        </div>

        <div className="page-container">
          <div className="google-page">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Gemini AI Bar */}
        <div className="gemini-bar">
          <Sparkles size={20} style={{ color: '#0b57d0' }} />
          <input 
            type="text" 
            className="gemini-input" 
            placeholder="Write with Gemini..." 
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Layout size={18} style={{ color: '#5f6368', cursor: 'pointer' }} />
            <div style={{ width: '1px', height: '20px', background: '#e0e0e0' }} />
            <ArrowUpRight size={18} style={{ color: '#5f6368', cursor: 'pointer' }} />
          </div>
        </div>
      </div>

      {/* Share Modal remains the same */}
      {showShareModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} style={{ color: 'var(--primary)' }} /> Share Document
              </h2>
              <button onClick={() => { setShowShareModal(false); setShareStatus('idle'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Enter the recipient&apos;s email — they&apos;ll get a link to this document.</p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--doc-border)', background: 'var(--background)' }}>
                <Mail size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <input 
                  type="email" 
                  placeholder="colleague@example.com" 
                  value={shareInput}
                  onChange={e => { setShareInput(e.target.value); setShareStatus('idle'); }}
                  onKeyDown={e => e.key === 'Enter' && handleShare()}
                  style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--foreground)', fontSize: '14px', width: '100%' }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleShare}
                disabled={shareStatus === 'sending'}
                style={{ minWidth: '80px' }}
              >
                {shareStatus === 'sending' ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Invite'}
              </button>
            </div>

            {shareStatusMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 500,
                background: shareStatus === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: shareStatus === 'success' ? '#10b981' : '#ef4444'
              }}>
                {shareStatus === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                {shareStatusMsg}
              </div>
            )}

            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>People with access</h3>
              {sharedWith.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Not shared with anyone yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {sharedWith.map(user => (
                    <li key={user} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', marginBottom: '6px', background: 'rgba(79,70,229,0.04)', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 700 }}>
                          {user[0].toUpperCase()}
                        </div>
                        <span style={{ color: 'var(--foreground)' }}>{user}</span>
                      </div>
                      <button onClick={() => removeShare(user)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 500, fontSize: '13px', padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
