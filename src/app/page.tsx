'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Trash2 } from 'lucide-react';
import type { Document } from '@/lib/db';

export default function Dashboard() {
  const [docs, setDocs] = useState<Omit<Document, 'content'>[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDocs();
  }, []);

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

  const createNewDoc = async () => {
    try {
      const res = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Document' })
      });
      const newDoc = await res.json();
      router.push(`/doc/${newDoc.id}`);
    } catch (error) {
      console.error('Failed to create document', error);
    }
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

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '28px' }}>Recent Documents</h1>
        <button className="btn btn-primary" onClick={createNewDoc}>
          <Plus size={18} />
          New Document
        </button>
      </div>

      {loading ? (
        <p style={{ marginTop: '40px', color: '#666' }}>Loading documents...</p>
      ) : (
        <div className="doc-list">
          {docs.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', marginTop: '40px' }}>
              No documents yet. Create one to get started!
            </p>
          ) : (
            docs.map(doc => (
              <Link href={`/doc/${doc.id}`} key={doc.id} className="doc-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <FileText size={20} color="var(--primary)" />
                  <h3 style={{ margin: 0 }}>{doc.title || 'Untitled Document'}</h3>
                </div>
                <p>Opened {new Date(doc.updatedAt).toLocaleDateString()}</p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={(e) => deleteDoc(doc.id, e)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                    title="Delete document"
                  >
                    <Trash2 size={16} color="#dc3545" />
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
