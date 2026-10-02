import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Cpu,
  User,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { AuditLogEntry, IncidentIntakeRecord } from '../types';

interface AuditTrailScreenProps {
  logs: AuditLogEntry[];
  intakes: IncidentIntakeRecord[];
}

export const AuditTrailScreen: React.FC<AuditTrailScreenProps> = ({ logs, intakes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntakeId, setSelectedIntakeId] = useState<string>('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.intakeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.incidentNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIntake = selectedIntakeId === 'ALL' || log.intakeId === selectedIntakeId;

    return matchesSearch && matchesIntake;
  });

  const getActorBadge = (actorType: AuditLogEntry['actorType']) => {
    switch (actorType) {
      case 'AI System':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-mono">
            <Cpu className="w-3 h-3" /> AI Engine
          </span>
        );
      case 'ServiceNow Gateway':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
            <Layers className="w-3 h-3" /> ServiceNow API
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 font-mono">
            <User className="w-3 h-3" /> User / Agent
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            End-to-End Audit & Lineage Trail
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono font-normal">
              FR-018
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Immutable chain: Original Message → AI Understanding → Semantic Correlation → Human Oversight → ServiceNow Action
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-slate-300 font-mono">100% Traceability Enforced</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by actor, event, intake ID, or details..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedIntakeId}
          onChange={e => setSelectedIntakeId(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
        >
          <option value="ALL">All Intake Chains</option>
          {intakes.map(item => (
            <option key={item.intakeNumber} value={item.intakeNumber}>
              {item.intakeNumber} ({item.source})
            </option>
          ))}
        </select>
      </div>

      {/* Audit Timeline List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No audit records found matching your active filter.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="relative group">
                <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-900 group-hover:scale-125 transition-transform"></span>

                <div className="p-4 bg-slate-950/70 border border-slate-800/90 rounded-xl space-y-2 text-xs hover:border-slate-700 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-400">{log.intakeId}</span>
                      {log.incidentNumber && (
                        <span className="font-mono text-[11px] bg-slate-900 text-purple-300 px-2 py-0.2 rounded border border-slate-700">
                          {log.incidentNumber}
                        </span>
                      )}
                      <span className="font-bold text-slate-100">{log.event}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {getActorBadge(log.actorType)}
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed font-sans">{log.details}</p>

                  {(log.previousState || log.newState) && (
                    <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-400">
                      <span>Status transition:</span>
                      {log.previousState && (
                        <>
                          <span className="text-slate-400">{log.previousState}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        </>
                      )}
                      <span className="text-emerald-400 font-bold">{log.newState}</span>
                      <span className="text-slate-500 ml-auto">Actor: {log.actor}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
