import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  MessageSquare,
  Mail,
  Activity,
  Globe,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ChannelSource, IncidentIntakeRecord, ServiceNowIncident, UserPersona } from '../types';
import { SIMULATION_TEMPLATES } from '../data/mockData';

interface IntakeScreenProps {
  onIngestMessage: (
    message: string,
    source: ChannelSource,
    channelMeta?: Record<string, string>
  ) => Promise<IncidentIntakeRecord>;
  activePersona: UserPersona;
  userIncidents: ServiceNowIncident[];
  userIntakes: IncidentIntakeRecord[];
  onSelectIncident: (inc: ServiceNowIncident) => void;
  onNavigateToReview: (intake: IncidentIntakeRecord) => void;
}

export const IntakeScreen: React.FC<IntakeScreenProps> = ({
  onIngestMessage,
  activePersona,
  userIncidents,
  userIntakes,
  onSelectIncident,
  onNavigateToReview
}) => {
  const [selectedSource, setSelectedSource] = useState<ChannelSource>('Teams');
  const [messageText, setMessageText] = useState('');
  const [channelMetaSubject, setChannelMetaSubject] = useState('');
  const [channelMetaName, setChannelMetaName] = useState('#finance-operations');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCreatedIntake, setLastCreatedIntake] = useState<IncidentIntakeRecord | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || isProcessing) return;

    setIsProcessing(true);
    setLastCreatedIntake(null);

    const meta: Record<string, string> = {};
    if (selectedSource === 'Teams') {
      meta.channelName = channelMetaName || '#it-helpdesk';
    } else if (selectedSource === 'Email') {
      meta.subject = channelMetaSubject || 'IT Incident Report';
    } else if (selectedSource === 'Monitoring') {
      meta.alertSource = 'Dynatrace APM Cluster 01';
    }

    try {
      const record = await onIngestMessage(messageText, selectedSource, meta);
      setLastCreatedIntake(record);
      setMessageText('');
    } catch (err) {
      console.error('Ingest error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectTemplate = (template: typeof SIMULATION_TEMPLATES[0]) => {
    setSelectedSource(template.source);
    setMessageText(template.text);
    if (template.source === 'Email') {
      setChannelMetaSubject('Urgent IT Help: Interruption of work');
    } else if (template.source === 'Teams') {
      setChannelMetaName('#urgent-it-incidents');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Channel Ingestion & Real-Time Orchestration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Report an Incident or Ingest Multi-Channel Traffic
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Report issues in simple plain language. The platform normalizes input, extracts technical context, correlates against active ServiceNow incidents, and orchestrates resolution with human oversight.
          </p>
        </div>
      </div>

      {/* Main reporting and simulation grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ingestion Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
            {/* Channel Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Simulated Inbound Channel Source
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Teams', label: 'Microsoft Teams', icon: MessageSquare, desc: 'Chat / Channels' },
                  { id: 'Email', label: 'Outlook Email', icon: Mail, desc: 'Incoming Mailbox' },
                  { id: 'Web', label: 'Self-Service Web', icon: Globe, desc: 'Employee Portal' },
                  { id: 'Monitoring', label: 'Monitoring Alert', icon: Activity, desc: 'Dynatrace / Nagios' }
                ].map(channel => {
                  const Icon = channel.icon;
                  const isSelected = selectedSource === channel.id;
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setSelectedSource(channel.id as ChannelSource)}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{channel.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{channel.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contextual Channel Fields */}
            {selectedSource === 'Teams' && (
              <div className="mb-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Channel Name:</span>
                  <input
                    type="text"
                    value={channelMetaName}
                    onChange={e => setChannelMetaName(e.target.value)}
                    placeholder="#it-support-global"
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 flex-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <span className="text-slate-400 font-mono text-[11px]">Teams Graph API Webhook</span>
              </div>
            )}

            {selectedSource === 'Email' && (
              <div className="mb-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs flex items-center gap-3">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Email Subject:</span>
                  <input
                    type="text"
                    value={channelMetaSubject}
                    onChange={e => setChannelMetaSubject(e.target.value)}
                    placeholder="e.g. Cannot access SAP ERP module"
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 flex-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <span className="text-slate-400 font-mono text-[11px]">Exchange Connector</span>
              </div>
            )}

            {selectedSource === 'Monitoring' && (
              <div className="mb-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs flex items-center gap-3">
                <Activity className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex-1 text-slate-300">
                  <span className="font-semibold text-amber-300">Alert Webhook Ingestion:</span> APM telemetry collector active (Dynatrace / Nagios REST bridge).
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Tell us what is happening (Free text message)
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Sender: {activePersona.name} ({activePersona.department})
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="e.g. I cannot access SAP since 10:15 AM. Getting Error 500 when opening finance closing module..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              {/* Submit CTA */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>AI grounds in CMDB reference; no fabricated data</span>
                </div>

                <button
                  type="submit"
                  disabled={!messageText.trim() || isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Analyzing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Ingest & Process Incident</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Last Ingested Feedback Result Card */}
            {lastCreatedIntake && (
              <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Intake Generated: {lastCreatedIntake.intakeNumber}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px]">
                    Status: {lastCreatedIntake.processingStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Intent</span>
                    <span className="text-indigo-300 font-bold">{lastCreatedIntake.aiAnalysis?.intent}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Service</span>
                    <span className="text-slate-200">{lastCreatedIntake.aiAnalysis?.service}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Priority</span>
                    <span className="text-amber-300 font-bold">{lastCreatedIntake.aiAnalysis?.priority}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">AI Confidence</span>
                    <span className="text-emerald-300 font-bold">
                      {((lastCreatedIntake.aiAnalysis?.confidence ?? 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {lastCreatedIntake.correlation?.existingIncidentNumber && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>
                        Duplicate Candidate Found: <strong>{lastCreatedIntake.correlation.existingIncidentNumber}</strong> (
                        {((lastCreatedIntake.correlation.similarityScore ?? 0) * 100).toFixed(0)}% similarity)
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onNavigateToReview(lastCreatedIntake)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
                  >
                    <span>View AI Review Screen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Test Scenarios */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Quick PRD Test Ingestion Presets
              </span>
              <span className="text-[11px] text-slate-400">Click to populate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SIMULATION_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className="p-3 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/90 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-indigo-300 group-hover:text-indigo-200">
                      {tpl.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {tpl.source}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    "{tpl.text}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: User's Incidents & Active Status */}
        <div className="space-y-6">
          {/* Active Incidents Overview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                My Active Incidents & Status
              </h3>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-mono">
                {userIncidents.length} active
              </span>
            </div>

            {userIncidents.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-950/50 rounded-xl border border-slate-800/60 p-4">
                No active incidents found.
              </div>
            ) : (
              <div className="space-y-2.5">
                {userIncidents.map(inc => (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="p-3 bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 rounded-xl cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-indigo-400">{inc.number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inc.priority.startsWith('P1')
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : inc.priority.startsWith('P2')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {inc.priority.split('-')[0].trim()}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {inc.shortDescription}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      <span>{inc.service}</span>
                      <span className="text-emerald-400 font-medium">{inc.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Architecture Snapshot Card */}
          <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-800/30 rounded-2xl p-5 text-xs space-y-3">
            <h4 className="font-bold text-indigo-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Automated Flow Pipeline
            </h4>
            <div className="space-y-2 text-slate-300 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-300">1</span>
                <span>Collect Multi-Channel Messages</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-300">2</span>
                <span>Intent & Entity Extraction (Gemini)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-300">3</span>
                <span>Semantic Duplicate & Correlation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-300">4</span>
                <span>Enrichment & Human Oversight</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-300">5</span>
                <span>ServiceNow Ticket Sync & User Notice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
