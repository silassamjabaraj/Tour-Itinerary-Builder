import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  User as UserIcon, 
  LogIn, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { StorageService } from '../../lib/storage';
import { ROLE_PERMISSIONS, getRoleDefaultTab } from '../../lib/permissions';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('sarah.jenkins');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const availableUsers = StorageService.getUsers();

  const cleanIdent = identifier.trim().toLowerCase();
  const matchedUser = availableUsers.find(
    (u) =>
      (u.username && u.username.toLowerCase() === cleanIdent) ||
      (u.email && u.email.toLowerCase() === cleanIdent)
  );

  const roleConfig = matchedUser ? ROLE_PERMISSIONS[matchedUser.role] : null;
  const defaultTab = matchedUser ? getRoleDefaultTab(matchedUser.role) : 'dashboard';

  const handleSelectDemoUser = (u: User) => {
    setIdentifier(u.username || u.email);
    setPassword(u.password || 'password123');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanIdent = identifier.trim().toLowerCase();
      const cleanPass = password.trim();

      // Find user by username or email
      const existingUser = availableUsers.find(
        (u) =>
          (u.username && u.username.toLowerCase() === cleanIdent) ||
          (u.email && u.email.toLowerCase() === cleanIdent)
      );

      if (existingUser) {
        // Check active status
        if (existingUser.active === false) {
          setError('This account has been deactivated. Please contact your system administrator.');
          setIsLoading(false);
          return;
        }

        // Verify password if user has password set
        if (existingUser.password && existingUser.password !== cleanPass) {
          setError('Incorrect password. Please verify your credentials.');
          setIsLoading(false);
          return;
        }

        // Successful login
        const updatedUser: User = {
          ...existingUser,
          lastLogin: new Date().toISOString(),
        };

        // Update last login in storage
        const updatedList = availableUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u));
        StorageService.saveUsers(updatedList);

        onLogin(updatedUser);
      } else if (cleanIdent.length > 0) {
        // Dynamic fallback user for flexibility
        const customUser: User = {
          id: `usr-${Date.now()}`,
          name: cleanIdent.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          username: cleanIdent.split('@')[0],
          email: cleanIdent.includes('@') ? cleanIdent : `${cleanIdent}@emirates-tours.local`,
          password: cleanPass || 'password123',
          role: 'Travel Consultant',
          active: true,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        const list = [...availableUsers, customUser];
        StorageService.saveUsers(list);
        onLogin(customUser);
      } else {
        setError('Please enter your username/email and password.');
        setIsLoading(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-8 relative z-10 space-y-6">
        {/* Workspace Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Sign In to Workspace</h1>
            <p className="text-xs text-slate-400 mt-1">
              Tour Itinerary Builder & Pricing Platform
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Workspace Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Username or Email Address
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. sarah.jenkins or sarah.j@emirates-tours.local"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 text-white text-xs rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-300">
                Password
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Default: password123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 text-white text-xs rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              {showDemoAccounts ? 'Hide Quick Roles' : 'Fast Demo Accounts'}
            </button>
          </div>

          {/* Quick Demo Accounts Selection Tray */}
          {showDemoAccounts && (
            <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2 text-xs">
              <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Click any account to fill username & password:
              </p>
              <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectDemoUser(u)}
                    className={`w-full text-left p-2 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      identifier.toLowerCase() === (u.username || '').toLowerCase() || identifier.toLowerCase() === u.email.toLowerCase()
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <span className="font-bold text-[11px] block text-white">{u.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-md border border-slate-700">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Assigned Role Preview */}
          {matchedUser && (
            <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/30 text-xs space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Assigned Role: {matchedUser.role}</span>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
                  {roleConfig?.allowedTabs.length || 0} Modules
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {roleConfig?.description}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold pt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Default Landing View: <strong className="text-white capitalize">{defaultTab}</strong></span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Signing in as {matchedUser?.name || identifier}...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>
                  {matchedUser ? `Sign In as ${matchedUser.name} (${matchedUser.role})` : 'Sign In to Workspace'}
                </span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-Bit SSL Encrypted Workspace</span>
        </div>
      </div>
    </div>
  );
};
