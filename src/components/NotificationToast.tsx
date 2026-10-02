import React from 'react';
import { CheckCircle2, MessageSquare, Mail, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  source: 'Teams' | 'Email' | 'System';
  incidentNumber?: string;
  timestamp: string;
}

interface NotificationToastProps {
  notifications: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {notifications.map(n => (
        <div
          key={n.id}
          className="pointer-events-auto bg-slate-900 border border-indigo-500/40 text-slate-100 p-4 rounded-2xl shadow-2xl space-y-2 animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-400">
              {n.source === 'Teams' ? (
                <MessageSquare className="w-4 h-4 text-indigo-400" />
              ) : (
                <Mail className="w-4 h-4 text-sky-400" />
              )}
              <span>{n.title}</span>
            </div>
            <button
              onClick={() => onDismiss(n.id)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">{n.message}</p>

          {n.incidentNumber && (
            <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 inline-block font-bold">
              ServiceNow Ticket: {n.incidentNumber}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
