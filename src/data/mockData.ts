import {
  UserPersona,
  ServiceNowIncident,
  IncidentIntakeRecord,
  AuditLogEntry,
  SystemConfig
} from '../types';

export const USER_PERSONAS: UserPersona[] = [
  {
    id: 'user-vincent',
    name: 'Vincent Kok',
    role: 'business_user',
    roleTitle: 'Business User / Finance Analyst',
    department: 'Finance & Controlling',
    avatar: 'VK',
    email: 'vincent.kok@enterprise.corp'
  },
  {
    id: 'user-sarah',
    name: 'Sarah Tan',
    role: 'service_desk',
    roleTitle: 'Senior Service Desk Agent',
    department: 'Global IT Service Desk',
    avatar: 'ST',
    email: 'sarah.tan@enterprise.corp'
  },
  {
    id: 'user-marcus',
    name: 'Marcus Lee',
    role: 'incident_manager',
    roleTitle: 'Major Incident Manager',
    department: 'IT Incident & Operations Command',
    avatar: 'ML',
    email: 'marcus.lee@enterprise.corp'
  },
  {
    id: 'user-alex',
    name: 'Alex Wong',
    role: 'resolver_group',
    roleTitle: 'Tier 2 Application Support Engineer',
    department: 'SAP & Core Systems Group',
    avatar: 'AW',
    email: 'alex.wong@enterprise.corp'
  },
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    role: 'management_admin',
    roleTitle: 'VP of IT Operations & AI Lead',
    department: 'IT Leadership',
    avatar: 'ER',
    email: 'elena.rostova@enterprise.corp'
  }
];

export const INITIAL_CONFIG: SystemConfig = {
  confidenceThreshold: 0.90,
  autoProcessHighConfidence: true,
  requireReviewForP1: true,
  duplicateSimilarityThreshold: 0.85,
  emailNotificationsEnabled: true,
  teamsNotificationsEnabled: true
};

export const INITIAL_SERVICENOW_INCIDENTS: ServiceNowIncident[] = [
  {
    id: 'sn-inc-12345',
    number: 'INC0012345',
    shortDescription: 'SAP ERP Access & Login Failure (Error 500)',
    description: 'Multiple users across Finance and Supply Chain reporting intermittent HTTP 500 session timeout when logging into SAP GUI and Fiori Launchpad.',
    service: 'SAP ERP',
    category: 'Enterprise Applications',
    subcategory: 'SAP Login & Authorization',
    ci: 'SAP-PRD-ECC6',
    impact: 'Multiple Users',
    urgency: 'High',
    priority: 'P2 - High',
    status: 'In Progress',
    source: 'Teams',
    caller: 'Jessica Miller',
    callerEmail: 'jessica.m@enterprise.corp',
    callerDepartment: 'Finance',
    location: 'Kuala Lumpur Office',
    createdTime: '2026-10-01T09:25:00Z',
    assignmentGroup: 'SAP Support Group',
    assignedTo: 'Alex Wong',
    affectedUsers: 23,
    aiConfidence: 0.94,
    relatedIntakes: ['INT-10001', 'INT-10004', 'INT-10008'],
    evidenceNotes: [
      'Teams cluster: 14 reports from #general-it and #finance-ops',
      'Email cluster: 6 emails with screenshot of Error 500 timeout',
      'Monitoring: Alert 8891 - Dynatrace thread pool saturation on SAP-PRD-ECC6'
    ],
    workNotes: [
      {
        author: 'System Gateway',
        timestamp: '2026-10-01T09:25:00Z',
        text: 'Incident created via Smart Incident Hub with AI confidence 94%.',
        isSystem: true
      },
      {
        author: 'Alex Wong',
        timestamp: '2026-10-01T09:35:00Z',
        text: 'Investigating SAP application server app02 memory heap utilization.',
        isSystem: false
      },
      {
        author: 'System Gateway',
        timestamp: '2026-10-01T09:42:00Z',
        text: 'Automated correlation: 4 duplicate messages consolidated. Affected user count updated to 23.',
        isSystem: true
      }
    ]
  },
  {
    id: 'sn-inc-12348',
    number: 'INC0012348',
    shortDescription: 'Corporate VPN Gateway Asia Intermittent Disconnects',
    description: 'AnyConnect client dropping session after 5-10 minutes with error "Secure gateway connection reset". Affects remote workers.',
    service: 'Corporate VPN',
    category: 'Network Infrastructure',
    subcategory: 'VPN Gateway Connection',
    ci: 'VPN-GW-ASIA-01',
    impact: 'Multiple Users',
    urgency: 'Medium',
    priority: 'P3 - Moderate',
    status: 'In Progress',
    source: 'Email',
    caller: 'David Clark',
    callerEmail: 'david.c@enterprise.corp',
    callerDepartment: 'Commercial Sales',
    location: 'Remote / Hybrid',
    createdTime: '2026-10-01T08:15:00Z',
    assignmentGroup: 'Network Operations',
    assignedTo: 'Priya Sharma',
    affectedUsers: 8,
    aiConfidence: 0.91,
    relatedIntakes: ['INT-10002'],
    evidenceNotes: [
      'Users report VPN disconnects during remote video calls'
    ],
    workNotes: [
      {
        author: 'System Gateway',
        timestamp: '2026-10-01T08:15:00Z',
        text: 'Incident auto-created via Smart Incident Hub.',
        isSystem: true
      }
    ]
  },
  {
    id: 'sn-inc-12350',
    number: 'INC0012350',
    shortDescription: 'Outlook M365 Desktop Mailbox Sync Delay',
    description: 'Emails sent are sitting in Outbox for 15+ minutes before transmission.',
    service: 'Microsoft 365 / Outlook',
    category: 'End User Computing',
    subcategory: 'Mail & Collaboration',
    ci: 'M365-TENANT-GLOBAL',
    impact: '1 User',
    urgency: 'Medium',
    priority: 'P3 - Moderate',
    status: 'Resolved',
    source: 'Web',
    caller: 'Amir Khan',
    callerEmail: 'amir.k@enterprise.corp',
    callerDepartment: 'Legal',
    location: 'Singapore Regional HQ',
    createdTime: '2026-09-30T14:10:00Z',
    assignmentGroup: 'M365 Workplace Services',
    assignedTo: 'Sarah Tan',
    affectedUsers: 1,
    aiConfidence: 0.93,
    relatedIntakes: ['INT-09942'],
    evidenceNotes: ['Single user local Outlook cache corruption'],
    workNotes: [
      {
        author: 'Sarah Tan',
        timestamp: '2026-09-30T15:20:00Z',
        text: 'Rebuilt OST cached data file. Outbox emptied and sync functional.',
        isSystem: false
      }
    ],
    resolution: {
      code: 'Resolved by Workaround / OST Cache Rebuild',
      notes: 'Cleared local profile cache, verified bidirectional send/receive.',
      resolvedAt: '2026-09-30T15:22:00Z',
      resolvedBy: 'Sarah Tan'
    }
  }
];

export const INITIAL_INTAKE_RECORDS: IncidentIntakeRecord[] = [
  {
    id: 'int-10001',
    intakeNumber: 'INT-10001',
    source: 'Teams',
    senderName: 'Vincent Kok',
    senderEmail: 'vincent.kok@enterprise.corp',
    senderDepartment: 'Finance',
    timestamp: '2026-10-01T10:15:00Z',
    rawMessage: 'SAP login failing for me since 10:15 AM. Getting Error 500 when opening finance closing module.',
    channelMetadata: {
      channelName: '#finance-urgent-support'
    },
    processingStatus: 'Linked Duplicate',
    aiAnalysis: {
      id: 'ai-10001',
      intakeId: 'int-10001',
      intent: 'Incident',
      intentConfidence: 0.96,
      service: 'SAP ERP',
      category: 'Enterprise Applications',
      subcategory: 'SAP Login & Authorization',
      ci: 'SAP-PRD-ECC6',
      symptom: 'Authentication / Login Failure',
      device: 'Company Laptop',
      location: 'Kuala Lumpur Office',
      errorCode: 'Error 500',
      duration: 'Since 10:15 AM',
      businessImpact: 'User blocked from performing time-sensitive operations',
      urgency: 'High',
      impact: '1 User',
      priority: 'P3 - Moderate',
      assignmentGroup: 'SAP Support Group',
      summary: 'SAP ERP: Authentication failure with Error 500 reported via Teams.',
      reason: 'Matched existing active incident INC0012345 with 93% semantic similarity.',
      confidence: 0.93,
      requiresHumanReview: false,
      modelVersion: 'gemini-3.8-flash',
      processedAt: '2026-10-01T10:15:05Z'
    },
    correlation: {
      id: 'corr-10001',
      intakeId: 'int-10001',
      existingIncidentNumber: 'INC0012345',
      similarityScore: 0.93,
      correlationType: 'Duplicate',
      evidence: 'Matches active SAP Error 500 incident INC0012345 reported this morning.',
      reviewerDecision: 'Linked As Duplicate',
      reviewerName: 'Sarah Tan',
      reviewedAt: '2026-10-01T10:16:10Z'
    },
    serviceNowIncidentId: 'INC0012345'
  },
  {
    id: 'int-10002',
    intakeNumber: 'INT-10002',
    source: 'Email',
    senderName: 'Karen Reynolds',
    senderEmail: 'karen.r@enterprise.corp',
    senderDepartment: 'Corporate Communications',
    timestamp: '2026-10-01T10:30:00Z',
    rawMessage: "Hi IT, I've been trying to connect to VPN for the last 30 minutes but it keeps failing. I need to access the finance system urgently for executive review.",
    channelMetadata: {
      subject: 'URGENT: VPN not connecting from home'
    },
    processingStatus: 'Needs Review',
    aiAnalysis: {
      id: 'ai-10002',
      intakeId: 'int-10002',
      intent: 'Incident',
      intentConfidence: 0.95,
      service: 'Corporate VPN',
      category: 'Network Infrastructure',
      subcategory: 'VPN Gateway Connection',
      ci: 'VPN-GW-ASIA-01',
      symptom: 'VPN connection failure',
      device: 'Company Laptop',
      location: 'Remote / Hybrid',
      errorCode: 'None / Not Provided',
      duration: 'Last 30 minutes',
      businessImpact: 'Blocked from executive finance review',
      urgency: 'High',
      impact: '1 User',
      priority: 'P2 - High',
      assignmentGroup: 'Network Operations',
      summary: 'Corporate VPN: Repeated connection failures for last 30 minutes.',
      reason: 'Urgent user impact reported with active INC0012348 correlation candidate.',
      confidence: 0.88,
      requiresHumanReview: true,
      modelVersion: 'gemini-3.8-flash',
      processedAt: '2026-10-01T10:30:06Z'
    },
    correlation: {
      id: 'corr-10002',
      intakeId: 'int-10002',
      existingIncidentNumber: 'INC0012348',
      similarityScore: 0.82,
      correlationType: 'Related',
      evidence: 'Similar VPN timeout symptoms as active INC0012348, but single user tunnel.'
    }
  },
  {
    id: 'int-10003',
    intakeNumber: 'INT-10003',
    source: 'Teams',
    senderName: 'Michael Chang',
    senderEmail: 'michael.c@enterprise.corp',
    senderDepartment: 'HR Operations',
    timestamp: '2026-10-01T10:45:00Z',
    rawMessage: 'Hi service desk, can you please grant me read-only access to the Workday HR reporting module for Q4 payroll audit?',
    channelMetadata: {
      channelName: '#it-helpdesk'
    },
    processingStatus: 'Rejected',
    aiAnalysis: {
      id: 'ai-10003',
      intakeId: 'int-10003',
      intent: 'Service Request',
      intentConfidence: 0.98,
      service: 'Workday HR',
      category: 'HR Tech',
      subcategory: 'Access Request',
      ci: 'WD-HR-CLOUD',
      symptom: 'Access Provisioning Required',
      device: 'Unknown / Not Provided',
      location: 'Singapore Regional HQ',
      errorCode: 'None / Not Provided',
      duration: 'Unknown / Not Provided',
      businessImpact: 'Q4 payroll audit reporting access',
      urgency: 'Medium',
      impact: '1 User',
      priority: 'P3 - Moderate',
      assignmentGroup: 'HR Systems Support',
      summary: 'Workday HR: Access grant request for Q4 payroll reporting.',
      reason: 'Intent detected as Service Request, not an operational incident. Diverted from Incident queue.',
      confidence: 0.97,
      requiresHumanReview: false,
      modelVersion: 'gemini-3.8-flash',
      processedAt: '2026-10-01T10:45:04Z'
    },
    humanReview: {
      id: 'hr-10003',
      intakeId: 'int-10003',
      reviewerName: 'Sarah Tan',
      reviewerRole: 'Service Desk Agent',
      decision: 'Rejected',
      comments: 'Auto-routed to Service Catalog Request RITM88219 (Access Provisioning), not an Incident.',
      reviewedAt: '2026-10-01T10:46:00Z',
      overriddenFields: []
    }
  },
  {
    id: 'int-10004',
    intakeNumber: 'INT-10004',
    source: 'Monitoring',
    senderName: 'Dynatrace APM Robot',
    senderEmail: 'apm-alerts@enterprise.corp',
    senderDepartment: 'IT Infrastructure Operations',
    timestamp: '2026-10-01T10:48:00Z',
    rawMessage: 'ALERT 9921 [CRITICAL]: Host cluster SAP-PRD-ECC6 HTTP request latency spiked to 4820ms (> 800ms threshold). Error 500 error-rate 18.4%.',
    channelMetadata: {
      alertSource: 'Dynatrace APM Cluster 01'
    },
    processingStatus: 'Linked Duplicate',
    aiAnalysis: {
      id: 'ai-10004',
      intakeId: 'int-10004',
      intent: 'Problem Report',
      intentConfidence: 0.99,
      service: 'SAP ERP',
      category: 'Enterprise Applications',
      subcategory: 'Application Performance',
      ci: 'SAP-PRD-ECC6',
      symptom: 'High Latency / Session Timeout',
      device: 'Production Server Cluster',
      location: 'Primary Data Center',
      errorCode: 'Error 500 Spike 18.4%',
      duration: 'Last 10 minutes',
      businessImpact: 'High latency affecting all active SAP sessions',
      urgency: 'High',
      impact: 'Organization / Enterprise',
      priority: 'P1 - Critical',
      assignmentGroup: 'SAP Support Group',
      summary: 'Monitoring Alert: SAP-PRD-ECC6 HTTP latency spike and Error 500 rate 18.4%.',
      reason: 'Direct technical confirmation of existing incident INC0012345.',
      confidence: 0.98,
      requiresHumanReview: false,
      modelVersion: 'gemini-3.8-flash',
      processedAt: '2026-10-01T10:48:03Z',
      majorIncidentCandidate: true
    },
    correlation: {
      id: 'corr-10004',
      intakeId: 'int-10004',
      existingIncidentNumber: 'INC0012345',
      similarityScore: 0.96,
      correlationType: 'Duplicate',
      evidence: 'Direct CI match (SAP-PRD-ECC6) and Error 500 symptom identical to INC0012345.',
      reviewerDecision: 'Linked As Duplicate',
      reviewerName: 'Marcus Lee',
      reviewedAt: '2026-10-01T10:49:15Z'
    },
    serviceNowIncidentId: 'INC0012345'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    intakeId: 'INT-10001',
    incidentNumber: 'INC0012345',
    timestamp: '2026-10-01T10:15:00Z',
    actor: 'Vincent Kok',
    actorType: 'User',
    event: 'Message Ingested',
    details: 'Received raw message via Microsoft Teams channel #finance-urgent-support.',
    newState: 'Pending AI'
  },
  {
    id: 'aud-002',
    intakeId: 'INT-10001',
    incidentNumber: 'INC0012345',
    timestamp: '2026-10-01T10:15:05Z',
    actor: 'AI Intelligence Engine',
    actorType: 'AI System',
    event: 'AI Analysis & Semantic Correlation',
    details: 'Intent: Incident (96%). Service: SAP ERP. Duplicate candidate: INC0012345 (93% similarity).',
    previousState: 'Pending AI',
    newState: 'Needs Review'
  },
  {
    id: 'aud-003',
    intakeId: 'INT-10001',
    incidentNumber: 'INC0012345',
    timestamp: '2026-10-01T10:16:10Z',
    actor: 'Sarah Tan',
    actorType: 'User',
    event: 'Human Review Decision',
    details: 'Validated duplicate correlation. Linked to active parent INC0012345 and incremented affected users count.',
    previousState: 'Needs Review',
    newState: 'Linked Duplicate'
  },
  {
    id: 'aud-004',
    intakeId: 'INT-10001',
    incidentNumber: 'INC0012345',
    timestamp: '2026-10-01T10:16:15Z',
    actor: 'ServiceNow REST Gateway',
    actorType: 'ServiceNow Gateway',
    event: 'ServiceNow Record Updated',
    details: 'Updated INC0012345 work notes and incremented caller count. Avoided duplicate ticket creation.',
    newState: 'Ticket Created'
  }
];

export const SIMULATION_TEMPLATES = [
  {
    label: 'SAP Error 500 (Duplicate Match Candidate)',
    source: 'Teams' as const,
    senderName: 'Vincent Kok',
    senderEmail: 'vincent.kok@enterprise.corp',
    senderDepartment: 'Finance',
    text: 'I cannot access SAP since 10:15 AM today. Keeps giving Error 500 when generating monthly closing ledger.'
  },
  {
    label: 'VPN Disconnect during Call (Network)',
    source: 'Email' as const,
    senderName: 'Kavita Patel',
    senderEmail: 'kavita.p@enterprise.corp',
    senderDepartment: 'Operations',
    text: 'Hi IT Desk, Corporate VPN drops every 10 minutes from home. I was in the middle of a vendor call. Laptop reconnects but session dies.'
  },
  {
    label: 'Access Request (Service Request - Not Incident)',
    source: 'Teams' as const,
    senderName: 'Zul Hilmi',
    senderEmail: 'zul.h@enterprise.corp',
    senderDepartment: 'Supply Chain',
    text: 'Hello, can someone approve my access request to Salesforce CRM? I started this week in procurement.'
  },
  {
    label: 'Monitoring Alert (Dynatrace Critical)',
    source: 'Monitoring' as const,
    senderName: 'Nagios Core Gateway',
    senderEmail: 'alerts@monitoring.enterprise.corp',
    senderDepartment: 'IT Operations',
    text: 'CRITICAL: Host VPN-GW-ASIA-01 ping packet loss 82%, tunnel interface latency > 1200ms.'
  },
  {
    label: 'Non-IT Request (Meeting Room / Facilities)',
    source: 'Web' as const,
    senderName: 'Rachel Green',
    senderEmail: 'rachel.g@enterprise.corp',
    senderDepartment: 'Marketing',
    text: 'Could someone adjust the air conditioner on the 5th floor meeting room B? It is freezing in here.'
  }
];
