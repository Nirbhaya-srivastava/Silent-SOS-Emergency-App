import React from 'react';
import { Activity, Clock, ShieldCheck, MapPin, Send, CheckCircle2 } from 'lucide-react';


export const ActivityLogList = ({ logs, maxDisplay = 6 }) => {
  const displayLogs = logs.slice(-maxDisplay).reverse();

  const getActionBadge = (action) => {
    switch (action) {
      case 'ALERT_TRIGGERED':
        return {
          icon: Send,
          color: 'text-red-700 bg-red-50 border-red-200',
          label: 'SOS Triggered',
        };
      case 'CONTACTS_NOTIFIED':
        return {
          icon: Activity,
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          label: 'Notifications Dispatched',
        };
      case 'LOCATION_UPDATED':
        return {
          icon: MapPin,
          color: 'text-teal-700 bg-teal-50 border-teal-200',
          label: 'Location Streamed',
        };
      case 'ALERT_ACKNOWLEDGED':
        return {
          icon: ShieldCheck,
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          label: 'Acknowledged',
        };
      case 'ALERT_RESOLVED':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          label: 'Alert Resolved',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          label: action,
        };
    }
  };

  return (
    <div id="activity-logs-container" className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Recent Activity Logs</h3>
        </div>
        <span className="text-xs text-gray-400">{logs.length} logged events</span>
      </div>

      {displayLogs.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-400">
          No activity logs recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {displayLogs.map((log, index) => {
            const badge = getActionBadge(log.action);
            const Icon = badge.icon;
            const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={index}
                className="flex items-start justify-between p-2.5 rounded-lg bg-gray-50/70 border border-gray-100 text-xs"
              >
                <div className="flex items-start space-x-2.5">
                  <span className={`p-1 rounded border shrink-0 mt-0.5 ${badge.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-gray-800">{badge.label}</span>
                      {log.actorRole && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 bg-gray-200 text-gray-600 rounded">
                          {log.actorRole}
                        </span>
                      )}
                    </div>
                    {log.details && <p className="text-gray-600 text-[11px] mt-0.5">{log.details}</p>}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-gray-400 shrink-0 ml-2">{timeFormatted}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
