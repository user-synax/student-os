"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Plus, Timer, CheckCircle2, Flame, FileText, ArrowRight, ClipboardList, StickyNote, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ focusMinutesToday: 0, tasksCompletedToday: 0, totalNotes: 0, studyStreak: 0, longestStreak: 0 });
  const [todayTasks, setTodayTasks] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskDueDate, setQuickTaskDueDate] = useState("");
  const [quickTaskPriority, setQuickTaskPriority] = useState("medium");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getFullDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const relativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const priorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'done' ? 'todo' : 'done';
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTodayTasks(prev => prev.map(task => 
          task._id === taskId 
            ? { ...task, status: newStatus, completedAt: newStatus === 'done' ? new Date() : null }
            : task
        ));
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleQuickAddTask = async (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickTaskTitle,
          dueDate: quickTaskDueDate || null,
          priority: quickTaskPriority,
        }),
      });

      if (response.ok) {
        const { task } = await response.json();
        setQuickAddOpen(false);
        setQuickTaskTitle("");
        setQuickTaskDueDate("");
        setQuickTaskPriority("medium");
        toast.success("Task added!");

        // Refresh today's tasks if due date is today
        if (!quickTaskDueDate || new Date(quickTaskDueDate).toDateString() === new Date().toDateString()) {
          const tasksResponse = await fetch('/api/tasks?due=today');
          if (tasksResponse.ok) {
            const { tasks } = await tasksResponse.json();
            setTodayTasks(tasks);
          }
        }
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error("Failed to add task");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await fetch('/api/dashboard/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        setStatsLoading(false);

        // Fetch today's tasks
        const tasksRes = await fetch('/api/tasks?due=today');
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTodayTasks(tasksData.tasks);
        }
        setTasksLoading(false);

        // Fetch recent notes
        const notesRes = await fetch('/api/notes?limit=4');
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setRecentNotes(notesData.notes);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStatsLoading(false);
        setTasksLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">{getGreeting()}, {session?.user?.name}</h1>
          <p className="text-muted-foreground text-sm">{getFullDate()}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#171717] border border-[#2e2e2e] rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="h-5 w-5 bg-white/5 rounded animate-pulse" />
                </div>
                <div>
                  <div className="h-8 w-16 bg-white/5 rounded animate-pulse mb-2" />
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-[#171717] border border-[#2e2e2e] rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-[#363636] transition-colors">
              <div className="p-2 rounded-lg bg-white/5">
                <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-semibold">{stats.focusMinutesToday}m</p>
                <p className="text-xs text-muted-foreground">Focus today</p>
              </div>
            </div>
            <div className="bg-[#171717] border border-[#2e2e2e] rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-[#363636] transition-colors">
              <div className="p-2 rounded-lg bg-white/5">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-semibold">{stats.tasksCompletedToday}</p>
                <p className="text-xs text-muted-foreground">Tasks done today</p>
              </div>
            </div>
            <div className="bg-[#171717] border border-[#2e2e2e] rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-[#363636] transition-colors">
              <div className="p-2 rounded-lg bg-white/5">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-semibold">{stats.studyStreak}</p>
                <p className="text-xs text-muted-foreground">Day streak</p>
              </div>
            </div>
            <div className="bg-[#171717] border border-[#2e2e2e] rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-[#363636] transition-colors">
              <div className="p-2 rounded-lg bg-white/5">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-semibold">{stats.totalNotes}</p>
                <p className="text-xs text-muted-foreground">Total notes</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-3">
          <div className="bg-[#171717] border border-[#2e2e2e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-medium">Today's tasks</h2>
                <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

          {tasksLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded animate-pulse bg-white/5" />
              ))}
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tasks for today</p>
              <p className="text-sm text-muted-foreground mt-1">Add one to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div key={task._id} className="flex items-center gap-2 sm:gap-3 py-2 border-b border-white/5 last:border-0">
                  <Checkbox
                    checked={task.status === 'done'}
                    onCheckedChange={() => handleToggleTask(task._id, task.status)}
                    className="shrink-0"
                  />
                  <span className={`flex-1 text-xs sm:text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </span>
                  {task.subject && <Badge variant="outline" className="text-xs shrink-0 hidden sm:inline-block">{task.subject}</Badge>}
                  <span className={`text-xs shrink-0 ${priorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link href="/dashboard/tasks" className="text-xs text-muted-foreground hover:text-white mt-3 inline-flex items-center gap-1">
            View all tasks <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        </div>

        {/* Recent Notes */}
        <div className="lg:col-span-2">
          <div className="bg-[#171717] border border-[#2e2e2e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">Recent notes</h2>
              <Link href="/dashboard/notes" className="text-sm text-muted-foreground hover:text-white">New note →</Link>
            </div>

          {recentNotes.length === 0 ? (
            <div className="text-center py-12">
              <StickyNote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notes yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotes.map((note) => (
                <Link key={note._id} href={`/dashboard/notes?id=${note._id}`} className="block py-2 border-b border-white/5 last:border-0 hover:opacity-80 transition-opacity">
                  <p className="text-sm font-medium truncate">{note.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{relativeTime(note.updatedAt)}</p>
                </Link>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Streak Banner */}
      {stats.studyStreak > 0 ? (
        <div className="bg-[#171717] border border-[#2e2e2e] border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
          <Flame className="w-5 h-5 text-orange-400 shrink-0" />
          <span className="text-sm"><strong>{stats.studyStreak} day streak</strong> — Keep the momentum going!</span>
        </div>
      ) : (
        <div className="bg-[#171717] border border-[#2e2e2e] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
          <span className="text-sm text-muted-foreground">Complete a focus session or task to start your streak.</span>
          <Link href="/dashboard/focus" className="text-sm underline sm:ml-auto">Start now →</Link>
        </div>
      )}

      {/* Quick Add Task Dialog */}
      <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick add task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQuickAddTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task title</Label>
              <Input
                id="title"
                placeholder="What do you need to do?"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date (optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={quickTaskDueDate}
                onChange={(e) => setQuickTaskDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={quickTaskPriority} onValueChange={setQuickTaskPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setQuickAddOpen(false)}>Cancel</Button>
              <Button type="submit">Add Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
