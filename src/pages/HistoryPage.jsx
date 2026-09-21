import React, { useEffect, useState } from 'react';
import {
  Clock,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Send,
  CheckCircle2,
  Filter,
  Check,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';

export const HistoryPage = () => {
  const [alerts, setAlerts] = useState([]);;
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedAlertId, setExpandedAlertId] = useState(null);

  useEffect(() => {
    loadAlertHistory();
  }, [statusFilter]);

  const loadAlertHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getAlerts({ status: statusFilter || undefined, limit: 20 });
      setAlerts(res.data);
    } catch (err) {
      console.error('Error fetching alert history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Acknowledged':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Sent':
        return 'bg-red-50 text-red-800 border-red-200 animate-pulse';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Clock className="w-6 h-6 text-[#0f4c5c]" />
            <span>Alert History</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Audit trail of your triggered Silent SOS alerts and notification delivery logs.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]"
          >
            <option value="">All Statuses</option>
            <option value="Sent">Sent (Active)</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading alert history...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-gray-800">No alert logs found</h2>
          <p className="text-xs text-gray-500 mt-1">
            {statusFilter ? `No alerts with status "${statusFilter}".` : 'You have not triggered any Silent SOS alerts.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const isExpanded = expandedAlertId === alert.id;
            const mapsUrl = `https://www.google.com/maps?q=${alert.liveLocation.latitude},${alert.liveLocation.longitude}`;

            return (
              <div
                key={alert.id}
                className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden transition-all hover:border-teal-200"
              >
                {/* Summary Row */}
                <div
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2 rounded-lg bg-teal-50 text-[#0f4c5c] shrink-0 mt-0.5">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {new Date(alert.triggerTime).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          at{' '}
                          {new Date(alert.triggerTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            alert.status
                          )}`}
                        >
                          {alert.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1.5">
                        <span>
                          Coordinates: {alert.liveLocation.latitude.toFixed(4)}, {alert.liveLocation.longitude.toFixed(4)} (±{Math.round(alert.liveLocation.accuracy)}m)
                        </span>
                        {alert.responseTimeSeconds && (
                          <span className="text-emerald-700 font-medium">
                            Duration: {alert.responseTimeSeconds}s
                          </span>
                        )}
                        <span>
                          {alert.contactsNotified.length} contact(s) notified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#0f4c5c]" />
                      <span>Map</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>

                    <button
                      type="button"
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50/50 space-y-4 text-xs">
                    {/* Contacts Notified Summary */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Contacts Notified</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {alert.contactsNotified.map((cn, i) => (
                          <div
                            key={i}
                            className="bg-white p-3 rounded-lg border border-gray-200/80 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-gray-800">{cn.name}</span>
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                Channels: {cn.channels.join(', ')}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {cn.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Acknowledgement Notes */}
                    {alert.acknowledgementDetails && (
                      <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                        <div className="flex items-center space-x-1.5 text-blue-900 font-semibold mb-1">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>Acknowledgement Details</span>
                        </div>
                        <p className="text-blue-800 text-[11px]">
                          Acknowledged by <strong>{alert.acknowledgementDetails.acknowledgedBy}</strong> at{' '}
                          {alert.acknowledgementDetails.acknowledgedAt
                            ? new Date(alert.acknowledgementDetails.acknowledgedAt).toLocaleTimeString()
                            : ''}
                          .
                          {alert.acknowledgementDetails.note && (
                            <span className="block mt-1 text-gray-600 italic">
                              "{alert.acknowledgementDetails.note}"
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Activity Log Trail */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Activity Audit Trail</h4>
                      <div className="space-y-1.5">
                        {alert.activityLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 text-[11px]"
                          >
                            <span className="text-gray-700">{log.details || log.action}</span>
                            <span className="font-mono text-gray-400 text-[10px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
