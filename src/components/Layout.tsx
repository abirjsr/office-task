import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  UserCog, 
  CheckSquare, 
  Contact, 
  Mail,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
      isActive 
        ? "bg-indigo-600 text-white" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

export const Layout = () => {
  const { currentAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform lg:translate-x-0 lg:static lg:inset-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">OfficeOS</h1>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem to="/admins" icon={Users} label="Admins" />
            <SidebarItem to="/departments" icon={Building2} label="Departments" />
            <SidebarItem to="/memorandums" icon={FileText} label="Memorandums" />
            <SidebarItem to="/hr" icon={UserCog} label="HR Management" />
            <SidebarItem to="/tasks" icon={CheckSquare} label="Tasks" />
            <SidebarItem to="/employees" icon={Contact} label="Employees" />
            <SidebarItem to="/email" icon={Mail} label="Email System" />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-2">
              <UserButton afterSignOutUrl="/sign-in" appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10"
                }
              }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentAdmin?.fullName || 'Admin'}</p>
                <p className="text-xs text-slate-500 truncate">{currentAdmin?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-bottom border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <div className="h-8 w-px bg-slate-800 mx-2"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">Online</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
