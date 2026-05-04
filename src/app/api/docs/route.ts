import { NextResponse } from 'next/server';
import { getAllDocuments, createDocument } from '@/lib/db';

export async function GET() {
  const docs = getAllDocuments();
  return NextResponse.json(docs);
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const doc = createDocument(title);
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
