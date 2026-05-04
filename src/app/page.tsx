'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Trash2, Upload } from 'lucide-react';
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

  useEffect(() => {
    setMounted(true);
    setCurrentUser(Cookies.get('userId') || 'user1');
    fetchDocs();
  }, []);

  if (!mounted) return null;

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

  const deleteDoc = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await fetch(`/api/docs/${id}`, { method: 'DELETE' });
      setDocs(docs.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete document', error);
    }
  };

  const ownedDocs = docs.filter(d => d.ownerId === currentUser);
  const sharedDocs = docs.filter(d => d.ownerId !== currentUser);

  const renderDocCard = (doc: Omit<Document, 'content'>, isOwned: boolean) => (
    <Link href={`/doc/${doc.id}`} key={doc.id} className="doc-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <FileText size={20} color={isOwned ? "var(--primary)" : "#28a745"} />
        <h3 style={{ margin: 0 }}>{doc.title || 'Untitled Document'}</h3>
      </div>
      <p>Opened {new Date(doc.updatedAt).toLocaleDateString()}</p>
      {isOwned ? (
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={(e) => deleteDoc(doc.id, e)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
            title="Delete document"
          >
            <Trash2 size={16} color="#dc3545" />
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 'auto', fontSize: '12px', color: '#666' }}>
          Shared by {doc.ownerId}
        </div>
      )}
    </Link>
  );

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '28px' }}>My Workspace</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
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
        <p style={{ marginTop: '40px', color: '#666' }}>Loading documents...</p>
      ) : (
        <>
          <h2 style={{ marginTop: '32px', fontSize: '20px', borderBottom: '1px solid var(--doc-border)', paddingBottom: '8px' }}>Owned Documents</h2>
          <div className="doc-list">
            {ownedDocs.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', color: '#666' }}>No documents owned.</p>
            ) : (
              ownedDocs.map(doc => renderDocCard(doc, true))
            )}
          </div>

          <h2 style={{ marginTop: '40px', fontSize: '20px', borderBottom: '1px solid var(--doc-border)', paddingBottom: '8px' }}>Shared With Me</h2>
          <div className="doc-list">
            {sharedDocs.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', color: '#666' }}>No shared documents.</p>
            ) : (
              sharedDocs.map(doc => renderDocCard(doc, false))
            )}
          </div>
        </>
      )}
    </div>
  );
}
