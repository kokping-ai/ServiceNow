import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { IntakeScreen } from './components/IntakeScreen';
import { QueueScreen } from './components/QueueScreen';
import { AIReviewScreen } from './components/AIReviewScreen';
import { ServiceNowView } from './components/ServiceNowView';
import { DashboardScreen } from './components/DashboardScreen';
import { AuditTrailScreen } from './components/AuditTrailScreen';
import { PRDSpecificationModal } from './components/PRDSpecificationModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';

import {
  USER_PERSONAS,
  SIMULATION_TEMPLATES
} from './data/mockData';
import {
  getStoredIntakes,
  saveStoredIntakes,
  getStoredIncidents,
  saveStoredIncidents,
  getStoredAuditLogs,
  saveStoredAuditLogs,
  getStoredConfig,
  saveStoredConfig,
  ingestNewCommunication,
  recordAudit
} from './services/api';

import {
  IncidentIntakeRecord,
  ServiceNowIncident,
  AuditLogEntry,
  SystemConfig,
  UserPersona,
  ChannelSource
} from './types';

export function App() {
  const [activePersona, setActivePersona] = useState<UserPersona>(USER_PERSONAS[0]); // Start with Vincent or Sarah
  const [currentTab, setCurrentTab] = useState<string>('intake');
  const [isPRDModalOpen, setIsPRDModalOpen] = useState(false);

  // Core state
  const [intakes, setIntakes] = useState<IncidentIntakeRecord[]>([]);
  const [incidents, setIncidents] = useState<ServiceNowIncident[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [config, setConfig] = useState<SystemConfig>(getStoredConfig());
  const [selectedReviewIntake, setSelectedReviewIntake] = useState<IncidentIntakeRecord | null>(null);
  const [selectedServiceNowInc, setSelectedServiceNowInc] = useState<ServiceNowIncident | null>(null);
  const [notifications, setNotifications] = useState<ToastMessage[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    setIntakes(getStoredIntakes());
    setIncidents(getStoredIncidents());
    setAuditLogs(getStoredAuditLogs());
    setConfig(getStoredConfig());
  }, []);

  const addNotification = (
    title: string,
    message: string,
    source: 'Teams' | 'Email' | 'System',
    incidentNumber?: string
  ) => {
    const toast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      message,
      source,
      incidentNumber,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [toast, ...prev].slice(0, 4));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Ingest handler
  const handleIngestMessage = async (
    rawMessage: string,
    source: ChannelSource,
    channelMeta?: Record<string, string>
  ) => {
    const record = await ingestNewCommunication(rawMessage, source, activePersona, channelMeta);
    
    // Refresh local states
    const updatedIntakes = getStoredIntakes();
    const updatedIncidents = getStoredIncidents();
    const updatedAudits = getStoredAuditLogs();

    setIntakes(updatedIntakes);
    setIncidents(updatedIncidents);
    setAuditLogs(updatedAudits);

    // Notify user based on intake result
    if (record.processingStatus === 'Ticket Created' && record.serviceNowIncidentId) {
      addNotification(
        `Incident Received (${source})`,
        `Your incident report was automatically classified and created in ServiceNow.`,
        source === 'Email' ? 'Email' : 'Teams',
        record.serviceNowIncidentId
      );
    } else if (record.processingStatus === 'Linked Duplicate' && record.serviceNowIncidentId) {
      addNotification(
        `Consolidated into Existing Incident`,
        `Identified matching active incident ${record.serviceNowIncidentId}. Updated affected caller count.`,
        source === 'Email' ? 'Email' : 'Teams',
        record.serviceNowIncidentId
      );
    } else {
      addNotification(
        `Intake Logged (${record.intakeNumber})`,
        `Incident information received from ${source}. Assigned to IT Service Desk review queue.`,
        'System'
      );
    }

    return record;
  };

  // Handle selecting an intake for review
  const handleSelectIntakeForReview = (item: IncidentIntakeRecord) => {
    setSelectedReviewIntake(item);
    setCurrentTab('review');
  };

  // Human Review: Approve & Create ServiceNow ticket
  const handleApproveAndCreate = (intakeId: string, updatedFields: any, comments: string) => {
    const currentIntakes = getStoredIntakes();
    const currentIncidents = getStoredIncidents();

    const targetIntake = currentIntakes.find(i => i.id === intakeId);
    if (!targetIntake) return;

    const newIncNumber = `INC${(12351 + currentIncidents.length).toString().padStart(7, '0')}`;

    // Create ServiceNow Record
    const newInc: ServiceNowIncident = {
      id: `sn-inc-${Date.now()}`,
      number: newIncNumber,
      shortDescription: updatedFields.summary || targetIntake.aiAnalysis?.summary || 'User Incident Report',
      description: targetIntake.rawMessage,
      service: updatedFields.service,
      category: updatedFields.category,
      subcategory: updatedFields.subcategory,
      ci: targetIntake.aiAnalysis?.ci || 'IT-CMDB-CI',
      impact: updatedFields.impact,
      urgency: updatedFields.urgency,
      priority: updatedFields.priority,
      status: 'New',
      source: targetIntake.source,
      caller: targetIntake.senderName,
      callerEmail: targetIntake.senderEmail,
      callerDepartment: targetIntake.senderDepartment,
      location: targetIntake.aiAnalysis?.location || 'Remote',
      createdTime: new Date().toISOString(),
      assignmentGroup: updatedFields.assignmentGroup,
      assignedTo: 'Unassigned',
      affectedUsers: 1,
      aiConfidence: targetIntake.aiAnalysis?.confidence ?? 0.9,
      relatedIntakes: [targetIntake.intakeNumber],
      evidenceNotes: [
        `Original communication via ${targetIntake.source}: "${targetIntake.rawMessage}"`,
        `Service Desk approval comments: "${comments}"`
      ],
      workNotes: [
        {
          author: `${activePersona.name} (${activePersona.roleTitle.split('/')[0].trim()})`,
          timestamp: new Date().toISOString(),
          text: `Reviewed and approved ticket creation. Comments: ${comments}`,
          isSystem: false
        }
      ]
    };

    const nextIncidents = [newInc, ...currentIncidents];
    saveStoredIncidents(nextIncidents);
    setIncidents(nextIncidents);

    // Update Intake
    targetIntake.processingStatus = 'Ticket Created';
    targetIntake.serviceNowIncidentId = newIncNumber;
    saveStoredIntakes(currentIntakes);
    setIntakes([...currentIntakes]);

    // Audit Log
    recordAudit(
      targetIntake.intakeNumber,
      activePersona.name,
      'User',
      'Human Review Approval',
      `Service desk validated fields and provisioned ServiceNow ticket ${newIncNumber}.`,
      newIncNumber,
      'Needs Review',
      'Ticket Created'
    );
    setAuditLogs(getStoredAuditLogs());

    addNotification(
      'ServiceNow Ticket Created',
      `Ticket ${newIncNumber} created and assigned to ${updatedFields.assignmentGroup}.`,
      'System',
      newIncNumber
    );

    setSelectedServiceNowInc(newInc);
    setCurrentTab('servicenow');
  };

  // Human Review: Link as Duplicate
  const handleLinkDuplicate = (intakeId: string, targetIncidentNumber: string, comments: string) => {
    const currentIntakes = getStoredIntakes();
    const currentIncidents = getStoredIncidents();

    const targetIntake = currentIntakes.find(i => i.id === intakeId);
    const parentInc = currentIncidents.find(inc => inc.number === targetIncidentNumber);
    if (!targetIntake || !parentInc) return;

    parentInc.affectedUsers += 1;
    parentInc.relatedIntakes.push(targetIntake.intakeNumber);
    parentInc.workNotes.unshift({
      author: `${activePersona.name} (${activePersona.roleTitle.split('/')[0].trim()})`,
      timestamp: new Date().toISOString(),
      text: `Consolidated intake ${targetIntake.intakeNumber} as duplicate. Incremented affected users to ${parentInc.affectedUsers}. Notes: ${comments}`,
      isSystem: false
    });

    saveStoredIncidents(currentIncidents);
    setIncidents([...currentIncidents]);

    targetIntake.processingStatus = 'Linked Duplicate';
    targetIntake.serviceNowIncidentId = parentInc.number;
    saveStoredIntakes(currentIntakes);
    setIntakes([...currentIntakes]);

    recordAudit(
      targetIntake.intakeNumber,
      activePersona.name,
      'User',
      'Linked to Duplicate Ticket',
      `Consolidated with parent ${parentInc.number}. Avoided creating duplicate ticket in ServiceNow.`,
      parentInc.number,
      'Needs Review',
      'Linked Duplicate'
    );
    setAuditLogs(getStoredAuditLogs());

    addNotification(
      'Consolidated into Duplicate',
      `Intake ${targetIntake.intakeNumber} linked to active incident ${parentInc.number}.`,
      'System',
      parentInc.number
    );

    setSelectedServiceNowInc(parentInc);
    setCurrentTab('servicenow');
  };

  // Human Review: Reject
  const handleRejectIntake = (intakeId: string, reason: string) => {
    const currentIntakes = getStoredIntakes();
    const targetIntake = currentIntakes.find(i => i.id === intakeId);
    if (!targetIntake) return;

    targetIntake.processingStatus = 'Rejected';
    saveStoredIntakes(currentIntakes);
    setIntakes([...currentIntakes]);

    recordAudit(
      targetIntake.intakeNumber,
      activePersona.name,
      'User',
      'Intake Deflected / Rejected',
      `Service desk rejected incident creation: ${reason}`,
      undefined,
      'Needs Review',
      'Rejected'
    );
    setAuditLogs(getStoredAuditLogs());

    addNotification(
      'Intake Deflected',
      `Intake ${targetIntake.intakeNumber} marked as non-incident.`,
      'System'
    );

    setCurrentTab('queue');
  };

  // Add work note to ServiceNow incident
  const handleAddWorkNote = (incidentId: string, noteText: string) => {
    const currentIncidents = getStoredIncidents();
    const inc = currentIncidents.find(i => i.id === incidentId);
    if (!inc) return;

    inc.workNotes.unshift({
      author: `${activePersona.name} (${activePersona.roleTitle.split('/')[0].trim()})`,
      timestamp: new Date().toISOString(),
      text: noteText,
      isSystem: false
    });

    saveStoredIncidents(currentIncidents);
    setIncidents([...currentIncidents]);

    recordAudit(
      inc.relatedIntakes[0] || 'ITSM-SYS',
      activePersona.name,
      'User',
      'Work Note Added',
      `Technician work note posted on ${inc.number}: "${noteText.substring(0, 60)}..."`,
      inc.number
    );
    setAuditLogs(getStoredAuditLogs());
  };

  // Resolve ServiceNow incident
  const handleResolveIncident = (incidentId: string, resolutionCode: string, notes: string) => {
    const currentIncidents = getStoredIncidents();
    const inc = currentIncidents.find(i => i.id === incidentId);
    if (!inc) return;

    inc.status = 'Resolved';
    inc.resolution = {
      code: resolutionCode,
      notes,
      resolvedAt: new Date().toISOString(),
      resolvedBy: activePersona.name
    };
    inc.workNotes.unshift({
      author: `${activePersona.name}`,
      timestamp: new Date().toISOString(),
      text: `Incident marked Resolved with code "${resolutionCode}". Notes: ${notes}`,
      isSystem: false
    });

    saveStoredIncidents(currentIncidents);
    setIncidents([...currentIncidents]);

    recordAudit(
      inc.relatedIntakes[0] || 'ITSM-SYS',
      activePersona.name,
      'User',
      'ServiceNow Incident Resolved',
      `Incident ${inc.number} resolved with code '${resolutionCode}'.`,
      inc.number,
      'In Progress',
      'Resolved'
    );
    setAuditLogs(getStoredAuditLogs());

    addNotification(
      'Incident Resolved',
      `ServiceNow record ${inc.number} marked resolved.`,
      'System',
      inc.number
    );
  };

  const handleUpdateConfig = (newCfg: SystemConfig) => {
    setConfig(newCfg);
    saveStoredConfig(newCfg);
  };

  const handleOpenServiceNowIncident = (incidentNumber: string) => {
    const target = incidents.find(i => i.number === incidentNumber);
    if (target) {
      setSelectedServiceNowInc(target);
      setCurrentTab('servicenow');
    }
  };

  // PRD Test preset runner
  const handleRunTestPreset = async (testId: string) => {
    setIsPRDModalOpen(false);
    if (testId === 'TEST-01') {
      await handleIngestMessage(
        'I cannot access SAP since 10:15 AM today. Getting Error 500 when opening finance closing module.',
        'Teams',
        { channelName: '#finance-urgent-support' }
      );
      setCurrentTab('queue');
    } else if (testId === 'TEST-02') {
      await handleIngestMessage(
        "Hi IT Desk, Corporate VPN drops every 10 minutes from home. I need urgent access for finance closing.",
        'Email',
        { subject: 'URGENT: VPN disconnects' }
      );
      setCurrentTab('queue');
    } else if (testId === 'TEST-03') {
      await handleIngestMessage(
        'Can someone please grant me read-only access to the Workday HR reporting module for Q4 payroll audit?',
        'Teams',
        { channelName: '#it-helpdesk' }
      );
      setCurrentTab('queue');
    } else if (testId === 'TEST-04') {
      await handleIngestMessage(
        'ALERT 9921 [CRITICAL]: Host cluster SAP-PRD-ECC6 HTTP request latency spiked to 4820ms (> 800ms threshold). Error 500 error-rate 18.4%.',
        'Monitoring',
        { alertSource: 'Dynatrace APM Cluster 01' }
      );
      setCurrentTab('queue');
    } else if (testId === 'TEST-05') {
      await handleIngestMessage(
        'Could someone adjust the air conditioner on the 5th floor meeting room B? It is freezing in here.',
        'Web'
      );
      setCurrentTab('queue');
    }
  };

  // Count unreviewed
  const unreviewedCount = intakes.filter(i => i.processingStatus === 'Needs Review').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activePersona={activePersona}
        setActivePersona={setActivePersona}
        personas={USER_PERSONAS}
        unreviewedCount={unreviewedCount}
        openPRDModal={() => setIsPRDModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Screen 1: Intake & Channels */}
        {currentTab === 'intake' && (
          <IntakeScreen
            onIngestMessage={handleIngestMessage}
            activePersona={activePersona}
            userIncidents={incidents}
            userIntakes={intakes}
            onSelectIncident={inc => {
              setSelectedServiceNowInc(inc);
              setCurrentTab('servicenow');
            }}
            onNavigateToReview={intake => {
              setSelectedReviewIntake(intake);
              setCurrentTab('review');
            }}
          />
        )}

        {/* Screen 2: Queue */}
        {currentTab === 'queue' && (
          <QueueScreen
            intakes={intakes}
            onSelectIntakeForReview={handleSelectIntakeForReview}
            onOpenServiceNowIncident={handleOpenServiceNowIncident}
          />
        )}

        {/* Screen 3: AI Review & Correlation */}
        {currentTab === 'review' && (
          selectedReviewIntake ? (
            <AIReviewScreen
              intake={selectedReviewIntake}
              activePersona={activePersona}
              existingIncidents={incidents}
              onApproveAndCreate={handleApproveAndCreate}
              onLinkDuplicate={handleLinkDuplicate}
              onRejectIntake={handleRejectIntake}
              onSelectAnotherIntake={() => setCurrentTab('queue')}
            />
          ) : (
            <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <p className="text-slate-400 text-sm">Please select an intake record from the queue to review.</p>
              <button
                onClick={() => setCurrentTab('queue')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                Go to Intake Queue
              </button>
            </div>
          )
        )}

        {/* Screen 4: ServiceNow Live */}
        {currentTab === 'servicenow' && (
          <ServiceNowView
            incidents={incidents}
            selectedIncident={selectedServiceNowInc}
            onSelectIncident={setSelectedServiceNowInc}
            onAddWorkNote={handleAddWorkNote}
            onResolveIncident={handleResolveIncident}
          />
        )}

        {/* Screen 5: Management & AI Dashboards */}
        {currentTab === 'dashboard' && (
          <DashboardScreen
            intakes={intakes}
            incidents={incidents}
            config={config}
            onUpdateConfig={handleUpdateConfig}
          />
        )}

        {/* Audit Trail Screen */}
        {currentTab === 'audit' && (
          <AuditTrailScreen
            logs={auditLogs}
            intakes={intakes}
          />
        )}
      </main>

      {/* Floating Notification Toast */}
      <NotificationToast
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />

      {/* PRD & Engineering Specification Modal */}
      <PRDSpecificationModal
        isOpen={isPRDModalOpen}
        onClose={() => setIsPRDModalOpen(false)}
        onRunTestPreset={handleRunTestPreset}
      />
    </div>
  );
}

export default App;
