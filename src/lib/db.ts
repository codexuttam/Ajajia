import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), '.data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface Document {
  id: string;
  title: string;
  content: string; // HTML string from TipTap
  createdAt: number;
  updatedAt: number;
}

function getFilePath(id: string) {
  return path.join(DATA_DIR, `${id}.json`);
}

export function getAllDocuments(): Omit<Document, 'content'>[] {
  const files = fs.readdirSync(DATA_DIR);
  const docs = files
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      const doc = JSON.parse(content) as Document;
      return {
        id: doc.id,
        title: doc.title,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });
  return docs.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getDocument(id: string): Document | null {
  const filePath = getFilePath(id);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export function createDocument(title: string): Document {
  const id = uuidv4();
  const doc: Document = {
    id,
    title,
    content: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  fs.writeFileSync(getFilePath(id), JSON.stringify(doc, null, 2));
  return doc;
}

export function updateDocument(id: string, updates: Partial<Document>): Document | null {
  const doc = getDocument(id);
  if (!doc) return null;

  const updatedDoc = {
    ...doc,
    ...updates,
    id, // ensure ID doesn't change
    updatedAt: Date.now(),
  };
  
  fs.writeFileSync(getFilePath(id), JSON.stringify(updatedDoc, null, 2));
  return updatedDoc;
}

export function deleteDocument(id: string): boolean {
  const filePath = getFilePath(id);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}
