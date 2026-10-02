import React from 'react';
import {
  ShieldAlert,
  Inbox,
  Sparkles,
  Layers,
  BarChart3,
  History,
  FileCheck2,
  Users,
  Radio,
  Cpu
} from 'lucide-react';
import { UserPersona, UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activePersona: UserPersona;
  setActivePersona: (persona: UserPersona) => void;
  personas: UserPersona[];
  unreviewedCount: number;
  openPRDModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activePersona,
  setActivePersona,
  personas,
  unreviewedCount,
  openPRDModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top status bar */}
      <div className="px-4 lg:px-8 py-2 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-300">Gemini 3.8 Flash AI Engine:</span>
            <span className="text-emerald-400 font-mono">Active (Server-Side)</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>ServiceNow Connector:</span>
            <span className="text-indigo-300 font-mono">REST v2 Ready</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>Channels:</span>
            <span className="text-slate-300">Teams • Email • Web • Monitoring</span>
          </div>
        </div>

        {/* Persona Switcher & PRD Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={openPRDModal}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-medium transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Architecture & PRD Specs</span>
            <span className="sm:hidden">PRD</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 hidden sm:inline">Active Persona:</span>
            <select
              value={activePersona.id}
              onChange={e => {
                const p = personas.find(item => item.id === e.target.value);
                if (p) setActivePersona(p);
              }}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              {personas.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name} ({p.roleTitle.split('/')[0].trim()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo & Product Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/20 border border-indigo-400/30 text-white font-bold">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                Smart Incident Hub
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ITSM Automation
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI Incident Intake, Semantic Correlation & ServiceNow Orchestration
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          {[
            { id: 'intake', label: 'Intake & Channels', icon: Radio },
            {
              id: 'queue',
              label: 'Intake Queue',
              icon: Inbox,
              badge: unreviewedCount > 0 ? unreviewedCount : undefined
            },
            { id: 'review', label: 'AI Review & Correlation', icon: Sparkles },
            { id: 'servicenow', label: 'ServiceNow Live', icon: Layers },
            { id: 'dashboard', label: 'Dashboards', icon: BarChart3 },
            { id: 'audit', label: 'Audit Trail', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full">
                    {tab.badge}
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
