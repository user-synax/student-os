import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const folder = searchParams.get('folder');
    const limit = parseInt(searchParams.get('limit') || '50');

    const filter = { 
      userId: new mongoose.Types.ObjectId(session.user.id), 
      deletedAt: null 
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      filter.tags = tag;
    }

    if (folder && folder !== 'All') {
      filter.folder = folder;
    }

    const notes = await Note.find(filter)
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { title, content, tags, folder } = body;

    const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;

    const note = await Note.create({
      userId: session.user.id,
      title: title || 'Untitled',
      content: content || '',
      tags: tags || [],
      folder: folder || 'General',
      wordCount
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
