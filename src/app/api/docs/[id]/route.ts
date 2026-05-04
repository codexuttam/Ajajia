import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDocument, updateDocument, deleteDocument } from '@/lib/db';

async function checkAccess(id: string, requireOwner: boolean = false) {
  const doc = getDocument(id);
  if (!doc) return null;
  
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || 'user1';
  
  if (requireOwner) {
    if (doc.ownerId !== userId) return null;
  } else {
    if (doc.ownerId !== userId && !doc.sharedWith?.includes(userId)) return null;
  }
  
  return doc;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await checkAccess(id);
  if (!doc) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }
  return NextResponse.json(doc);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await checkAccess(id);
    if (!doc) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }
    
    const body = await request.json();
    const updatedDoc = updateDocument(id, body);
    return NextResponse.json(updatedDoc);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await checkAccess(id, true); // only owner can delete
  if (!doc) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }
  
  const success = deleteDocument(id);
  return new NextResponse(null, { status: 204 });
}
