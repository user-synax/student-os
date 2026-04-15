import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
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
    const due = searchParams.get('due');
    const status = searchParams.get('status');

    const filter = { userId: session.user.id, deletedAt: null };

    if (due === 'today') {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      filter.dueDate = { $gte: startOfToday, $lt: endOfToday };
    }

    if (status) {
      filter.status = status;
    }

    const tasks = await Task.find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
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
    const { title, dueDate, priority, subject, description } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await Task.create({
      userId: session.user.id,
      title,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      subject: subject || '',
      description: description || ''
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
