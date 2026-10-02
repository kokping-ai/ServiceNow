// Core Data Model for Smart Incident Hub

export type ChannelSource = 'Teams' | 'Email' | 'Web' | 'Monitoring' | 'ServiceNow';

export type IncidentIntent =
  | 'Incident'
  | 'Service Request'
  | 'Information Request'
  | 'Problem Report'
  | 'Change Request'
  | 'Status Query'
  | 'Duplicate Report'
  | 'Follow-up'
  | 'Non-IT';

export type IncidentImpact = '1 User' | 'Multiple Users' | 'Organization / Enterprise';
export type IncidentUrgency = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentPriority = 'P1 - Critical' | 'P2 - High' | 'P3 - Moderate' | 'P4 - Low';

export type IntakeStatus =
  | 'Pending AI'
  | 'AI Analyzed'
  | 'Needs Review'
  | 'Auto Approved'
  | 'Approved'
  | 'Linked Duplicate'
  | 'Rejected'
  | 'Ticket Created';

export type CorrelationType = 'Duplicate' | 'Related' | 'Independent';

export type UserRole =
  | 'business_user'
  | 'service_desk'
  | 'incident_manager'
  | 'resolver_group'
  | 'management_admin';

export interface UserPersona {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatar: string;
  email: string;
}

export interface IncidentIntakeRecord {
  id: string;
  intakeNumber: string; // e.g. INT-10001
  source: ChannelSource;
  senderName: string;
  senderEmail: string;
  senderDepartment: string;
  timestamp: string;
  rawMessage: string;
  channelMetadata?: {
    channelName?: string; // e.g. "#it-helpdesk"
    subject?: string;     // e.g. "FW: SAP not responding"
    alertSource?: string; // e.g. "Dynatrace APM Cluster 01"
  };
  processingStatus: IntakeStatus;
  aiAnalysis?: AIAnalysisRecord;
  correlation?: IncidentCorrelationRecord;
  humanReview?: HumanReviewRecord;
  serviceNowIncidentId?: string; // e.g. INC0012345
}

export interface AIAnalysisRecord {
  id: string;
  intakeId: string;
  intent: IncidentIntent;
  intentConfidence: number; // 0.0 - 1.0
  service: string;
  category: string;
  subcategory: string;
  ci: string;
  symptom: string;
  device: string;
  location: string;
  errorCode: string;
  duration: string;
  businessImpact: string;
  urgency: IncidentUrgency;
  impact: IncidentImpact;
  priority: IncidentPriority;
  assignmentGroup: string;
  summary: string;
  reason: string;
  confidence: number; // 0.0 - 1.0
  requiresHumanReview: boolean;
  modelVersion: string;
  processedAt: string;
  majorIncidentCandidate?: boolean;
}

export interface IncidentCorrelationRecord {
  id: string;
  intakeId: string;
  existingIncidentNumber: string | null;
  similarityScore: number; // 0.0 - 1.0
  correlationType: CorrelationType;
  evidence: string;
  reviewerDecision?: 'Linked As Duplicate' | 'Linked As Related' | 'Split As Independent';
  reviewerName?: string;
  reviewedAt?: string;
}

export interface HumanReviewRecord {
  id: string;
  intakeId: string;
  reviewerName: string;
  reviewerRole: string;
  decision: 'Approved' | 'Edited & Approved' | 'Rejected' | 'Linked Duplicate';
  comments: string;
  reviewedAt: string;
  overriddenFields: {
    field: string;
    originalValue: any;
    newValue: any;
  }[];
}

export interface ServiceNowIncident {
  id: string;
  number: string; // e.g. INC0012345
  shortDescription: string;
  description: string;
  service: string;
  category: string;
  subcategory: string;
  ci: string;
  impact: IncidentImpact;
  urgency: IncidentUrgency;
  priority: IncidentPriority;
  status: 'New' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed';
  source: ChannelSource;
  caller: string;
  callerEmail: string;
  callerDepartment: string;
  location: string;
  createdTime: string;
  assignmentGroup: string;
  assignedTo: string;
  affectedUsers: number;
  aiConfidence: number;
  relatedIntakes: string[]; // List of Intake Numbers linked
  evidenceNotes: string[];
  workNotes: {
    author: string;
    timestamp: string;
    text: string;
    isSystem?: boolean;
  }[];
  resolution?: {
    code: string;
    notes: string;
    resolvedAt: string;
    resolvedBy: string;
  };
}

export interface AuditLogEntry {
  id: string;
  intakeId: string;
  incidentNumber?: string;
  timestamp: string;
  actor: string;
  actorType: 'User' | 'AI System' | 'ServiceNow Gateway';
  event: string;
  details: string;
  previousState?: string;
  newState?: string;
  metadata?: Record<string, any>;
}

export interface SystemConfig {
  confidenceThreshold: number; // e.g. 0.90
  autoProcessHighConfidence: boolean;
  requireReviewForP1: boolean;
  duplicateSimilarityThreshold: number; // e.g. 0.85
  emailNotificationsEnabled: boolean;
  teamsNotificationsEnabled: boolean;
}
