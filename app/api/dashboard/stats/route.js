import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import Session from '@/models/Session';
import Task from '@/models/Task';
import User from '@/models/User';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = session.user.id;
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [
      totalNotes,
      focusResult,
      tasksCompletedToday,
      user
    ] = await Promise.all([
      Note.countDocuments({ userId, deletedAt: null }),
      Session.aggregate([
        { $match: { 
          userId: new mongoose.Types.ObjectId(userId), 
          completedAt: { $gte: startOfToday }, 
          type: 'focus' 
        }},
        { $group: { _id: null, total: { $sum: '$duration' } } }
      ]),
      Task.countDocuments({ 
        userId, 
        status: 'done', 
        completedAt: { $gte: startOfToday } 
      }),
      User.findById(userId).select('studyStreak longestStreak').lean()
    ]);

    const focusMinutesToday = focusResult[0]?.total || 0;
    const studyStreak = user?.studyStreak || 0;
    const longestStreak = user?.longestStreak || 0;

    return NextResponse.json({ 
      focusMinutesToday, 
      tasksCompletedToday, 
      totalNotes, 
      studyStreak, 
      longestStreak 
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
