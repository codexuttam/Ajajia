import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createDocument, getDocument, updateDocument, deleteDocument, getAllDocuments } from './db';

const DATA_DIR = path.join(process.cwd(), '.data');

describe('Database Operations', () => {
  // Setup and teardown to ensure isolated tests
  beforeEach(() => {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up created files during test
    if (fs.existsSync(DATA_DIR)) {
      const files = fs.readdirSync(DATA_DIR);
      files.forEach(file => fs.unlinkSync(path.join(DATA_DIR, file)));
    }
  });

  it('should create and retrieve a document', () => {
    const doc = createDocument('Test Doc', 'user1', '<p>Hello</p>');
    expect(doc.id).toBeDefined();
    expect(doc.title).toBe('Test Doc');
    expect(doc.ownerId).toBe('user1');
    expect(doc.content).toBe('<p>Hello</p>');

    const retrieved = getDocument(doc.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Test Doc');
  });

  it('should update an existing document', () => {
    const doc = createDocument('Old Title', 'user1', '');
    const updated = updateDocument(doc.id, { title: 'New Title', content: '<p>Updated</p>' });
    
    expect(updated?.title).toBe('New Title');
    expect(updated?.content).toBe('<p>Updated</p>');

    const retrieved = getDocument(doc.id);
    expect(retrieved?.title).toBe('New Title');
  });

  it('should delete a document', () => {
    const doc = createDocument('To Delete', 'user1', '');
    expect(getDocument(doc.id)).not.toBeNull();

    const success = deleteDocument(doc.id);
    expect(success).toBe(true);
    expect(getDocument(doc.id)).toBeNull();
  });

  it('should filter documents by owner and shared logic', () => {
    const doc1 = createDocument('Doc 1', 'user1', '');
    const doc2 = createDocument('Doc 2', 'user2', '');
    
    updateDocument(doc2.id, { sharedWith: ['user1'] });

    const user1Docs = getAllDocuments('user1');
    expect(user1Docs.length).toBe(2); // Owns doc1, shared doc2

    const user2Docs = getAllDocuments('user2');
    expect(user2Docs.length).toBe(1); // Owns doc2, doc1 not shared
  });
});
