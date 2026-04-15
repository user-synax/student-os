"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Timer, 
  Bookmark, 
  Brain, 
  BarChart2, 
  Sparkles, 
  Settings, 
  LogOut, 
  Bell,
  Menu,
  X 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Providers from "./providers";

const navigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Notes", href: "/dashboard/notes", icon: FileText },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "Focus", href: "/dashboard/focus", icon: Timer },
  { label: "Resources", href: "/dashboard/resources", icon: Bookmark },
  { label: "Flashcards", href: "/dashboard/flashcards", icon: Brain },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { label: "AI Assistant", href: "/dashboard/ai", icon: Sparkles },
];

const settingsItem = { label: "Settings", href: "/dashboard/settings", icon: Settings };

function DashboardLayoutContent({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    const item = [...navigationItems, settingsItem].find(item => item.href === pathname);
    return item ? item.label : "Dashboard";
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 42 42" fill="none">
          <circle cx="6" cy="6" r="4" fill="rgba(255,255,255,0.8)" />
          <circle cx="20" cy="6" r="4" fill="rgba(255,255,255,0.8)" />
          <circle cx="34" cy="6" r="4" fill="rgba(255,255,255,0.8)" />
          <circle cx="6" cy="20" r="4" fill="rgba(255,255,255,0.8)" />
          <circle cx="20" cy="20" r="4" fill="rgba(255,255,255,0.8)" />
          <circle cx="34" cy="20" r="4" fill="rgba(255,255,255,0.8)" />
          <circle cx="6" cy="34" r="4" fill="rgba(255,255,255,0.8)" />
          <circle cx="20" cy="34" r="4" fill="rgba(255,255,255,0.8)" />
          <circle cx="34" cy="34" r="4" fill="rgba(255,255,255,0.8)" />
        </svg>
        <span className="text-base font-medium text-[var(--color-foreground)]">Student OS</span>
      </div>

      <Separator className="bg-[var(--color-border)]" />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-3 space-y-2">
        {session && (
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs">
                {session.user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-foreground)] truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
        <Link
          href={settingsItem.href}
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === settingsItem.href
              ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
              : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)]"
          }`}
        >
          <settingsItem.icon className="w-4 h-4" />
          {settingsItem.label}
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[240px] bg-[var(--color-card)] border-r border-[var(--color-border)] flex-col z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Simple CSS */}
      <div className="md:hidden">
        <Button 
          variant="default" 
          size="icon" 
          className="fixed top-4 left-4 z-[100]"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-[90]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-0 h-screen w-[280px] bg-[var(--color-background)] border-r border-[var(--color-border)] z-[100] flex flex-col transform transition-transform duration-200">
              <div className="p-4 flex items-center justify-between">
                <span className="text-base font-medium text-white/80">Menu</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <Separator className="bg-[var(--color-border)]" />
              <div className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                          : "text-[var(--color-foreground)] hover:bg-[var(--color-accent)]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  href={settingsItem.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === settingsItem.href
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                      : "text-[var(--color-foreground)] hover:bg-[var(--color-accent)]"
                  }`}
                >
                  <settingsItem.icon className="w-4 h-4" />
                  {settingsItem.label}
                </Link>
              </div>
              <div className="p-3 space-y-2 border-t border-[var(--color-border)]">
                {session && (
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs">
                        {session.user?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-[var(--color-muted-foreground)] hover:text-white"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <main className="md:ml-[240px] flex-1 min-h-screen pt-14 w-full">
        {/* Topbar */}
        <header className="fixed top-0 left-0 right-0 md:left-[240px] h-14 border-b border-[var(--color-border)] bg-[var(--color-card)] flex items-center justify-between px-4 md:px-6 z-40">
          <div className="flex items-center gap-4">
            <div className="md:hidden w-10" /> {/* Spacer for mobile hamburger button */}
            <h1 className="text-lg font-medium">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-[var(--color-muted-foreground)]">
              <Bell className="w-5 h-5" />
            </Button>
            {session && (
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs">
                  {session.user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 relative w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <Providers>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Providers>
  );
}
