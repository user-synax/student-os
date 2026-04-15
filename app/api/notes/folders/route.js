import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const folders = await Note.distinct('folder', { 
      userId: session.user.id, 
      deletedAt: null 
    });

    return NextResponse.json({ folders });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}
