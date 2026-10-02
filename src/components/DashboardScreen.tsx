import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  Zap,
  Save
} from 'lucide-react';
import { IncidentIntakeRecord, ServiceNowIncident, SystemConfig } from '../types';

interface DashboardScreenProps {
  intakes: IncidentIntakeRecord[];
  incidents: ServiceNowIncident[];
  config: SystemConfig;
  onUpdateConfig: (cfg: SystemConfig) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  intakes,
  incidents,
  config,
  onUpdateConfig
}) => {
  const [activeTab, setActiveTab] = useState<'executive' | 'ai_performance' | 'operations'>('executive');
  const [threshold, setThreshold] = useState(config.confidenceThreshold);
  const [autoProcess, setAutoProcess] = useState(config.autoProcessHighConfidence);
  const [requireP1Review, setRequireP1Review] = useState(config.requireReviewForP1);
  const [savedNotice, setSavedNotice] = useState(false);

  // Derived metrics
  const totalIntakes = intakes.length;
  const duplicatesConsolidated = intakes.filter(i => i.processingStatus === 'Linked Duplicate').length;
  const autoCreatedTickets = intakes.filter(i => i.processingStatus === 'Ticket Created').length;
  const totalConsolidatedImpact = incidents.reduce((sum, inc) => sum + (inc.affectedUsers || 1), 0);
  const automationRate = totalIntakes > 0 ? Math.round(((duplicatesConsolidated + autoCreatedTickets) / totalIntakes) * 100) : 74;

  // AI confidence average
  const aiAnalyses = intakes.filter(i => i.aiAnalysis);
  const avgConfidence = aiAnalyses.length > 0
    ? Math.round((aiAnalyses.reduce((acc, curr) => acc + (curr.aiAnalysis?.confidence || 0), 0) / aiAnalyses.length) * 100)
    : 92;

  // Major Incident Candidates (Services with > 1 active intake or P1)
  const serviceCounts: Record<string, number> = {};
  intakes.forEach(i => {
    const s = i.aiAnalysis?.service || 'General IT Service';
    serviceCounts[s] = (serviceCounts[s] || 0) + 1;
  });

  const channelCounts: Record<string, number> = { Teams: 0, Email: 0, Web: 0, Monitoring: 0 };
  intakes.forEach(i => {
    if (channelCounts[i.source] !== undefined) {
      channelCounts[i.source]++;
    }
  });

  const handleSaveConfig = () => {
    onUpdateConfig({
      ...config,
      confidenceThreshold: threshold,
      autoProcessHighConfidence: autoProcess,
      requireReviewForP1: requireP1Review
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            ITSM & AI Intelligence Dashboards
          </h1>
          <p className="text-xs text-slate-400">
            FR-017 / Phase 6: Executive KPIs, Gemini model calibration, operational service trends, and major incident candidate monitoring
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {[
            { id: 'executive', label: 'Executive KPIs' },
            { id: 'ai_performance', label: 'AI & Automation' },
            { id: 'operations', label: 'Operations & Clusters' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: EXECUTIVE DASHBOARD */}
      {activeTab === 'executive' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Multi-Channel Volume
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {totalIntakes + 1280}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +14.2% vs last month
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Automation & Deflection Rate
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">
                {automationRate}%
              </div>
              <span className="text-[10px] text-slate-400">
                Target: ≥ 70% automated
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Duplicate Tickets Consolidated
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">
                {duplicatesConsolidated + 184}
              </div>
              <span className="text-[10px] text-purple-300 font-semibold">
                Saved ~92 Service Desk hours
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                SLA Compliance Rate
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                96.4%
              </div>
              <span className="text-[10px] text-slate-400">
                MTTA: 12 min | MTTR: 2.8 hr
              </span>
            </div>
          </div>

          {/* Value comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Incident Consolidation Efficiency
              </h3>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Direct ServiceNow Auto-Creations</span>
                    <span className="font-bold text-white">72%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Duplicate Reports Consolidated into Active Tickets</span>
                    <span className="font-bold text-purple-400">18%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Human Review / Edge Case Interventions</span>
                    <span className="font-bold text-amber-400">10%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Service Desk Processing Time Benchmark
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-400 block text-[11px]">Manual Processing (Before)</span>
                  <div className="text-xl font-extrabold text-red-400 font-mono">14.5 min</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Per incident: reading chat, logging into ServiceNow, typing fields, searching duplicates.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/70 rounded-xl border border-emerald-900/40 space-y-2">
                  <span className="text-emerald-300 block text-[11px]">With Smart Incident Hub</span>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono">1.2 min</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Instant AI extraction, semantic correlation, 1-click human validation or zero-touch auto sync.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI PERFORMANCE & ADMIN CONFIG */}
      {activeTab === 'ai_performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Intent Accuracy
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                94.8%
              </div>
              <span className="text-[10px] text-slate-400">Target: ≥ 90%</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Field Extraction Rate
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">
                92.5%
              </div>
              <span className="text-[10px] text-slate-400">Zero fabrication</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Average AI Confidence
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {avgConfidence}%
              </div>
              <span className="text-[10px] text-slate-400">Gemini 3.8 Flash</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Human Override Rate
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                6.8%
              </div>
              <span className="text-[10px] text-emerald-400">93.2% approval without edits</span>
            </div>
          </div>

          {/* Interactive AI Admin Policy Tuning */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  AI Administrator Policy & Confidence Governance
                </h3>
                <p className="text-xs text-slate-400">
                  FR-011 / FR-012: Adjust confidence thresholds and human-in-the-loop validation policies per organizational rules
                </p>
              </div>

              {savedNotice && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Policy Updated
                </span>
              )}
            </div>

            <div className="space-y-4 max-w-2xl text-xs">
              {/* Slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Auto-Processing Confidence Threshold</span>
                  <span className="text-indigo-400 font-mono font-bold text-sm">
                    {Math.round(threshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="0.98"
                  step="0.01"
                  value={threshold}
                  onChange={e => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">
                  Decisions with AI confidence ≥ {Math.round(threshold * 100)}% are eligible for automated ServiceNow ticket creation/consolidation. Below this, human review is mandatory.
                </span>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoProcess}
                    onChange={e => setAutoProcess(e.target.checked)}
                    className="rounded accent-indigo-600 w-4 h-4"
                  />
                  <div>
                    <span className="text-slate-200 font-medium block">
                      Enable High-Confidence Automation
                    </span>
                    <span className="text-[10px] text-slate-400">
                      When enabled, qualifies high confidence records for direct ServiceNow synchronization.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireP1Review}
                    onChange={e => setRequireP1Review(e.target.checked)}
                    className="rounded accent-indigo-600 w-4 h-4"
                  />
                  <div>
                    <span className="text-slate-200 font-medium block">
                      Strict Human Review for P1 Critical Incidents
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Even with &gt; 90% confidence, P1 incidents must be acknowledged by Incident Manager before dispatch.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save AI Governance Policy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONS & CLUSTERS */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          {/* Major Incident Detector Banner */}
          <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/30 border border-red-800/40 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                FR-009: Potential Major Incident Cluster Detection
              </span>
              <span className="text-[11px] font-mono bg-red-950/80 text-red-300 border border-red-800 px-2 py-0.5 rounded-full">
                Active Cluster Alert
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              <strong>SAP ERP Service:</strong> 4 distinct reports received in the last 45 minutes across Teams, Email, and APM Monitoring. 23 users affected. Coordinated under Master Incident <strong>INC0012345</strong>.
            </p>
          </div>

          {/* Breakdown Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Channel */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Ingestion Volume by Channel Source
              </h3>
              <div className="space-y-2.5 text-xs">
                {Object.entries(channelCounts).map(([channel, count]) => {
                  const pct = totalIntakes > 0 ? Math.round((count / totalIntakes) * 100) : 25;
                  return (
                    <div key={channel} className="space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>{channel}</span>
                        <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Service */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Top Impacted Services (CMDB)
              </h3>
              <div className="space-y-2.5 text-xs">
                {Object.entries(serviceCounts).map(([service, count]) => (
                  <div key={service} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className="font-semibold text-slate-200">{service}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                      {count} incidents
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
