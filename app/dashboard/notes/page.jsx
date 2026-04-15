"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, Suspense } from "react";
import { Search, Plus, Pin, X, FileText, Pencil, Eye, Trash2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import MDEditor from '@uiw/react-md-editor';
import { useSearchParams } from 'next/navigation';

function NotesPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showNotesList, setShowNotesList] = useState(false);

  const titleInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);

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

  const fetchNotes = async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api/notes?${queryString}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/notes/folders');
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleCreateNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled',
          content: '',
          tags: [],
          folder: activeFolder === 'All' ? 'General' : activeFolder
        }),
      });

      if (response.ok) {
        const { note } = await response.json();
        setNotes(prev => [note, ...prev]);
        setSelectedNote(note);
        setEditMode(true);
        
        setTimeout(() => {
          titleInputRef.current?.focus();
        }, 100);
        
        toast.success("New Note created");
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error("Failed to create note");
    }
  };

  const handleSelectNote = async (id) => {
    if (selectedNote?._id === id) return;

    try {
      const response = await fetch(`/api/notes/${id}`);
      if (response.ok) {
        const { note } = await response.json();
        setSelectedNote(note);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    }
  };

  const saveNote = async (updates) => {
    if (!selectedNote) return;

    setSaveStatus('Syncing...');
    setIsSaving(true);

    try {
      const response = await fetch(`/api/notes/${selectedNote._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const { note } = await response.json();
        setSelectedNote(note);
        
        setNotes(prev => prev.map(n => 
          n._id === note._id ? note : n
        ));
        
        setSaveStatus('Saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = (value) => {
    if (!selectedNote) return;
    setSelectedNote(prev => ({ ...prev, title: value }));
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveNote({ title: value });
    }, 800);
  };

  const handleContentChange = (value) => {
    if (!selectedNote) return;
    setSelectedNote(prev => ({ ...prev, content: value || '' }));
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveNote({ content: value || '' });
    }, 800);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      const params = {};
      if (value) params.search = value;
      if (activeFolder !== 'All') params.folder = activeFolder;
      fetchNotes(params);
    }, 300);
  };

  const handleFolderChange = (folder) => {
    setActiveFolder(folder);
    const params = {};
    if (folder !== 'All') params.folder = folder;
    if (searchQuery) params.search = searchQuery;
    fetchNotes(params);
  };

  const addTag = () => {
    if (!newTagInput.trim() || !selectedNote) return;
    
    if (selectedNote.tags.includes(newTagInput.trim())) {
      setShowTagInput(false);
      setNewTagInput('');
      return;
    }

    saveNote({ tags: [...selectedNote.tags, newTagInput.trim()] });
    setSelectedNote(prev => ({ ...prev, tags: [...prev.tags, newTagInput.trim()] }));
    setNewTagInput('');
    setShowTagInput(false);
  };

  const removeTag = (tag) => {
    if (!selectedNote) return;
    saveNote({ tags: selectedNote.tags.filter(t => t !== tag) });
    setSelectedNote(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const togglePin = () => {
    if (!selectedNote) return;
    saveNote({ isPinned: !selectedNote.isPinned });
    setSelectedNote(prev => ({ ...prev, isPinned: !prev.isPinned }));
  };

  const handleDelete = () => {
    if (!selectedNote) return;
    
    if (!window.confirm("Delete this note?")) return;

    fetch(`/api/notes/${selectedNote._id}`, {
      method: 'DELETE',
    }).then(response => {
      if (response.ok) {
        setNotes(prev => prev.filter(n => n._id !== selectedNote._id));
        setSelectedNote(null);
        toast.success("Note deleted");
      }
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchNotes(), fetchFolders()]);
      setIsLoading(false);
    };

    loadData();

    const isNew = searchParams.get('new');
    const noteId = searchParams.get('id');

    if (isNew === 'true') {
      setTimeout(() => handleCreateNote(), 100);
    } else if (noteId) {
      handleSelectNote(noteId);
    }
  }, []);

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-[110]">
        <Button
          variant="default"
          size="icon"
          onClick={() => setShowNotesList(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Notes List Overlay */}
      {showNotesList && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-[90]"
            onClick={() => setShowNotesList(false)}
          />
          <div className="fixed left-0 top-0 h-screen w-[280px] bg-[var(--color-background)] border-r border-[var(--color-border)] z-[100] flex flex-col md:hidden">
            <div className="p-4 flex items-center justify-between">
              <span className="text-base font-medium text-[var(--color-foreground)]">Notes</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowNotesList(false)}
                className="text-[var(--color-foreground)]"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 bg-[var(--color-card)] border-[var(--color-border)]"
                />
              </div>
            </div>
            <div className="px-4 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => { handleFolderChange('All'); setShowNotesList(false); }}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                    activeFolder === 'All'
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                      : 'text-muted-foreground hover:text-white bg-[var(--color-card)] border border-[var(--color-border)]'
                  }`}
                >
                  All
                </button>
                {folders.map(folder => (
                  <button
                    key={folder}
                    onClick={() => { handleFolderChange(folder); setShowNotesList(false); }}
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                      activeFolder === folder
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'text-muted-foreground hover:text-white bg-[var(--color-card)] border border-[var(--color-border)]'
                    }`}
                  >
                    {folder}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 pb-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-white"
                onClick={() => { handleCreateNote(); setShowNotesList(false); }}
              >
                <Plus className="w-4 h-4" />
                New Note
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="px-3 py-3 border-b border-[var(--color-border)]">
                      <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse mb-2" />
                      <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
                    </div>
                  ))}
                </>
              ) : notes.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notes</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note._id}
                    onClick={() => { handleSelectNote(note._id); setShowNotesList(false); }}
                    className={`px-3 py-3 cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-accent)] transition-colors ${
                      selectedNote?._id === note._id ? 'bg-[var(--color-accent)] border-l-2 border-l-[var(--color-primary)]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {note.isPinned && <Pin className="w-3 h-3 text-yellow-500 shrink-0" />}
                      <p className="text-sm font-medium truncate">{note.title || 'Untitled'}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {note.content ? note.content.replace(/[#*`\[\]]/g, '').slice(0, 80) : 'Empty note'}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{relativeTime(note.updatedAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Desktop Left Panel */}
      <div className="hidden md:flex w-72 shrink-0 border-r border-[var(--color-border)] flex-col overflow-hidden bg-[var(--color-background)]">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 bg-[var(--color-card)] border-[var(--color-border)]"
            />
          </div>
        </div>

        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleFolderChange('All')}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                activeFolder === 'All'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                  : 'text-muted-foreground hover:text-white bg-[var(--color-card)] border border-[var(--color-border)]'
              }`}
            >
              All
            </button>
            {folders.map(folder => (
              <button
                key={folder}
                onClick={() => handleFolderChange(folder)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  activeFolder === folder
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                    : 'text-muted-foreground hover:text-white bg-[var(--color-card)] border border-[var(--color-border)]'
                }`}
              >
                {folder}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-white"
            onClick={handleCreateNote}
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-3 py-3 border-b border-[var(--color-border)]">
                  <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse mb-2" />
                  <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
                </div>
              ))}
            </>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notes</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                onClick={() => handleSelectNote(note._id)}
                className={`px-3 py-3 cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-accent)] transition-colors ${
                  selectedNote?._id === note._id ? 'bg-[var(--color-accent)] border-l-2 border-l-[var(--color-primary)]' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {note.isPinned && <Pin className="w-3 h-3 text-yellow-500 shrink-0" />}
                  <p className="text-sm font-medium truncate">{note.title || 'Untitled'}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {note.content ? note.content.replace(/[#*`\[\]]/g, '').slice(0, 80) : 'Empty note'}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">{relativeTime(note.updatedAt)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-[var(--color-background)] md:ml-0">
        {!selectedNote ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Select a note</p>
              <p className="text-muted-foreground mb-4">or create a new one</p>
              <Button onClick={handleCreateNote}>
                <Plus className="w-4 h-4 mr-2" />
                New note
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 sm:px-6 py-3 border-b border-[var(--color-border)] shrink-0 bg-[var(--color-card)]">
              <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                <Badge variant="outline" className="text-xs cursor-pointer shrink-0">
                  {selectedNote.folder}
                </Badge>
                {selectedNote.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs gap-1 shrink-0">
                    {tag}
                    <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
                <button
                  onClick={() => setShowTagInput(true)}
                  className="p-1 hover:bg-white/10 rounded transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                {showTagInput && (
                  <Input
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                    onBlur={() => setShowTagInput(false)}
                    className="h-6 w-24 text-xs px-2 bg-[var(--color-background)] border-[var(--color-border)] shrink-0"
                    autoFocus
                  />
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <span className="text-xs text-muted-foreground w-12 sm:w-16 hidden sm:block">{saveStatus}</span>
                <button
                  onClick={() => setEditMode(true)}
                  className={`p-1.5 sm:p-2 rounded transition-colors ${editMode ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className={`p-1.5 sm:p-2 rounded transition-colors ${!editMode ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <Button variant="ghost" size="icon" onClick={togglePin} className="h-8 w-8 sm:h-9 sm:w-9">
                  <Pin className={selectedNote.isPinned ? 'text-yellow-500' : ''} />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8 sm:h-9 sm:w-9">
                  <Trash2 className="text-muted-foreground hover:text-red-400" />
                </Button>
              </div>
            </div>

            <div className="px-4 sm:px-6 pt-4 shrink-0">
              <input
                ref={titleInputRef}
                type="text"
                value={selectedNote.title}
                onChange={e => handleTitleChange(e.target.value)}
                className="w-full bg-transparent text-xl sm:text-2xl font-semibold outline-none placeholder:text-muted-foreground/30 border-none text-[var(--color-foreground)]"
                placeholder="Untitled"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
              {editMode ? (
                <MDEditor
                  value={selectedNote.content || ''}
                  onChange={handleContentChange}
                  preview="edit"
                  hideToolbar={false}
                  data-color-mode="dark"
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                  height={500}
                />
              ) : (
                <MDEditor.Markdown 
                  source={selectedNote.content || '*Start writing...*'} 
                  data-color-mode="dark"
                  style={{ background: 'transparent', padding: 0 }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotesPageContent />
    </Suspense>
  );
}
