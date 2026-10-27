import React, { useState } from 'react';
import { 
  Building2, 
  CheckSquare, 
  Compass, 
  Database, 
  FileText, 
  FolderKanban, 
  LayoutDashboard, 
  ShieldAlert, 
  Users, 
  BarChart3, 
  Settings, 
  Sparkles, 
  UserCheck, 
  LogOut, 
  ChevronDown, 
  Shield, 
  Lock, 
  Layers
} from 'lucide-react';
import { User, UserRole } from '../types';
import { isTabAllowed, getRoleDefaultTab, ROLE_PERMISSIONS } from '../lib/permissions';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  pendingApprovalsCount: number;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  currentUserRole,
  setCurrentUserRole,
  pendingApprovalsCount,
  onLogout,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const roles: UserRole[] = [
    'Administrator',
    'Travel Consultant',
    'Sales Manager',
    'Product Manager',
    'Operations Executive',
    'Finance User',
    'Read-only Viewer',
  ];

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentUserRole(newRole);
    if (!isTabAllowed(newRole, activeTab)) {
      setActiveTab(getRoleDefaultTab(newRole));
    }
  };

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers & Enquiries', icon: Users },
    { id: 'itineraries', label: 'Itineraries', icon: Compass },
    { 
      id: 'approvals', 
      label: 'Approval Queue', 
      icon: ShieldAlert, 
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined 
    },
    { id: 'operations', label: 'Operations', icon: FolderKanban },
    { id: 'masters', label: 'Master Data', icon: Database },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'admin', label: 'Admin & Settings', icon: Settings },
  ];

  // RBAC Filter: Only show tabs authorized for the current active role
  const visibleNavItems = allNavItems.filter((item) => isTabAllowed(currentUserRole, item.id));
  const roleConfig = ROLE_PERMISSIONS[currentUserRole];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
              <Building2 className="w-5 h-5 text-white font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-slate-100">Andaman Tour</h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Sleek Edition v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Tour Itinerary Builder & Pricing Engine</p>
            </div>
          </div>

          {/* User Profile & Role Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Active Role Selector with RBAC Info */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-300 font-medium">Role:</span>
              <select
                value={currentUserRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="bg-slate-900 text-indigo-300 text-xs font-semibold rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <span className="text-[10px] bg-slate-900/80 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700 font-mono">
                {visibleNavItems.length} modules
              </span>
            </div>

            {/* Current Logged In User Pill */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/50"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-indigo-400 font-medium">
                      {currentUser.username ? `@${currentUser.username} • ${currentUserRole}` : currentUserRole}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 space-y-1">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white">{currentUser.name}</p>
                        {currentUser.username && (
                          <span className="text-[10px] font-mono text-indigo-400">@{currentUser.username}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="inline-block text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                          {currentUserRole}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({visibleNavItems.length} accessible tabs)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                        {roleConfig?.description}
                      </p>
                    </div>

                    <div className="px-2 py-1 space-y-1 max-h-56 overflow-y-auto">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Switch Workspace Role</span>
                        <span className="text-[9px] text-indigo-400 lowercase">RBAC enabled</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {roles.map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              handleRoleChange(r);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                              currentUserRole === r
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{r}</span>
                            </div>
                            {currentUserRole === r ? (
                              <Shield className="w-3.5 h-3.5 text-white shrink-0" />
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">
                                {ROLE_PERMISSIONS[r]?.allowedTabs.length} tabs
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-1 px-2">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition cursor-pointer flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Sign Out of Platform</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Filtered by RBAC) */}
        <nav className="flex space-x-1 overflow-x-auto pb-1.5 scrollbar-none border-t border-slate-800/80 pt-1.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-indigo-700' : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

