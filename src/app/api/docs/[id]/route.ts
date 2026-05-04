import { NextResponse } from 'next/server';
import { getDocument, updateDocument, deleteDocument } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = getDocument(id);
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(doc);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const doc = updateDocument(id, body);
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const success = deleteDocument(id);
  if (!success) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
