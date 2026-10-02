import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Send,
  Layers,
  MessageSquare,
  Clock,
  User,
  Cpu,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import {
  IncidentIntakeRecord,
  IncidentIntent,
  IncidentImpact,
  IncidentUrgency,
  IncidentPriority,
  ServiceNowIncident,
  UserPersona
} from '../types';

interface AIReviewScreenProps {
  intake: IncidentIntakeRecord;
  activePersona: UserPersona;
  existingIncidents: ServiceNowIncident[];
  onApproveAndCreate: (intakeId: string, updatedFields: any, comments: string) => void;
  onLinkDuplicate: (intakeId: string, targetIncidentNumber: string, comments: string) => void;
  onRejectIntake: (intakeId: string, reason: string) => void;
  onSelectAnotherIntake: () => void;
}

export const AIReviewScreen: React.FC<AIReviewScreenProps> = ({
  intake,
  activePersona,
  existingIncidents,
  onApproveAndCreate,
  onLinkDuplicate,
  onRejectIntake,
  onSelectAnotherIntake
}) => {
  const analysis = intake.aiAnalysis;

  // Editable fields state
  const [intent, setIntent] = useState<IncidentIntent>(analysis?.intent || 'Incident');
  const [service, setService] = useState<string>(analysis?.service || 'General IT Service');
  const [category, setCategory] = useState<string>(analysis?.category || 'Enterprise Applications');
  const [subcategory, setSubcategory] = useState<string>(analysis?.subcategory || 'General');
  const [symptom, setSymptom] = useState<string>(analysis?.symptom || '');
  const [impact, setImpact] = useState<IncidentImpact>(analysis?.impact || '1 User');
  const [urgency, setUrgency] = useState<IncidentUrgency>(analysis?.urgency || 'Medium');
  const [priority, setPriority] = useState<IncidentPriority>(analysis?.priority || 'P3 - Moderate');
  const [assignmentGroup, setAssignmentGroup] = useState<string>(
    analysis?.assignmentGroup || 'Service Desk Tier 1'
  );
  const [summary, setSummary] = useState<string>(analysis?.summary || '');
  const [comments, setComments] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  // Correlation target state
  const matchedIncNumber = intake.correlation?.existingIncidentNumber;
  const matchedIncident = existingIncidents.find(inc => inc.number === matchedIncNumber);

  // Recalculate priority automatically if impact or urgency changes
  useEffect(() => {
    let newPri: IncidentPriority = 'P3 - Moderate';
    if (impact === 'Organization / Enterprise' && (urgency === 'Critical' || urgency === 'High')) {
      newPri = 'P1 - Critical';
    } else if (impact === 'Multiple Users' && (urgency === 'Critical' || urgency === 'High')) {
      newPri = 'P2 - High';
    } else if (urgency === 'Critical' || (impact === 'Multiple Users' && urgency === 'Medium')) {
      newPri = 'P2 - High';
    } else if (urgency === 'Low' && impact === '1 User') {
      newPri = 'P4 - Low';
    }
    setPriority(newPri);
  }, [impact, urgency]);

  const handleApprove = () => {
    const updatedFields = {
      intent,
      service,
      category,
      subcategory,
      symptom,
      impact,
      urgency,
      priority,
      assignmentGroup,
      summary
    };
    onApproveAndCreate(intake.id, updatedFields, comments || 'Approved by Service Desk Reviewer.');
  };

  const handleDuplicateLink = () => {
    if (!matchedIncNumber) return;
    onLinkDuplicate(intake.id, matchedIncNumber, comments || `Linked to ${matchedIncNumber} via AI Review.`);
  };

  const handleReject = () => {
    onRejectIntake(intake.id, comments || 'Deflected: Does not qualify as an active IT incident.');
  };

  const confPercent = Math.round((analysis?.confidence ?? 0.88) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/80">
              {intake.intakeNumber}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Source: <strong className="text-slate-200">{intake.source}</strong> ({intake.senderName})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            AI Incident Intelligence & Review
            <span className="text-xs font-mono font-normal bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              Gemini 3.8 Flash
            </span>
          </h1>
        </div>

        <button
          onClick={onSelectAnotherIntake}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          ← Back to Intake Queue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Original Message & Correlation */}
        <div className="lg:col-span-5 space-y-6">
          {/* Original Communication Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Original Inbound Communication
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {new Date(intake.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-200 font-sans leading-relaxed">
              "{intake.rawMessage}"
            </div>

            {/* Sender Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">Sender Name</span>
                <span className="text-slate-200 font-semibold">{intake.senderName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Department</span>
                <span className="text-slate-300">{intake.senderDepartment}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-900">
                <span className="text-[10px] text-slate-400 block">Channel Context</span>
                <span className="text-indigo-300">
                  {intake.channelMetadata?.channelName || intake.channelMetadata?.subject || 'Direct API Intake'}
                </span>
              </div>
            </div>
          </div>

          {/* Semantic Duplicate & Correlation Card (FR-007 / FR-008) */}
          <div className={`border rounded-2xl p-5 space-y-4 transition-all ${
            matchedIncident
              ? 'bg-amber-950/20 border-amber-800/60 text-slate-200'
              : 'bg-slate-900/90 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-amber-300">
                <Layers className="w-4 h-4 text-amber-400" />
                Semantic Correlation & Duplicate Match
              </span>
              {intake.correlation && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {Math.round(intake.correlation.similarityScore * 100)}% Similarity
                </span>
              )}
            </div>

            {matchedIncident ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-900/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-400">
                      Parent Incident: {matchedIncident.number}
                    </span>
                    <span className="text-[11px] px-2 py-0.2 rounded bg-amber-950 text-amber-200 border border-amber-800">
                      {matchedIncident.affectedUsers} Affected Users
                    </span>
                  </div>
                  <p className="font-semibold text-slate-200 line-clamp-2">
                    {matchedIncident.shortDescription}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <strong>Evidence:</strong> {intake.correlation?.evidence}
                  </p>
                </div>

                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Consolidation Benefit:</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Linking will attach this communication to {matchedIncident.number}, increment affected callers, and prevent duplicate ticket noise.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDuplicateLink}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Link as Duplicate to {matchedIncident.number}</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center bg-slate-950/50 rounded-xl border border-slate-800">
                No active duplicate incident found in the 48-hour correlation window.
              </div>
            )}
          </div>

          {/* AI Confidence & Reasoning Gauge */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                AI Confidence Calibration
              </span>
              <span className={`text-xs font-mono font-bold ${
                confPercent >= 90 ? 'text-emerald-400' : confPercent >= 75 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {confPercent}% Certainty
              </span>
            </div>

            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  confPercent >= 90 ? 'bg-emerald-500' : confPercent >= 75 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${confPercent}%` }}
              />
            </div>

            <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">AI Reasoning Summary</span>
              {analysis?.reason || 'Extracted keywords and mapped to reference enterprise service catalog.'}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): AI Interpretation & Human Override Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  AI Classification & Incident Enrichment
                </h3>
                <p className="text-xs text-slate-400">
                  FR-004 / FR-006: Review and adjust parameters before ServiceNow synchronization
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg transition-colors border border-slate-700"
              >
                {isEditing ? 'Lock Form' : 'Edit Fields'}
              </button>
            </div>

            {/* Editable Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Intent */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Detected Intent (Taxonomy)
                </label>
                <select
                  disabled={!isEditing}
                  value={intent}
                  onChange={e => setIntent(e.target.value as IncidentIntent)}
                  className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                >
                  <option value="Incident">Incident (Operational Interruption)</option>
                  <option value="Service Request">Service Request (Provisioning / Access)</option>
                  <option value="Problem Report">Problem Report (Widespread Outage)</option>
                  <option value="Information Request">Information Request (FAQ / Status)</option>
                  <option value="Change Request">Change Request (RFC)</option>
                  <option value="Non-IT">Non-IT (Facilities / General)</option>
                </select>
              </div>

              {/* Service */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Affected Service (CMDB)
                </label>
                <select
                  disabled={!isEditing}
                  value={service}
                  onChange={e => setService(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                >
                  <option value="SAP ERP">SAP ERP</option>
                  <option value="Corporate VPN">Corporate VPN</option>
                  <option value="Microsoft 365 / Outlook">Microsoft 365 / Outlook</option>
                  <option value="Workday HR">Workday HR</option>
                  <option value="Salesforce CRM">Salesforce CRM</option>
                  <option value="Identity & Access (Okta / Entra)">Identity & Access (Okta / Entra)</option>
                  <option value="Local Office WiFi & LAN">Local Office WiFi & LAN</option>
                  <option value="Customer Billing Gateway">Customer Billing Gateway</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Subcategory
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={subcategory}
                  onChange={e => setSubcategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Impact */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Impact
                </label>
                <select
                  disabled={!isEditing}
                  value={impact}
                  onChange={e => setImpact(e.target.value as IncidentImpact)}
                  className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                >
                  <option value="1 User">1 User (Individual)</option>
                  <option value="Multiple Users">Multiple Users (Department / Site)</option>
                  <option value="Organization / Enterprise">Organization / Enterprise (Critical)</option>
                </select>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Urgency
                </label>
                <select
                  disabled={!isEditing}
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as IncidentUrgency)}
                  className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Priority (Calculated) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Computed Priority (Impact × Urgency)
                </label>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-2 rounded-xl text-xs font-bold w-full text-center ${
                    priority.startsWith('P1')
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : priority.startsWith('P2')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {priority}
                  </span>
                </div>
              </div>

              {/* Assignment Group */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Assignment Group
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={assignmentGroup}
                  onChange={e => setAssignmentGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Extracted Symptom */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Extracted Symptom & Error
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={symptom}
                  onChange={e => setSymptom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Short Summary */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  ServiceNow Short Description
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Reviewer Comments */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Reviewer Notes / Work Notes (Appended to ServiceNow Ticket)
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="e.g. Verified with user on Teams. Validated SAP PRD server response..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-300 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject / Deflect</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Save Edits & Sync to ServiceNow' : 'Approve & Create ServiceNow Ticket'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
