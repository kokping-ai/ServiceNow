import {
  IncidentIntakeRecord,
  ServiceNowIncident,
  AuditLogEntry,
  SystemConfig,
  AIAnalysisRecord,
  UserPersona,
  ChannelSource
} from '../types';
import {
  INITIAL_CONFIG,
  INITIAL_INTAKE_RECORDS,
  INITIAL_SERVICENOW_INCIDENTS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';

const STORAGE_KEYS = {
  INTAKES: 'sih_intakes_v2',
  INCIDENTS: 'sih_incidents_v2',
  AUDIT: 'sih_audit_v2',
  CONFIG: 'sih_config_v2'
};

export function getStoredIntakes(): IncidentIntakeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTAKES);
    return raw ? JSON.parse(raw) : INITIAL_INTAKE_RECORDS;
  } catch {
    return INITIAL_INTAKE_RECORDS;
  }
}

export function saveStoredIntakes(items: IncidentIntakeRecord[]) {
  localStorage.setItem(STORAGE_KEYS.INTAKES, JSON.stringify(items));
}

export function getStoredIncidents(): ServiceNowIncident[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
    return raw ? JSON.parse(raw) : INITIAL_SERVICENOW_INCIDENTS;
  } catch {
    return INITIAL_SERVICENOW_INCIDENTS;
  }
}

export function saveStoredIncidents(items: ServiceNowIncident[]) {
  localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(items));
}

export function getStoredAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveStoredAuditLogs(items: AuditLogEntry[]) {
  localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(items));
}

export function getStoredConfig(): SystemConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return raw ? JSON.parse(raw) : INITIAL_CONFIG;
  } catch {
    return INITIAL_CONFIG;
  }
}

export function saveStoredConfig(cfg: SystemConfig) {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
}

// Record an audit entry
export function recordAudit(
  intakeId: string,
  actor: string,
  actorType: 'User' | 'AI System' | 'ServiceNow Gateway',
  event: string,
  details: string,
  incidentNumber?: string,
  previousState?: string,
  newState?: string
) {
  const current = getStoredAuditLogs();
  const entry: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    intakeId,
    incidentNumber,
    timestamp: new Date().toISOString(),
    actor,
    actorType,
    event,
    details,
    previousState,
    newState
  };
  const updated = [entry, ...current];
  saveStoredAuditLogs(updated);
  return entry;
}

// Call backend AI analysis endpoint
export async function analyzeIncidentWithAI(
  message: string,
  source: string,
  user: string,
  existingIncidents: ServiceNowIncident[]
): Promise<any> {
  try {
    const response = await fetch('/api/ai/analyze-incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        source,
        user,
        timestamp: new Date().toISOString(),
        existingIncidents
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Backend AI route failed, using client-side fallback heuristic:', error);
    // Client-side quick fallback
    return {
      intent: 'Incident',
      intentConfidence: 0.91,
      service: message.toLowerCase().includes('sap') ? 'SAP ERP' : (message.toLowerCase().includes('vpn') ? 'Corporate VPN' : 'Enterprise Applications'),
      category: 'Enterprise Applications',
      subcategory: 'General IT Problem',
      ci: 'SYS-GLOBAL-APP',
      symptom: 'Service Accessibility Interruption',
      device: 'Company Laptop',
      location: 'Kuala Lumpur Office',
      errorCode: 'None / Not Provided',
      duration: 'Unknown / Not Provided',
      businessImpact: 'User productivity degradation',
      urgency: 'Medium',
      impact: '1 User',
      priority: 'P3 - Moderate',
      assignmentGroup: 'Service Desk Tier 1',
      summary: `Incident: Reported via ${source}`,
      reason: 'Rule-based client fallback classification',
      confidence: 0.89,
      requiresHumanReview: true,
      correlation: {
        correlationType: 'Independent',
        matchedIncidentNumber: null,
        similarityScore: 0.2,
        evidence: 'No active duplicate identified.'
      },
      majorIncidentCandidate: false,
      modelVersion: 'gemini-3.8-flash (Fallback Mode)'
    };
  }
}

// Orchestrator: Ingest new communication & process through pipeline
export async function ingestNewCommunication(
  rawMessage: string,
  source: ChannelSource,
  sender: UserPersona,
  channelMetadata?: Record<string, string>
): Promise<IncidentIntakeRecord> {
  const intakes = getStoredIntakes();
  const incidents = getStoredIncidents();
  const config = getStoredConfig();

  const intakeNumber = `INT-${10000 + intakes.length + 1}`;
  const intakeId = `int-${Date.now()}`;

  // Initial Intake record
  const newIntake: IncidentIntakeRecord = {
    id: intakeId,
    intakeNumber,
    source,
    senderName: sender.name,
    senderEmail: sender.email,
    senderDepartment: sender.department,
    timestamp: new Date().toISOString(),
    rawMessage,
    channelMetadata,
    processingStatus: 'Pending AI'
  };

  recordAudit(
    intakeNumber,
    sender.name,
    'User',
    'Message Ingested',
    `Raw message captured from ${source} (${channelMetadata?.channelName || channelMetadata?.subject || 'Direct'}).`,
    undefined,
    undefined,
    'Pending AI'
  );

  // AI Pipeline Execution
  const aiResult = await analyzeIncidentWithAI(rawMessage, source, sender.name, incidents);

  const aiAnalysisRecord: AIAnalysisRecord = {
    id: `ai-${Date.now()}`,
    intakeId,
    intent: aiResult.intent || 'Incident',
    intentConfidence: aiResult.intentConfidence || 0.92,
    service: aiResult.service || 'General IT Service',
    category: aiResult.category || 'End User Computing',
    subcategory: aiResult.subcategory || 'General Support',
    ci: aiResult.ci || 'IT-INFRA-UNKNOWN',
    symptom: aiResult.symptom || 'Unspecified technical issue',
    device: aiResult.device || 'Unknown / Not Provided',
    location: aiResult.location || 'Unknown / Not Provided',
    errorCode: aiResult.errorCode || 'None / Not Provided',
    duration: aiResult.duration || 'Unknown / Not Provided',
    businessImpact: aiResult.businessImpact || 'Standard operational delay',
    urgency: aiResult.urgency || 'Medium',
    impact: aiResult.impact || '1 User',
    priority: aiResult.priority || 'P3 - Moderate',
    assignmentGroup: aiResult.assignmentGroup || 'Service Desk Tier 1',
    summary: aiResult.summary || `${aiResult.service}: Ingested from ${source}`,
    reason: aiResult.reason || 'AI analysis completed.',
    confidence: aiResult.confidence ?? 0.89,
    requiresHumanReview: aiResult.requiresHumanReview ?? true,
    modelVersion: aiResult.modelVersion || 'gemini-3.8-flash',
    processedAt: new Date().toISOString(),
    majorIncidentCandidate: aiResult.majorIncidentCandidate || false
  };

  newIntake.aiAnalysis = aiAnalysisRecord;

  // Correlation check
  if (aiResult.correlation) {
    newIntake.correlation = {
      id: `corr-${Date.now()}`,
      intakeId,
      existingIncidentNumber: aiResult.correlation.matchedIncidentNumber || null,
      similarityScore: aiResult.correlation.similarityScore || 0,
      correlationType: aiResult.correlation.correlationType || 'Independent',
      evidence: aiResult.correlation.evidence || 'Evaluated against active incident backlog.'
    };
  }

  // Determine Next Status based on Confidence and Intent
  if (aiAnalysisRecord.intent !== 'Incident' && aiAnalysisRecord.intent !== 'Problem Report') {
    // Non-incident intent (e.g. Service Request, Information Request, Non-IT)
    newIntake.processingStatus = 'Needs Review';
    recordAudit(
      intakeNumber,
      'AI Intelligence Engine',
      'AI System',
      'Intent Filtered',
      `Identified intent as '${aiAnalysisRecord.intent}' with ${(aiAnalysisRecord.intentConfidence * 100).toFixed(0)}% confidence. Marked for Service Desk routing.`,
      undefined,
      'Pending AI',
      'Needs Review'
    );
  } else if (
    config.autoProcessHighConfidence &&
    aiAnalysisRecord.confidence >= config.confidenceThreshold &&
    !(config.requireReviewForP1 && aiAnalysisRecord.priority === 'P1 - Critical')
  ) {
    // If high confidence duplicate match
    if (newIntake.correlation?.correlationType === 'Duplicate' && newIntake.correlation.existingIncidentNumber) {
      newIntake.processingStatus = 'Linked Duplicate';
      newIntake.serviceNowIncidentId = newIntake.correlation.existingIncidentNumber;

      // Update ServiceNow Incident
      const matchedInc = incidents.find(i => i.number === newIntake.correlation?.existingIncidentNumber);
      if (matchedInc) {
        matchedInc.affectedUsers += 1;
        matchedInc.relatedIntakes.push(intakeNumber);
        matchedInc.workNotes.unshift({
          author: 'Smart Incident Hub (AI)',
          timestamp: new Date().toISOString(),
          text: `Consolidated intake ${intakeNumber} from ${source} (${sender.name}). Incrementing affected users to ${matchedInc.affectedUsers}.`,
          isSystem: true
        });
        saveStoredIncidents(incidents);
      }

      recordAudit(
        intakeNumber,
        'Smart Incident Hub Automator',
        'AI System',
        'Auto Consolidated to Duplicate',
        `High confidence (${(aiAnalysisRecord.confidence * 100).toFixed(0)}%) match to ${newIntake.correlation.existingIncidentNumber}. Consolidated without ticket duplication.`,
        newIntake.correlation.existingIncidentNumber,
        'Pending AI',
        'Linked Duplicate'
      );
    } else {
      // Auto-create ServiceNow ticket!
      const newIncNumber = `INC${(12351 + incidents.length).toString().padStart(7, '0')}`;
      const createdInc: ServiceNowIncident = {
        id: `sn-inc-${Date.now()}`,
        number: newIncNumber,
        shortDescription: aiAnalysisRecord.summary,
        description: rawMessage,
        service: aiAnalysisRecord.service,
        category: aiAnalysisRecord.category,
        subcategory: aiAnalysisRecord.subcategory,
        ci: aiAnalysisRecord.ci,
        impact: aiAnalysisRecord.impact,
        urgency: aiAnalysisRecord.urgency,
        priority: aiAnalysisRecord.priority,
        status: 'New',
        source: newIntake.source,
        caller: sender.name,
        callerEmail: sender.email,
        callerDepartment: sender.department,
        location: aiAnalysisRecord.location,
        createdTime: new Date().toISOString(),
        assignmentGroup: aiAnalysisRecord.assignmentGroup,
        assignedTo: 'Unassigned',
        affectedUsers: 1,
        aiConfidence: aiAnalysisRecord.confidence,
        relatedIntakes: [intakeNumber],
        evidenceNotes: [
          `Original message from ${source}: "${rawMessage}"`,
          `AI Reason: ${aiAnalysisRecord.reason}`
        ],
        workNotes: [
          {
            author: 'ServiceNow REST Gateway',
            timestamp: new Date().toISOString(),
            text: `Incident auto-created via Smart Incident Hub with ${(aiAnalysisRecord.confidence * 100).toFixed(0)}% confidence. Assigned to ${aiAnalysisRecord.assignmentGroup}.`,
            isSystem: true
          }
        ]
      };

      const updatedIncidents = [createdInc, ...incidents];
      saveStoredIncidents(updatedIncidents);

      newIntake.processingStatus = 'Ticket Created';
      newIntake.serviceNowIncidentId = newIncNumber;

      recordAudit(
        intakeNumber,
        'ServiceNow REST Gateway',
        'ServiceNow Gateway',
        'ServiceNow Incident Created',
        `Auto-provisioned ServiceNow incident ${newIncNumber} with priority ${aiAnalysisRecord.priority} to ${aiAnalysisRecord.assignmentGroup}.`,
        newIncNumber,
        'Pending AI',
        'Ticket Created'
      );
    }
  } else {
    // Requires human review
    newIntake.processingStatus = 'Needs Review';
    recordAudit(
      intakeNumber,
      'AI Intelligence Engine',
      'AI System',
      'AI Analysis Complete - Queued for Review',
      `Confidence ${(aiAnalysisRecord.confidence * 100).toFixed(0)}% or policy rule requires human validation before ServiceNow action.`,
      undefined,
      'Pending AI',
      'Needs Review'
    );
  }

  const updatedIntakes = [newIntake, ...intakes];
  saveStoredIntakes(updatedIntakes);

  return newIntake;
}
