import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const note = await Note.findOne({
      _id: id,
      userId: session.user.id,
      deletedAt: null
    }).lean();

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { title, content, tags, folder, isPinned } = body;

    const updates = { updatedAt: new Date() };

    if (title !== undefined) updates.title = title;
    if (content !== undefined) {
      updates.content = content;
      updates.wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    }
    if (tags !== undefined) updates.tags = tags;
    if (folder !== undefined) updates.folder = folder;
    if (isPinned !== undefined) updates.isPinned = isPinned;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      updates,
      { new: true }
    ).lean();

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    await Note.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { deletedAt: new Date() }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
