import React, { useState } from 'react';
import {
  Layers,
  Users,
  Clock,
  Activity,
  MessageSquare,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Plus,
  ArrowRight,
  Filter,
  CheckSquare
} from 'lucide-react';
import { ServiceNowIncident } from '../types';

interface ServiceNowViewProps {
  incidents: ServiceNowIncident[];
  selectedIncident: ServiceNowIncident | null;
  onSelectIncident: (inc: ServiceNowIncident) => void;
  onAddWorkNote: (incidentId: string, noteText: string) => void;
  onResolveIncident: (incidentId: string, resolutionCode: string, notes: string) => void;
}

export const ServiceNowView: React.FC<ServiceNowViewProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onAddWorkNote,
  onResolveIncident
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'notes'>('details');
  const [newWorkNote, setNewWorkNote] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionCode, setResolutionCode] = useState('Permanent Software Fix');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Default to first incident if none selected
  const currentInc = selectedIncident || incidents[0] || null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkNote.trim() || !currentInc) return;
    onAddWorkNote(currentInc.id, newWorkNote);
    setNewWorkNote('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInc) return;
    onResolveIncident(currentInc.id, resolutionCode, resolutionNotes || 'Resolved per standard runbook.');
    setShowResolveModal(false);
    setResolutionNotes('');
  };

  if (!currentInc) {
    return (
      <div className="text-center py-16 text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
        No ServiceNow incidents active in the system backlog.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            ServiceNow Incident Management
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
              Live Synchronized
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            FR-014 / FR-015: Master record view with automated duplicate consolidation and multi-channel timeline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total Active ITSM Records:</span>
          <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-bold text-indigo-400">
            {incidents.length}
          </span>
        </div>
      </div>

      {/* Main Grid: Left List (4 cols) & Right Details (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Incident Records
          </span>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {incidents.map(inc => {
              const isSelected = currentInc.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-600/10'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-indigo-400">{inc.number}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      inc.priority.startsWith('P1')
                        ? 'bg-red-500/20 text-red-300'
                        : inc.priority.startsWith('P2')
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {inc.priority.split('-')[0].trim()}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-200 line-clamp-1 mb-2">
                    {inc.shortDescription}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>{inc.service}</span>
                    <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                      <Users className="w-3 h-3" />
                      <span>{inc.affectedUsers} users</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Incident Details (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-indigo-400">{currentInc.number}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    currentInc.status === 'Resolved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {currentInc.status}
                  </span>
                  <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                    {currentInc.priority}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white leading-snug">
                  {currentInc.shortDescription}
                </h2>
              </div>

              {currentInc.status !== 'Resolved' && (
                <button
                  onClick={() => setShowResolveModal(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Resolve Incident</span>
                </button>
              )}
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Affected Callers</span>
                <span className="text-purple-300 font-extrabold text-sm flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {currentInc.affectedUsers} Users
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Assignment Group</span>
                <span className="text-slate-200 font-semibold">{currentInc.assignmentGroup}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Assigned Engineer</span>
                <span className="text-slate-200">{currentInc.assignedTo}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">AI Confidence</span>
                <span className="text-emerald-400 font-bold">
                  {(currentInc.aiConfidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 text-xs gap-3">
              {[
                { id: 'details', label: 'Technical Details & CMDB' },
                { id: 'timeline', label: 'Channel Correlation Timeline' },
                { id: 'notes', label: `Work Notes (${currentInc.workNotes.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-2.5 font-semibold transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Details */}
            {activeTab === 'details' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1">
                    Full Incident Description
                  </span>
                  <p className="text-slate-200 leading-relaxed font-sans">{currentInc.description}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Configuration Item (CI)</span>
                    <span className="font-mono text-indigo-300 font-semibold">{currentInc.ci}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Category / Subcategory</span>
                    <span className="text-slate-200">{currentInc.category} / {currentInc.subcategory}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Caller / Location</span>
                    <span className="text-slate-200">{currentInc.caller} ({currentInc.location})</span>
                  </div>
                </div>

                {/* Related Intakes List */}
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    Consolidated Channel Intakes ({currentInc.relatedIntakes.length} Reports)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentInc.relatedIntakes.map(num => (
                      <span
                        key={num}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg font-mono text-indigo-300 font-semibold"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                {currentInc.resolution && (
                  <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl space-y-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Resolution Record: {currentInc.resolution.code}
                    </span>
                    <p className="text-slate-300 text-xs">{currentInc.resolution.notes}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Resolved by {currentInc.resolution.resolvedBy} at {new Date(currentInc.resolution.resolvedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-3 text-xs">
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <div className="text-slate-200 font-semibold">Incident Registered in ServiceNow</div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(currentInc.createdTime).toLocaleString()}
                    </span>
                  </div>

                  {currentInc.evidenceNotes.map((ev, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      <div className="text-slate-200">{ev}</div>
                      <span className="text-[10px] text-slate-400 font-mono">Channel Correlation Evidence</span>
                    </div>
                  ))}

                  {currentInc.resolution && (
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <div className="text-emerald-300 font-semibold">Incident Marked Resolved</div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(currentInc.resolution.resolvedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Work Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4 text-xs">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newWorkNote}
                    onChange={e => setNewWorkNote(e.target.value)}
                    placeholder="Enter technician work notes or status update..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newWorkNote.trim()}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Post Work Note
                    </button>
                  </div>
                </form>

                <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                  {currentInc.workNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        note.isSystem
                          ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                          : 'bg-indigo-950/20 border-indigo-900/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-300">{note.author}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed">{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolve Incident Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              Resolve Incident {currentInc.number}
            </h3>

            <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Resolution Code
                </label>
                <select
                  value={resolutionCode}
                  onChange={e => setResolutionCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Permanent Software Fix">Permanent Software Fix</option>
                  <option value="Resolved by Workaround / Cache Clear">Resolved by Workaround / Cache Clear</option>
                  <option value="Infrastructure Failover / Reboot">Infrastructure Failover / Reboot</option>
                  <option value="User Training / Self-Resolved">User Training / Self-Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Detail root cause and fix applied..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
