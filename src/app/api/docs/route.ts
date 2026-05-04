import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllDocuments, createDocument } from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || 'user1';
  const docs = getAllDocuments(userId);
  return NextResponse.json(docs);
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value || 'user1';
    const { title, content } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const doc = createDocument(title, userId, content || '');
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
