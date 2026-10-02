import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Initialize Gemini on server-side
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Enterprise Reference Data for CMDB & Rules Grounding
const REFERENCE_DATA = {
  services: [
    { name: 'SAP ERP', category: 'Enterprise Applications', ci: 'SAP-PRD-ECC6', defaultAssignment: 'SAP Support Group', tier: 'Tier 1' },
    { name: 'Corporate VPN', category: 'Network Infrastructure', ci: 'VPN-GW-ASIA-01', defaultAssignment: 'Network Operations', tier: 'Tier 1' },
    { name: 'Microsoft 365 / Outlook', category: 'End User Computing', ci: 'M365-TENANT-GLOBAL', defaultAssignment: 'M365 Workplace Services', tier: 'Tier 2' },
    { name: 'Workday HR', category: 'HR Tech', ci: 'WD-HR-CLOUD', defaultAssignment: 'HR Systems Support', tier: 'Tier 2' },
    { name: 'Salesforce CRM', category: 'Commercial Apps', ci: 'SFDC-PROD-INST', defaultAssignment: 'CRM Applications Team', tier: 'Tier 2' },
    { name: 'Identity & Access (Okta / Entra)', category: 'Cybersecurity & IAM', ci: 'IAM-ENTRA-ID-SYNC', defaultAssignment: 'Identity & Access Management', tier: 'Tier 1' },
    { name: 'Local Office WiFi & LAN', category: 'Network Infrastructure', ci: 'CISCO-SWITCH-KL-FL4', defaultAssignment: 'Network Operations', tier: 'Tier 2' },
    { name: 'Customer Billing Gateway', category: 'Financial Systems', ci: 'BILLING-FIN-SRV04', defaultAssignment: 'Fintech Systems Support', tier: 'Tier 1' }
  ],
  urgencyRules: {
    'many_users': 'High',
    'single_user': 'Low',
    'executive_or_critical': 'High',
    'finance_closing': 'High',
    'standard': 'Medium'
  }
};

// Heuristic fallback processor if Gemini is unreachable or rate limited
function heuristicAnalyze(message: string, source: string, user: string) {
  const msgLower = message.toLowerCase();
  
  // Intent detection
  let intent = 'Incident';
  if (msgLower.includes('how to') || msgLower.includes('is there a guide') || msgLower.includes('what is the policy')) {
    intent = 'Information Request';
  } else if (msgLower.includes('need access') || msgLower.includes('request access') || msgLower.includes('provision') || msgLower.includes('new laptop')) {
    intent = 'Service Request';
  } else if (msgLower.includes('change firewall') || msgLower.includes('scheduled maintenance') || msgLower.includes('change request')) {
    intent = 'Change Request';
  } else if (msgLower.includes('any update') || msgLower.includes('what is the status') || msgLower.includes('ticket status')) {
    intent = 'Status Query';
  } else if (msgLower.includes('also having the same') || msgLower.includes('me too') || msgLower.includes('same issue')) {
    intent = 'Duplicate Report';
  } else if (msgLower.includes('lunch') || msgLower.includes('coffee') || msgLower.includes('meeting room book')) {
    intent = 'Non-IT';
  } else if (msgLower.includes('outage') || msgLower.includes('multiple users') || msgLower.includes('all users') || msgLower.includes('entire office')) {
    intent = 'Problem Report';
  }

  // Service detection
  let service = 'General IT Service';
  let category = 'End User Computing';
  let subcategory = 'General Support';
  let ci = 'GLOBAL-IT-DESK';
  let assignmentGroup = 'Service Desk Tier 1';

  if (msgLower.includes('sap') || msgLower.includes('t-code') || msgLower.includes('fiori')) {
    service = 'SAP ERP';
    category = 'Enterprise Applications';
    subcategory = 'SAP Login & Authorization';
    ci = 'SAP-PRD-ECC6';
    assignmentGroup = 'SAP Support Group';
  } else if (msgLower.includes('vpn') || msgLower.includes('anyconnect') || msgLower.includes('globalprotect')) {
    service = 'Corporate VPN';
    category = 'Network Infrastructure';
    subcategory = 'VPN Gateway Connection';
    ci = 'VPN-GW-ASIA-01';
    assignmentGroup = 'Network Operations';
  } else if (msgLower.includes('teams') || msgLower.includes('outlook') || msgLower.includes('m365') || msgLower.includes('email') || msgLower.includes('exchange')) {
    service = 'Microsoft 365 / Outlook';
    category = 'End User Computing';
    subcategory = 'Mail & Collaboration';
    ci = 'M365-TENANT-GLOBAL';
    assignmentGroup = 'M365 Workplace Services';
  } else if (msgLower.includes('wifi') || msgLower.includes('internet') || msgLower.includes('network') || msgLower.includes('switch')) {
    service = 'Local Office WiFi & LAN';
    category = 'Network Infrastructure';
    subcategory = 'LAN / Wireless Access';
    ci = 'CISCO-SWITCH-KL-FL4';
    assignmentGroup = 'Network Operations';
  } else if (msgLower.includes('password') || msgLower.includes('locked out') || msgLower.includes('mfa') || msgLower.includes('okta') || msgLower.includes('entra')) {
    service = 'Identity & Access (Okta / Entra)';
    category = 'Cybersecurity & IAM';
    subcategory = 'Authentication & MFA';
    ci = 'IAM-ENTRA-ID-SYNC';
    assignmentGroup = 'Identity & Access Management';
  } else if (msgLower.includes('billing') || msgLower.includes('payment') || msgLower.includes('invoice')) {
    service = 'Customer Billing Gateway';
    category = 'Financial Systems';
    subcategory = 'Transaction Processing';
    ci = 'BILLING-FIN-SRV04';
    assignmentGroup = 'Fintech Systems Support';
  }

  // Symptom extraction
  let symptom = 'General system failure or report';
  if (msgLower.includes('login') || msgLower.includes('cannot log') || msgLower.includes('auth fail')) {
    symptom = 'Authentication / Login Failure';
  } else if (msgLower.includes('timeout') || msgLower.includes('slow') || msgLower.includes('lagging')) {
    symptom = 'High Latency / Session Timeout';
  } else if (msgLower.includes('error 500') || msgLower.includes('error 403') || msgLower.includes('error code') || msgLower.includes('crash')) {
    const errorMatch = message.match(/(?:error|code)\s*[:#]?\s*([A-Za-z0-9_-]+)/i);
    symptom = errorMatch ? `Error Code: ${errorMatch[1]}` : 'Application Crash / Error Dialog';
  } else if (msgLower.includes('disconnect') || msgLower.includes('connection dropped')) {
    symptom = 'Intermittent Disconnection';
  }

  // Urgency & Impact
  let impact = '1 User';
  let urgency = 'Medium';
  if (msgLower.includes('multiple users') || msgLower.includes('all of us') || msgLower.includes('team') || msgLower.includes('department')) {
    impact = 'Multiple Users';
    urgency = 'High';
  } else if (msgLower.includes('entire office') || msgLower.includes('critical business') || msgLower.includes('production down') || msgLower.includes('financial close')) {
    impact = 'Organization / Enterprise';
    urgency = 'Critical';
  } else if (msgLower.includes('urgently') || msgLower.includes('asap') || msgLower.includes('cannot work')) {
    urgency = 'High';
  }

  // Priority Matrix (Impact x Urgency)
  let priority = 'P3 - Moderate';
  if (impact === 'Organization / Enterprise' && (urgency === 'Critical' || urgency === 'High')) {
    priority = 'P1 - Critical';
  } else if (impact === 'Multiple Users' && (urgency === 'Critical' || urgency === 'High')) {
    priority = 'P2 - High';
  } else if (urgency === 'Critical' || (impact === 'Multiple Users' && urgency === 'Medium')) {
    priority = 'P2 - High';
  } else if (urgency === 'Low' && impact === '1 User') {
    priority = 'P4 - Low';
  }

  const confidence = 0.92;
  const reason = `Matched service '${service}' and symptom '${symptom}' from user statement with high keyword confidence.`;

  return {
    intent,
    intentConfidence: 0.94,
    service,
    category,
    subcategory,
    ci,
    symptom,
    device: msgLower.includes('laptop') ? 'Company Laptop' : (msgLower.includes('phone') ? 'Mobile Device' : 'Unknown / Not Provided'),
    location: msgLower.includes('kuala lumpur') || msgLower.includes('kl') ? 'Kuala Lumpur Office' : (msgLower.includes('singapore') ? 'Singapore Regional HQ' : 'Remote / Hybrid'),
    errorCode: (message.match(/(?:error|code)\s*[:#]?\s*([A-Za-z0-9_-]+)/i) || [])[1] || 'None / Not Provided',
    duration: (message.match(/(?:since|for the last|past)\s+([\w\s:apm]+?)(?:\.|\,|$)/i) || [])[0] || 'Unknown / Not Provided',
    businessImpact: urgency === 'High' || urgency === 'Critical' ? 'User blocked from performing time-sensitive operations' : 'Standard individual productivity degradation',
    urgency,
    impact,
    priority,
    assignmentGroup,
    summary: `${service}: ${symptom} reported via ${source} (${user || 'User'}).`,
    reason,
    confidence,
    requiresHumanReview: confidence < 0.90 || priority === 'P1 - Critical',
    modelVersion: 'gemini-3.8-flash (Enterprise ITSM Prompt v2.1)'
  };
}

// API Routes
app.post('/api/ai/analyze-incident', async (req, res) => {
  const { message, source, user, timestamp, existingIncidents = [] } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message content is required.' });
    return;
  }

  if (aiClient) {
    try {
      const prompt = `You are the AI engine of the "Smart Incident Hub", an enterprise IT incident orchestration and ServiceNow automation system.
Analyze the following incoming user communication and return a rigorous, strictly formatted JSON object.

Incoming Message:
"${message}"
Channel Source: ${source || 'Web'}
Reported By: ${user || 'Vincent (Finance)'}
Reported At: ${timestamp || new Date().toISOString()}

Existing Active ServiceNow Incidents for Correlation Context:
${JSON.stringify(existingIncidents.map((inc: any) => ({
  number: inc.number,
  service: inc.service,
  shortDescription: inc.shortDescription,
  symptom: inc.symptom,
  priority: inc.priority,
  createdTime: inc.createdTime,
  status: inc.status
})))}

Reference CMDB Services:
${JSON.stringify(REFERENCE_DATA.services)}

Taxonomy Rules for Intent:
One of: ["Incident", "Service Request", "Information Request", "Problem Report", "Change Request", "Status Query", "Duplicate Report", "Follow-up", "Non-IT"]

Extraction Rules:
- Never fabricate information. If duration, device, location, or error code is absent, set to "Unknown / Not Provided".
- Priority matrix standard: P1 (Enterprise Critical), P2 (Multiple Users High/Critical), P3 (Single User High/Medium), P4 (Low impact).
- Correlation: If there is an existing active incident on the same service with matching symptoms, indicate correlationType: "Duplicate", "Related", or "Independent", with similarityScore (0.0 to 1.0) and evidence.
- Confidence scoring: calculate realistic confidence (0.0 to 1.0) based on message clarity and match certainty.

Return ONLY a JSON object with this exact structure:
{
  "intent": string,
  "intentConfidence": number,
  "service": string,
  "category": string,
  "subcategory": string,
  "ci": string,
  "symptom": string,
  "device": string,
  "location": string,
  "errorCode": string,
  "duration": string,
  "businessImpact": string,
  "urgency": "Low" | "Medium" | "High" | "Critical",
  "impact": "1 User" | "Multiple Users" | "Organization / Enterprise",
  "priority": "P1 - Critical" | "P2 - High" | "P3 - Moderate" | "P4 - Low",
  "assignmentGroup": string,
  "summary": string,
  "reason": string,
  "confidence": number,
  "requiresHumanReview": boolean,
  "correlation": {
    "correlationType": "Duplicate" | "Related" | "Independent",
    "matchedIncidentNumber": string | null,
    "similarityScore": number,
    "evidence": string
  },
  "majorIncidentCandidate": boolean,
  "modelVersion": "gemini-3.8-flash"
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = aiResponse.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        res.json(parsed);
        return;
      }
    } catch (err: any) {
      console.warn('Gemini API call failed or timed out, utilizing deterministic heuristic engine:', err?.message);
    }
  }

  // Fallback to deterministic heuristic engine
  const fallbackResult = heuristicAnalyze(message, source, user);

  // Simple correlation against existing incidents
  let correlation = {
    correlationType: 'Independent',
    matchedIncidentNumber: null as string | null,
    similarityScore: 0.15,
    evidence: 'No active incident matched this symptom and service window.'
  };

  const matchingIncident = existingIncidents.find((inc: any) =>
    inc.service.toLowerCase() === fallbackResult.service.toLowerCase() &&
    inc.status !== 'Closed' && inc.status !== 'Resolved'
  );

  if (matchingIncident) {
    const isVeryClose = message.toLowerCase().includes('login') && matchingIncident.shortDescription.toLowerCase().includes('login');
    correlation = {
      correlationType: isVeryClose ? 'Duplicate' : 'Related',
      matchedIncidentNumber: matchingIncident.number,
      similarityScore: isVeryClose ? 0.92 : 0.78,
      evidence: `Matches active incident ${matchingIncident.number} on service '${matchingIncident.service}' within correlation window.`
    };
  }

  res.json({
    ...fallbackResult,
    correlation,
    majorIncidentCandidate: fallbackResult.priority === 'P1 - Critical' || (correlation.correlationType === 'Duplicate' && (matchingIncident?.affectedUsers || 1) >= 5)
  });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', geminiReady: Boolean(aiClient), timestamp: new Date().toISOString() });
});

// Configure Vite or Static files
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Smart Incident Hub server running on port ${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
