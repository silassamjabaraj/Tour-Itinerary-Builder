import React, { useState } from 'react';
import { CompanySettings, User, AuditLog, UserRole } from '../../types';
import { StorageService } from '../../lib/storage';
import { 
  Settings, 
  Users, 
  Database, 
  ShieldAlert, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  CheckCircle2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Key,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Shield,
  Sparkles,
  X,
  Phone,
  Mail,
  Building,
  Lock,
  RefreshCw,
  AlertTriangle,
  FileCheck,
  Check,
  Copy
} from 'lucide-react';

interface AdminSettingsViewProps {
  settings: CompanySettings;
  users: User[];
  auditLogs: AuditLog[];
  currentUser?: User | null;
  onSaveSettings: (settings: CompanySettings) => void;
  onSaveUsers?: (users: User[]) => void;
  onResetData: () => void;
}

const ALL_ROLES: UserRole[] = [
  'Administrator',
  'Travel Consultant',
  'Sales Manager',
  'Product Manager',
  'Operations Executive',
  'Finance User',
  'Read-only Viewer',
];

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  'Administrator': 'Full access to system configuration, user role management, business rules, master catalog, and backups.',
  'Travel Consultant': 'Create, edit, and send custom tour itinerary proposals, manage client enquiries, and view pricing.',
  'Sales Manager': 'Review and approve discount thresholds, commercial profit margins, and manage sales team proposals.',
  'Product Manager': 'Manage master packages & templates, contract supplier rates, hotels, transport, and excursions.',
  'Operations Executive': 'Generate operational travel vouchers, coordinate with suppliers, and track booking confirmations.',
  'Finance User': 'Configure tax codes, commercial margin formulas, invoice reconciliations, and financial exports.',
  'Read-only Viewer': 'View approved proposals, master itineraries, and schedules with no edit or export rights.',
};

const ROLE_BADGE_STYLES: Record<UserRole, { bg: string; text: string; border: string }> = {
  'Administrator': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Sales Manager': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Travel Consultant': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Product Manager': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Operations Executive': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Finance User': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Read-only Viewer': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
];

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  settings: initialSettings,
  users: propUsers,
  auditLogs,
  currentUser,
  onSaveSettings,
  onSaveUsers,
  onResetData,
}) => {
  const [settings, setSettings] = useState<CompanySettings>(initialSettings);
  const [userList, setUserList] = useState<User[]>(propUsers);
  const [activeTab, setActiveTab] = useState<'branding' | 'rules' | 'users' | 'backup' | 'audit'>('users');
  const [restoreMessage, setRestoreMessage] = useState('');

  // Search & Filter State for Users
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Password visibility map for user cards
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formShowPassword, setFormShowPassword] = useState(false);
  const [formRole, setFormRole] = useState<UserRole>('Travel Consultant');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('Sales & Leisure Travel');
  const [formActive, setFormActive] = useState(true);
  const [formAvatar, setFormAvatar] = useState(PRESET_AVATARS[0]);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick Password Reset Modal
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newQuickPassword, setNewQuickPassword] = useState('');
  const [showQuickPass, setShowQuickPass] = useState(false);

  // Sync user list if prop updates
  React.useEffect(() => {
    setUserList(propUsers);
  }, [propUsers]);

  const saveUpdatedUsers = (updated: User[]) => {
    setUserList(updated);
    if (onSaveUsers) {
      onSaveUsers(updated);
    } else {
      StorageService.saveUsers(updated);
    }
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tour_builder_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = StorageService.restoreFromJSON(content);
      if (success) {
        setRestoreMessage('System state restored successfully! Reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setRestoreMessage('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // User Actions
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingUserId(null);
    setFormName('');
    setFormUsername('');
    setFormEmail('');
    setFormPassword(generateRandomPassword());
    setFormRole('Travel Consultant');
    setFormPhone('');
    setFormDepartment('Sales & Leisure Travel');
    setFormActive(true);
    setFormAvatar(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setModalMode('edit');
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormUsername(user.username || user.email.split('@')[0]);
    setFormEmail(user.email);
    setFormPassword(user.password || '');
    setFormRole(user.role);
    setFormPhone(user.phone || '');
    setFormDepartment(user.department || '');
    setFormActive(user.active !== false);
    setFormAvatar(user.avatar || PRESET_AVATARS[0]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (modalMode === 'add' && !formUsername) {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '.');
      setFormUsername(slug);
    }
  };

  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUsername = formUsername.trim().toLowerCase();
    const cleanEmail = formEmail.trim().toLowerCase();

    if (!formName.trim()) {
      setFormError('Please enter a full name.');
      return;
    }
    if (!cleanUsername) {
      setFormError('Please enter a username.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (modalMode === 'add' && !formPassword.trim()) {
      setFormError('Please specify an initial password.');
      return;
    }

    // Check duplicate username
    const duplicateUser = userList.find(
      (u) =>
        u.id !== editingUserId &&
        ((u.username && u.username.toLowerCase() === cleanUsername) ||
          u.email.toLowerCase() === cleanEmail)
    );

    if (duplicateUser) {
      setFormError(`A user with username "${cleanUsername}" or email "${cleanEmail}" already exists.`);
      return;
    }

    if (modalMode === 'add') {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: formName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: formPassword.trim(),
        role: formRole,
        phone: formPhone.trim(),
        department: formDepartment.trim(),
        active: formActive,
        avatar: formAvatar,
        createdAt: new Date().toISOString(),
        lastLogin: undefined,
      };

      const updated = [...userList, newUser];
      saveUpdatedUsers(updated);

      StorageService.addAuditLog({
        userName: currentUser?.name || 'Administrator',
        userRole: currentUser?.role || 'Administrator',
        action: 'User Created',
        entityType: 'User Account',
        entityId: newUser.id,
        summary: `Created new user ${newUser.name} (@${newUser.username}) with role ${newUser.role}.`,
      });

      setIsModalOpen(false);
    } else {
      // Edit mode
      const updated = userList.map((u) => {
        if (u.id === editingUserId) {
          return {
            ...u,
            name: formName.trim(),
            username: cleanUsername,
            email: cleanEmail,
            password: formPassword.trim() || u.password || 'password123',
            role: formRole,
            phone: formPhone.trim(),
            department: formDepartment.trim(),
            active: formActive,
            avatar: formAvatar,
          };
        }
        return u;
      });

      saveUpdatedUsers(updated);

      StorageService.addAuditLog({
        userName: currentUser?.name || 'Administrator',
        userRole: currentUser?.role || 'Administrator',
        action: 'User Updated',
        entityType: 'User Account',
        entityId: editingUserId || 'unknown',
        summary: `Updated user profile & role for ${formName} (@${cleanUsername}) -> ${formRole}.`,
      });

      setIsModalOpen(false);
    }
  };

  const handleToggleUserStatus = (user: User) => {
    if (currentUser && user.id === currentUser.id) {
      alert('You cannot deactivate your own active session account.');
      return;
    }

    const newStatus = !user.active;
    const updated = userList.map((u) => (u.id === user.id ? { ...u, active: newStatus } : u));
    saveUpdatedUsers(updated);

    StorageService.addAuditLog({
      userName: currentUser?.name || 'Administrator',
      userRole: currentUser?.role || 'Administrator',
      action: newStatus ? 'User Activated' : 'User Deactivated',
      entityType: 'User Account',
      entityId: user.id,
      summary: `${newStatus ? 'Activated' : 'Deactivated'} account for ${user.name} (@${user.username}).`,
    });
  };

  const handleDeleteUser = (user: User) => {
    if (currentUser && user.id === currentUser.id) {
      alert('You cannot delete your own logged-in account.');
      return;
    }

    const adminCount = userList.filter((u) => u.role === 'Administrator' && u.active).length;
    if (user.role === 'Administrator' && adminCount <= 1) {
      alert('Cannot delete the last active Administrator account.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${user.name}" (@${user.username})? This action cannot be undone.`)) {
      const updated = userList.filter((u) => u.id !== user.id);
      saveUpdatedUsers(updated);

      StorageService.addAuditLog({
        userName: currentUser?.name || 'Administrator',
        userRole: currentUser?.role || 'Administrator',
        action: 'User Deleted',
        entityType: 'User Account',
        entityId: user.id,
        summary: `Permanently deleted user ${user.name} (@${user.username}).`,
      });
    }
  };

  const handleExecuteQuickPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newQuickPassword.trim()) return;

    const updated = userList.map((u) =>
      u.id === resetPasswordUser.id ? { ...u, password: newQuickPassword.trim() } : u
    );
    saveUpdatedUsers(updated);

    StorageService.addAuditLog({
      userName: currentUser?.name || 'Administrator',
      userRole: currentUser?.role || 'Administrator',
      action: 'Password Reset',
      entityType: 'User Account',
      entityId: resetPasswordUser.id,
      summary: `Reset password credentials for ${resetPasswordUser.name} (@${resetPasswordUser.username}).`,
    });

    setResetPasswordUser(null);
    setNewQuickPassword('');
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleCopyCredentials = (user: User) => {
    const text = `Username: ${user.username || user.email}\nPassword: ${user.password || 'password123'}\nRole: ${user.role}`;
    navigator.clipboard.writeText(text);
    setCopiedUserId(user.id);
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  // Filtered users
  const filteredUsers = userList.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && u.active !== false) ||
      (statusFilter === 'Inactive' && u.active === false);

    return matchSearch && matchRole && matchStatus;
  });

  const activeCount = userList.filter((u) => u.active !== false).length;
  const inactiveCount = userList.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" /> Administration & Workspace Settings
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            User credentials, role-based access control, company branding, pricing rules, and security logs.
          </p>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div className="flex space-x-1 border-b border-slate-200 bg-white p-2 rounded-2xl overflow-x-auto scrollbar-none">
        {[
          { id: 'users', label: 'Users & Roles Management', icon: Users, badge: userList.length },
          { id: 'branding', label: 'Company Branding & Details', icon: Building },
          { id: 'rules', label: 'Approval & Pricing Rules', icon: ShieldAlert },
          { id: 'backup', label: 'Local Backup & Restore', icon: Database },
          { id: 'audit', label: 'Audit Trail', icon: FileCheck, badge: auditLogs.length },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    activeTab === t.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB CONTENT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {/* USERS & ROLES TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Action Bar & Stats */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-3">
                {/* Stats Chips */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="text-slate-500 font-medium">Total Users:</span>
                  <span className="font-bold text-slate-900">{userList.length}</span>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-500 font-medium">Active:</span>
                  <span className="font-bold text-emerald-700">{activeCount}</span>
                </div>

                {inactiveCount > 0 && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
                    <UserX className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500 font-medium">Inactive:</span>
                    <span className="font-bold text-slate-600">{inactiveCount}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/25 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add New User
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, username (@sarah.jenkins), email, department, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-800 text-xs font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All User Roles</option>
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Users Grid */}
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No users matching search filters.</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting the search query or click "Add New User" above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((u) => {
                  const roleStyle = ROLE_BADGE_STYLES[u.role] || {
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                    border: 'border-slate-200',
                  };
                  const isPasswordVisible = !!visiblePasswords[u.id];
                  const isCurrentUser = currentUser && currentUser.id === u.id;

                  return (
                    <div
                      key={u.id}
                      className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 bg-white shadow-xs ${
                        u.active === false
                          ? 'border-slate-200 bg-slate-50/70 opacity-75'
                          : isCurrentUser
                          ? 'border-indigo-300 ring-2 ring-indigo-500/15'
                          : 'border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      {/* Top Row: Avatar, Name, Role */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={u.avatar || PRESET_AVATARS[0]}
                                alt={u.name}
                                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs"
                              />
                              <span
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                                  u.active !== false ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                                title={u.active !== false ? 'Active Account' : 'Inactive Account'}
                              />
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-slate-900 text-sm">{u.name}</h4>
                                {isCurrentUser && (
                                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-indigo-600 font-semibold">
                                @{u.username || u.email.split('@')[0]}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate max-w-[170px]">{u.email}</p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                          >
                            {u.role}
                          </span>
                        </div>

                        {/* Details & Department */}
                        <div className="space-y-1.5 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                          {u.department && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{u.department}</span>
                            </div>
                          )}
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Credentials Preview Box */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-500 font-medium shrink-0">Password:</span>
                            <span className="font-mono font-bold text-slate-800 truncate">
                              {isPasswordVisible ? (u.password || 'password123') : '••••••••'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              title={isPasswordVisible ? 'Hide password' : 'Show password'}
                              className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
                            >
                              {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyCredentials(u)}
                              title="Copy username & password"
                              className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
                            >
                              {copiedUserId === u.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold rounded-xl text-[11px] flex items-center gap-1 transition cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" /> Edit Profile & Role
                          </button>

                          <button
                            onClick={() => {
                              setResetPasswordUser(u);
                              setNewQuickPassword(generateRandomPassword());
                            }}
                            title="Quick Change Password"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            title={u.active !== false ? 'Deactivate user' : 'Activate user'}
                            className={`p-1.5 rounded-xl transition cursor-pointer ${
                              u.active !== false
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {u.active !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            title="Delete user permanently"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Role Permissions Matrix Reference Guide */}
            <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" /> Role-Based Access Control (RBAC) Matrix
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Standard capabilities and security boundaries assigned to each user role across the tour platform.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-200 border-b border-slate-800">
                      <th className="p-3 font-bold">System Role</th>
                      <th className="p-3 font-semibold text-center">Itinerary Builder</th>
                      <th className="p-3 font-semibold text-center">Templates & Masters</th>
                      <th className="p-3 font-semibold text-center">Commercial Approvals</th>
                      <th className="p-3 font-semibold text-center">Operations & Vouchers</th>
                      <th className="p-3 font-semibold text-center">Finance & Margins</th>
                      <th className="p-3 font-semibold text-center">Admin & User Roles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {ALL_ROLES.map((r) => {
                      const isAdmin = r === 'Administrator';
                      const isSalesMgr = r === 'Sales Manager' || isAdmin;
                      const isConsultant = r === 'Travel Consultant' || isAdmin || isSalesMgr;
                      const isProduct = r === 'Product Manager' || isAdmin;
                      const isOps = r === 'Operations Executive' || isAdmin;
                      const isFinance = r === 'Finance User' || isAdmin;

                      return (
                        <tr key={r} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-bold text-slate-900">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] ${ROLE_BADGE_STYLES[r].bg} ${ROLE_BADGE_STYLES[r].text}`}>
                              {r}
                            </span>
                            <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                              {ROLE_DESCRIPTIONS[r]}
                            </p>
                          </td>
                          <td className="p-3 text-center">
                            {isConsultant || isProduct ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {isProduct || isAdmin ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {isSalesMgr ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {isOps ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {isFinance ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {isAdmin ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BRANDING TAB */}
        {activeTab === 'branding' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSaveSettings(settings);
              alert('Company branding settings saved successfully!');
            }}
            className="space-y-4 max-w-2xl text-xs"
          >
            <div>
              <label className="block text-slate-700 font-bold mb-1">Company Display Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Official Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Tax Registration Number (TRN)</label>
              <input
                type="text"
                value={settings.taxRegistrationNumber}
                onChange={(e) => setSettings({ ...settings, taxRegistrationNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Default Terms & Conditions</label>
              <textarea
                rows={3}
                value={settings.defaultTerms}
                onChange={(e) => setSettings({ ...settings, defaultTerms: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Company Branding Settings
            </button>
          </form>
        )}

        {/* RULES TAB */}
        {activeTab === 'rules' && (
          <div className="space-y-4 max-w-xl text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Commercial Approval Rules</h3>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Max Consultant Discount Threshold (%)
              </label>
              <input
                type="number"
                value={settings.approvalDiscountThreshold}
                onChange={(e) => setSettings({ ...settings, approvalDiscountThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
              />
              <p className="text-[11px] text-slate-500 mt-1">Discounts above this percentage will trigger mandatory Sales Manager approval.</p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Minimum Policy Margin Threshold (%)
              </label>
              <input
                type="number"
                value={settings.approvalMarginThreshold}
                onChange={(e) => setSettings({ ...settings, approvalMarginThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-700"
              />
            </div>

            <button
              onClick={() => {
                onSaveSettings(settings);
                alert('Rules saved!');
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer"
            >
              Update Approval Rules
            </button>
          </div>
        )}

        {/* BACKUP & RESTORE TAB */}
        {activeTab === 'backup' && (
          <div className="space-y-6 text-xs max-w-2xl">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500" /> Export Complete System Snapshot
              </h3>
              <p className="text-slate-600">
                Download a complete JSON snapshot of all users, credentials, customers, enquiries, master catalogs, pricing rules, and itineraries.
              </p>
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export Backup JSON File
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-500" /> Restore System State from Backup
              </h3>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreBackup}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
              {restoreMessage && <p className="text-emerald-700 font-bold">{restoreMessage}</p>}
            </div>

            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-3">
              <h3 className="font-bold text-red-900 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-red-600" /> Reset Database to Factory Defaults
              </h3>
              <p className="text-red-700">
                Reset all modified itineraries, users, master catalogs, and custom customers back to original sample data.
              </p>
              <button
                onClick={() => {
                  if (confirm('Reset all data to default mock data?')) {
                    onResetData();
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Reset System State
              </button>
            </div>
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Immutable Security & Financial Audit Trail</h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{log.action} — {log.entityId}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-700">{log.summary}</p>
                  <div className="text-[10px] text-slate-500">
                    User: {log.userName} ({log.userRole})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT USER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-indigo-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-200" />
                <div>
                  <h3 className="font-bold text-base">
                    {modalMode === 'add' ? 'Add New Workspace User' : `Edit User — ${formName}`}
                  </h3>
                  <p className="text-indigo-100 text-xs">
                    Configure login username, password, security role, and contact details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-indigo-700 rounded-lg transition text-indigo-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserForm} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-mono text-slate-400 font-bold">@</span>
                    <input
                      type="text"
                      required
                      placeholder="sarah.jenkins"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah.j@emirates-tours.local"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    User Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role Scope Notice */}
              <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2 text-[11px] text-indigo-900">
                <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">{formRole}:</strong> {ROLE_DESCRIPTIONS[formRole]}
                </div>
              </div>

              {/* Password Configuration */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{modalMode === 'add' ? 'Initial Password' : 'Change Password (Leave blank to keep existing)'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormPassword(generateRandomPassword())}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={formShowPassword ? 'text' : 'password'}
                    placeholder={modalMode === 'add' ? 'Enter secure password...' : 'Enter new password or leave unchanged'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFormShowPassword(!formShowPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {formShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Department & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department / Team</label>
                  <input
                    type="text"
                    placeholder="e.g. Sales & Leisure Travel"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+971 50 123 4567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Profile Avatar Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Avatar Image</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormAvatar(av)}
                      className={`w-9 h-9 rounded-xl overflow-hidden ring-2 transition cursor-pointer shrink-0 ${
                        formAvatar === av ? 'ring-indigo-600 scale-105 shadow-sm' : 'ring-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Active Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Account Status</span>
                  <span className="text-[11px] text-slate-500">Allow this user to sign into the tour builder</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{modalMode === 'add' ? 'Create User' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RESET PASSWORD MODAL */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm">Change User Password</h3>
                  <p className="text-slate-400 text-xs">For {resetPasswordUser.name} (@{resetPasswordUser.username})</p>
                </div>
              </div>
              <button
                onClick={() => setResetPasswordUser(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteQuickPasswordReset} className="p-6 space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">New Password</label>
                  <button
                    type="button"
                    onClick={() => setNewQuickPassword(generateRandomPassword())}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showQuickPass ? 'text' : 'password'}
                    required
                    value={newQuickPassword}
                    onChange={(e) => setNewQuickPassword(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowQuickPass(!showQuickPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showQuickPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetPasswordUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
