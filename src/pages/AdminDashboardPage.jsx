import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  CheckCircle2,
  Clock,
  Navigation,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Filter,
  Phone,
  Mail,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Acknowledge Modal State
  const [selectedAlertForAck, setSelectedAlertForAck] = useState(null);
  const [ackNote, setAckNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadAdminData();

    // Periodic auto-refresh every 6 seconds for live monitoring
    const timer = setInterval(() => {
      loadAdminData(true);
    }, 6000);

    return () => clearInterval(timer);
  }, [user, statusFilter]);

  const loadAdminData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [metricsData, alertsData] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminAlerts({ status: statusFilter || undefined, limit: 30 }),
      ]);
      setMetrics(metricsData);
      setAlerts(alertsData.data);
    } catch (err) {
      if (!silent) setActionError(err.message || 'Failed to fetch admin data');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAcknowledge = async (e) => {
    e.preventDefault();
    if (!selectedAlertForAck) return;
    setSubmittingAction(true);
    setActionError(null);

    try {
      const updated = await api.acknowledgeAlert(selectedAlertForAck.id, ackNote);
      setAlerts(alerts.map((a) => (a.id === updated.id ? updated : a)));
      setActionSuccess(`Alert for ${updated.userName || 'user'} acknowledged.`);
      setSelectedAlertForAck(null);
      setAckNote('');
      // Reload metrics
      const newMetrics = await api.getAdminMetrics();
      setMetrics(newMetrics);
    } catch (err) {
      setActionError(err.message || 'Failed to acknowledge alert');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleResolve = async (alert) => {
    if (!window.confirm(`Mark emergency alert for ${alert.userName || 'user'} as RESOLVED?`)) {
      return;
    }

    try {
      const updated = await api.resolveAlert(alert.id, 'Safety verified by operator');
      setAlerts(alerts.map((a) => (a.id === updated.id ? updated : a)));
      setActionSuccess(`Alert for ${updated.userName || 'user'} marked as Resolved.`);
      const newMetrics = await api.getAdminMetrics();
      setMetrics(newMetrics);
    } catch (err) {
      setActionError(err.message || 'Failed to resolve alert');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-red-100 text-[#e63946]">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Safety Operator Dashboard
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time emergency monitoring, rapid response acknowledgement, and platform telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => loadAdminData()}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-xs text-emerald-600 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* 5 Core Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Alerts
            </span>
            <span className="block text-2xl font-extrabold text-gray-900 mt-1">
              {metrics.totalAlerts}
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5 block">Lifetime dispatches</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs bg-red-50/20">
            <div className="flex items-center justify-between">
              <span className="block text-[11px] font-semibold text-red-700 uppercase tracking-wider">
                Active Alerts
              </span>
              {metrics.activeAlerts > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              )}
            </div>
            <span className="block text-2xl font-extrabold text-red-600 mt-1">
              {metrics.activeAlerts}
            </span>
            <span className="text-[11px] text-red-600/80 mt-0.5 block">Require attention</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Ack Rate
            </span>
            <span className="block text-2xl font-extrabold text-[#0f4c5c] mt-1">
              {metrics.acknowledgementRate}%
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5 block">Confirmation ratio</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Avg Response
            </span>
            <span className="block text-2xl font-extrabold text-[#2a9d8f] mt-1">
              {metrics.averageResponseTimeSeconds}s
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5 block">From trigger to resolution</span>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Notified Contacts
            </span>
            <span className="block text-2xl font-extrabold text-gray-900 mt-1">
              {metrics.successfulNotificationCount}
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5 block">Dispatched via SMS/Email</span>
          </div>
        </div>
      )}

      {/* Filter and Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
          <span>Incoming Emergency Feeds</span>
          <span className="text-xs font-normal text-gray-500">
            ({alerts.length} shown)
          </span>
        </h2>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]"
          >
            <option value="">All Statuses</option>
            <option value="Sent">Sent (New Unacknowledged)</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Table/Cards */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading live alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
          <Radio className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No emergency alerts matching filter</h3>
          <p className="text-xs text-gray-500 mt-1">Platform feeds are operational and standing by.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">User & Contact</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Trigger Time</th>
                  <th className="px-4 py-3 text-left">Latest GPS Coordinates</th>
                  <th className="px-4 py-3 text-left">Contacts Notified</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {alerts.map((alert) => {
                  const mapsUrl = `https://www.google.com/maps?q=${alert.liveLocation.latitude},${alert.liveLocation.longitude}`;
                  const isActive = alert.status === 'Sent' || alert.status === 'Acknowledged';

                  return (
                    <tr
                      key={alert.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        alert.status === 'Sent' ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{alert.userName || 'Anonymous User'}</div>
                        <div className="text-[11px] text-gray-500 font-mono flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{alert.userPhone || 'No phone'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] border ${
                            alert.status === 'Resolved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : alert.status === 'Acknowledged'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-red-50 text-red-800 border-red-200 animate-pulse'
                          }`}
                        >
                          {alert.status}
                        </span>
                      </td>

                      {/* Trigger Time */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-gray-900 font-medium">
                          {new Date(alert.triggerTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(alert.triggerTime).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Location & Map Link */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono text-gray-700 text-[11px]">
                          {alert.liveLocation.latitude.toFixed(4)}, {alert.liveLocation.longitude.toFixed(4)}
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] text-gray-400">
                            ±{Math.round(alert.liveLocation.accuracy)}m
                          </span>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-0.5 text-[11px] font-semibold text-[#0f4c5c] hover:underline"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>View Map</span>
                            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                          </a>
                        </div>
                      </td>

                      {/* Contacts Notified count */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-gray-800 font-medium">
                          {alert.contactsNotified.length} contact(s)
                        </span>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          {alert.contactsNotified.filter((c) => c.status === 'Delivered').length} delivered
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-1.5">
                        {alert.status === 'Sent' && (
                          <button
                            type="button"
                            onClick={() => setSelectedAlertForAck(alert)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-[#0f4c5c] hover:bg-[#0a3641] text-white font-semibold rounded-lg shadow-xs transition-colors text-[11px]"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Acknowledge</span>
                          </button>
                        )}

                        {isActive && (
                          <button
                            type="button"
                            onClick={() => handleResolve(alert)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors text-[11px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolve</span>
                          </button>
                        )}

                        {alert.status === 'Resolved' && (
                          <span className="text-[11px] text-gray-400 italic">
                            Resolved ({alert.responseTimeSeconds || 0}s)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Acknowledge Confirmation Modal */}
      {selectedAlertForAck && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#0f4c5c]" />
                <h3 className="text-base font-bold text-gray-900">
                  Acknowledge Emergency Dispatch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlertForAck(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Confirming receipt of alert for{' '}
              <strong className="text-gray-900">{selectedAlertForAck.userName}</strong>. This signals
              to the user and emergency contacts that safety protocols are underway.
            </p>

            <form onSubmit={handleAcknowledge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Operator Dispatch Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={ackNote}
                  onChange={(e) => setAckNote(e.target.value)}
                  placeholder="e.g., Campus security dispatched to coordinates; user checked in."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c5c] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAlertForAck(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 bg-[#0f4c5c] hover:bg-[#0a3641] text-white text-xs font-semibold rounded-lg shadow transition-colors disabled:opacity-50 flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>{submittingAction ? 'Processing...' : 'Confirm Acknowledged'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
