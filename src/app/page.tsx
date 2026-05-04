'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Trash2, Upload, Users } from 'lucide-react';
import type { Document } from '@/lib/db';
import Cookies from 'js-cookie';
import { marked } from 'marked';

export default function Dashboard() {
  const [docs, setDocs] = useState<Omit<Document, 'content'>[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState('user1');
  const [mounted, setMounted] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/docs');
      const data = await res.json();
      setDocs(data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    setCurrentUser(Cookies.get('userId') || 'user1');
    fetchDocs();
  }, []);

  if (!mounted) return null;

  const createNewDoc = async (title = 'Untitled Document', content = '') => {
    try {
      const res = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const newDoc = await res.json();
      router.push(`/doc/${newDoc.id}`);
    } catch (error) {
      console.error('Failed to create document', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    let htmlContent = text;
    
    if (file.name.endsWith('.md')) {
      htmlContent = await marked.parse(text);
    } else {
      // simple txt to html
      htmlContent = text.split('\n').map(line => `<p>${line}</p>`).join('');
    }

    const title = file.name.replace(/\.[^/.]+$/, ""); // remove extension
    createNewDoc(title, htmlContent);
  };

  const deleteDoc = async (id: string) => {
    // Optimistically update the UI to make it feel instant and prevent multiple clicks
    setDocs(prevDocs => prevDocs.filter(d => d.id !== id));

    try {
      const res = await fetch(`/api/docs/${id}`, { 
        method: 'DELETE',
        credentials: 'same-origin'
      });
      
      if (!res.ok) {
        // If it failed on the server, we should probably fetch docs again to restore it
        console.error(`Failed to delete document: ${res.statusText}`);
        fetchDocs(); 
      }
    } catch (error) {
      console.error('Failed to delete document', error);
      fetchDocs();
    }
  };

  const ownedDocs = docs.filter(d => d.ownerId === currentUser);
  const sharedDocs = docs.filter(d => d.ownerId !== currentUser);

  const renderDocCard = (doc: Omit<Document, 'content'>, isOwned: boolean) => (
    <div 
      key={doc.id} 
      className="doc-card" 
      onClick={() => router.push(`/doc/${doc.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className={`icon-wrapper ${!isOwned ? 'shared' : ''}`} style={{ marginBottom: '12px' }}>
          {isOwned ? <FileText size={22} /> : <Users size={22} />}
        </div>
        
        {isOwned && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteDoc(doc.id);
            }}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', 
              padding: '8px', color: '#ef4444', transition: 'all 0.2s', 
              borderRadius: '8px', position: 'relative', zIndex: 10 
            }}
            title="Delete document"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      
      <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {doc.title || 'Untitled Document'}
      </h3>
      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
        Opened {new Date(doc.updatedAt).toLocaleDateString()}
      </p>
      
      {!isOwned && (
        <div style={{ marginTop: 'auto', fontSize: '13px', color: '#64748b', fontWeight: 500, paddingTop: '12px', borderTop: '1px solid var(--doc-border)' }}>
          Owner: {doc.ownerId}
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="hero-banner">
        <div>
          <h1>Ajaia Workspace</h1>
          <p style={{ color: 'var(--foreground)', opacity: 0.7, margin: 0, fontSize: '18px', fontWeight: 500 }}>Create, edit, and collaborate in real-time.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="file" 
            accept=".txt,.md" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
          />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} />
            Upload (.txt, .md)
          </button>
          <button className="btn btn-primary" onClick={() => createNewDoc()}>
            <Plus size={18} />
            New Document
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
          <p style={{ color: '#64748b', fontSize: '16px', fontWeight: 500, animation: 'pulse 1.5s infinite' }}>Loading workspace...</p>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>Owned Documents</h2>
          <div className="doc-list" style={{ marginBottom: '40px' }}>
            {ownedDocs.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'var(--card-bg)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid var(--doc-border)' }}>
                <FileText size={48} style={{ opacity: 0.3, marginBottom: '16px', color: 'var(--foreground)' }} />
                <p style={{ margin: 0, fontSize: '16px', color: '#64748b' }}>No documents owned yet. Create one to get started.</p>
              </div>
            ) : (
              ownedDocs.map(doc => renderDocCard(doc, true))
            )}
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>Shared With Me</h2>
          <div className="doc-list">
            {sharedDocs.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'var(--card-bg)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid var(--doc-border)' }}>
                <Users size={48} style={{ opacity: 0.3, marginBottom: '16px', color: 'var(--foreground)' }} />
                <p style={{ margin: 0, fontSize: '16px', color: '#64748b' }}>No shared documents available.</p>
              </div>
            ) : (
              sharedDocs.map(doc => renderDocCard(doc, false))
            )}
          </div>
        </>
      )}
    </div>
  );
}
