import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Mail,
  Globe,
  Activity,
  ChevronRight,
  ShieldAlert,
  Layers,
  FileCheck2
} from 'lucide-react';
import { ChannelSource, IncidentIntakeRecord, IncidentIntent, IntakeStatus } from '../types';

interface QueueScreenProps {
  intakes: IncidentIntakeRecord[];
  onSelectIntakeForReview: (intake: IncidentIntakeRecord) => void;
  onOpenServiceNowIncident: (incidentNumber: string) => void;
}

export const QueueScreen: React.FC<QueueScreenProps> = ({
  intakes,
  onSelectIntakeForReview,
  onOpenServiceNowIncident
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [intentFilter, setIntentFilter] = useState<string>('ALL');

  const filteredIntakes = intakes.filter(item => {
    const matchesSearch =
      item.intakeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rawMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.aiAnalysis?.service || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource = sourceFilter === 'ALL' || item.source === sourceFilter;
    const matchesStatus = statusFilter === 'ALL' || item.processingStatus === statusFilter;
    const matchesIntent = intentFilter === 'ALL' || item.aiAnalysis?.intent === intentFilter;

    return matchesSearch && matchesSource && matchesStatus && matchesIntent;
  });

  const getSourceIcon = (source: ChannelSource) => {
    switch (source) {
      case 'Teams':
        return <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Email':
        return <Mail className="w-3.5 h-3.5 text-sky-400" />;
      case 'Monitoring':
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getStatusBadge = (status: IntakeStatus) => {
    switch (status) {
      case 'Needs Review':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Needs Review
          </span>
        );
      case 'Linked Duplicate':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Duplicate Linked
          </span>
        );
      case 'Ticket Created':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ticket Created
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            Deflected / Filtered
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            Incident Intake Queue
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono font-normal">
              {filteredIntakes.length} records
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            FR-001 / FR-003: Multi-channel ingested records awaiting validation, routing, or automated ServiceNow sync
          </p>
        </div>

        {/* Status Counts */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <span className="text-slate-400">Needs Review:</span>
            <span className="font-bold text-amber-400">
              {intakes.filter(i => i.processingStatus === 'Needs Review').length}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <span className="text-slate-400">Duplicates Linked:</span>
            <span className="font-bold text-purple-400">
              {intakes.filter(i => i.processingStatus === 'Linked Duplicate').length}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <span className="text-slate-400">Tickets Synced:</span>
            <span className="font-bold text-emerald-400">
              {intakes.filter(i => i.processingStatus === 'Ticket Created').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Intake ID, text, sender, or service..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Channel Source Filter */}
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Sources</option>
            <option value="Teams">Microsoft Teams</option>
            <option value="Email">Outlook Email</option>
            <option value="Web">Web Portal</option>
            <option value="Monitoring">Monitoring Alert</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Ticket Created">Ticket Created</option>
            <option value="Linked Duplicate">Linked Duplicate</option>
            <option value="Rejected">Deflected / Rejected</option>
          </select>

          {/* Intent Filter */}
          <select
            value={intentFilter}
            onChange={e => setIntentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Intents</option>
            <option value="Incident">Incident</option>
            <option value="Service Request">Service Request</option>
            <option value="Problem Report">Problem Report</option>
            <option value="Non-IT">Non-IT</option>
          </select>
        </div>
      </div>

      {/* Intake Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Intake ID</th>
                <th className="p-3.5">Source & Sender</th>
                <th className="p-3.5">Raw Communication</th>
                <th className="p-3.5">AI Intent & Service</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">AI Confidence</th>
                <th className="p-3.5">Processing Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredIntakes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No intake records match your active search and filters.
                  </td>
                </tr>
              ) : (
                filteredIntakes.map(item => {
                  const conf = item.aiAnalysis?.confidence ?? 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectIntakeForReview(item)}
                    >
                      {/* ID */}
                      <td className="p-3.5 font-mono font-bold text-indigo-400 whitespace-nowrap">
                        {item.intakeNumber}
                      </td>

                      {/* Source & Sender */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          {getSourceIcon(item.source)}
                          <span>{item.source}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.senderName}
                        </div>
                      </td>

                      {/* Message Preview */}
                      <td className="p-3.5 max-w-xs sm:max-w-sm">
                        <p className="line-clamp-2 text-slate-300 leading-relaxed font-sans">
                          {item.rawMessage}
                        </p>
                      </td>

                      {/* AI Intent & Service */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">
                          {item.aiAnalysis?.service || 'Processing...'}
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          item.aiAnalysis?.intent === 'Incident'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : item.aiAnalysis?.intent === 'Problem Report'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.aiAnalysis?.intent || 'Analyzing'}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="p-3.5 whitespace-nowrap">
                        {item.aiAnalysis?.priority ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.aiAnalysis.priority.startsWith('P1')
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : item.aiAnalysis.priority.startsWith('P2')
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {item.aiAnalysis.priority.split('-')[0].trim()}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* AI Confidence */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                conf >= 0.90 ? 'bg-emerald-400' : conf >= 0.75 ? 'bg-amber-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${conf * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-300">
                            {(conf * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        {getStatusBadge(item.processingStatus)}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {item.serviceNowIncidentId ? (
                            <button
                              onClick={() => onOpenServiceNowIncident(item.serviceNowIncidentId!)}
                              className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Layers className="w-3 h-3" />
                              <span>{item.serviceNowIncidentId}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectIntakeForReview(item)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Review</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
