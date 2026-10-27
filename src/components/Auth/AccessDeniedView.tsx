import React from 'react';
import { UserRole } from '../../types';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  UserCheck, 
  Shield, 
  Sparkles,
  Home
} from 'lucide-react';
import { 
  ROLE_PERMISSIONS, 
  TAB_LABELS, 
  TAB_REQUIRED_ROLES, 
  getRoleDefaultTab 
} from '../../lib/permissions';

interface AccessDeniedViewProps {
  targetTab: string;
  currentUserRole: UserRole;
  onGoHome: () => void;
  onSwitchRole: (role: UserRole) => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  targetTab,
  currentUserRole,
  onGoHome,
  onSwitchRole,
}) => {
  const currentRoleConfig = ROLE_PERMISSIONS[currentUserRole];
  const tabName = TAB_LABELS[targetTab] || targetTab;
  const requiredRoles = TAB_REQUIRED_ROLES[targetTab] || ['Administrator'];

  const allRoles: UserRole[] = [
    'Administrator',
    'Travel Consultant',
    'Sales Manager',
    'Product Manager',
    'Operations Executive',
    'Finance User',
    'Read-only Viewer',
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Box */}
      <div className="bg-white rounded-3xl border border-red-200/80 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
                <Lock className="w-3 h-3" /> Access Restricted
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Permission Required for "{tabName}"
              </h1>
              <p className="text-white/80 text-sm mt-1">
                Your current system role (<span className="font-bold text-white underline">{currentUserRole}</span>) does not have authorization to access this workspace module.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Required Roles Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Authorized Roles for this Workspace</span>
              </div>
              <p className="text-xs text-slate-600">
                To access <strong>{tabName}</strong>, your account must be assigned one of the following roles:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {requiredRoles.map((r) => {
                  const cfg = ROLE_PERMISSIONS[r];
                  return (
                    <span
                      key={r}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${cfg?.badge.bg} ${cfg?.badge.text} ${cfg?.badge.border}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {r}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Current Role Capabilities */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Your Role: {currentUserRole}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-200/60 text-indigo-800">
                  Active
                </span>
              </div>
              <p className="text-xs text-indigo-800 leading-relaxed">
                {currentRoleConfig?.description}
              </p>
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-indigo-900 block">Your Allowed Modules:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentRoleConfig?.allowedTabs.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-800 text-[11px] font-medium rounded-lg"
                    >
                      {TAB_LABELS[t] || t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Role Switcher / Helper */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Test / Switch Workspace Role
                </h4>
                <p className="text-xs text-slate-500">
                  Select an authorized role to switch context and preview role-specific access permissions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onGoHome}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
                >
                  <Home className="w-4 h-4" /> Go to Dashboard
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {allRoles.map((r) => {
                const isCurrent = currentUserRole === r;
                const isAuthorized = requiredRoles.includes(r);
                return (
                  <button
                    key={r}
                    onClick={() => onSwitchRole(r)}
                    className={`p-3 rounded-xl text-left text-xs transition border cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-md'
                        : isAuthorized
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold block truncate">{r}</span>
                    <span className="text-[10px] mt-2 block opacity-80">
                      {isCurrent ? 'Current' : isAuthorized ? 'Authorized' : 'Restricted'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
