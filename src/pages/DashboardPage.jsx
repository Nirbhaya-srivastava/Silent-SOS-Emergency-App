import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Users,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  ExternalLink,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SosButton } from '../components/SosButton';
import { LiveLocationCard } from '../components/LiveLocationCard';
import { AlertStatusTimeline } from '../components/AlertStatusTimeline';
import { ActivityLogList } from '../components/ActivityLogList';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  const watchPositionIdRef = useRef(null);
  const pollingTimerRef = useRef(null);

  // Load user data: contacts and check for any existing active alerts
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [contactList, alertsRes] = await Promise.all([
          api.getContacts(),
          api.getAlerts({ limit: 5 }),
        ]);

        setContacts(contactList);

        // Check if there is an active alert (Sent or Acknowledged)
        const ongoing = alertsRes.data.find(
          (a) => a.status === 'Sent' || a.status === 'Acknowledged'
        );

        if (ongoing) {
          setActiveAlert(ongoing);
          setCurrentLocation(ongoing.liveLocation);
          startContinuousLocationTracking(ongoing.id);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load dashboard data');
      } finally {
        setLoadingInitial(false);
      }
    }

    loadDashboardData();

    // Query preliminary device location on mount to be ready
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy || 10,
            updatedAt: new Date().toISOString(),
          });
          setPermissionDenied(false);
        },
        (err) => {
          console.warn('Initial geolocation check:', err.message);
          if (err.code === err.PERMISSION_DENIED) {
            setPermissionDenied(true);
          }
        },
        {
  enableHighAccuracy: false,
  maximumAge: 10000,
  timeout: 15000,
}
      );
    }

    return () => {
      stopContinuousLocationTracking();
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, []);

  // Poll for alert status changes (e.g. if acknowledged by admin)
  useEffect(() => {
    if (!activeAlert || activeAlert.status === 'Resolved') {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      return;
    }

    pollingTimerRef.current = setInterval(async () => {
      try {
        const updated = await api.getAlertById(activeAlert.id);
        setActiveAlert(updated);
        if (updated.status === 'Resolved') {
          stopContinuousLocationTracking();
          clearInterval(pollingTimerRef.current);
        }
      } catch (e) {
        // silent polling ignore
      }
    }, 4000);

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [activeAlert?.id, activeAlert?.status]);

  // Start continuous geolocation tracking and streaming
  const startContinuousLocationTracking = (alertId) => {
    setIsTrackingLocation(true);

    if (!('geolocation' in navigator)) {
      console.warn('Geolocation API not supported on this browser');
      return;
    }

    if (watchPositionIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchPositionIdRef.current);
    }

    try {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || 10,
            updatedAt: new Date().toISOString(),
          };
          setCurrentLocation(loc);

          // Stream location to backend
          try {
            await api.updateAlertLocation(alertId, {
              latitude: loc.latitude,
              longitude: loc.longitude,
              accuracy: loc.accuracy,
            });
          } catch (err) {
            console.warn('Failed streaming location update:', err);
          }
        },
        (error) => {
          console.warn('watchPosition error:', error.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 3000,
          timeout: 10000,
        }
      );

      watchPositionIdRef.current = watchId;
    } catch (e) {
      console.warn('Could not attach watchPosition:', e);
    }
  };

  const stopContinuousLocationTracking = () => {
    if (watchPositionIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchPositionIdRef.current);
      watchPositionIdRef.current = null;
    }
    setIsTrackingLocation(false);
  };

  // Helper to obtain immediate location coords or graceful fallback
  const captureImmediateLocation = () => {
    return new Promise((resolve,reject) => {
      if (currentLocation) {
        return resolve({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          accuracy: currentLocation.accuracy,
        });
      }

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy || 12,
            };
            setCurrentLocation({ ...loc, updatedAt: new Date().toISOString() });
            resolve(loc);
          },
          (err) => {
            console.warn('Geolocation lookup failed:', err);
            if (err.code === err.PERMISSION_DENIED) {
              setPermissionDenied(true);
            }
            reject(new Error(
              err.code === err.TIMEOUT
                ? 'Unable to get your location in time. Please try again.'
                : 'Unable to get your current location.'
            ));
          },  
          { enableHighAccuracy: true, timeout: 4000 }
        );
      } else {
        const fallbackLoc = { latitude: 37.7749, longitude: -122.4194, accuracy: 25 };
        setCurrentLocation({ ...fallbackLoc, updatedAt: new Date().toISOString() });
        resolve(fallbackLoc);
      }
    });
  };

  // Trigger Silent SOS (Invoked when hold reaches 1.0 second)
  const handleTriggerSOS = async () => {
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      const coords = await captureImmediateLocation();

      // Dispatch alert creation
      const alert = await api.createAlert({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      });

      setActiveAlert(alert);
      setSuccessNotice('Silent SOS alert created. Contacts notified & location sharing started.');

      // Start continuous location streaming
      startContinuousLocationTracking(alert.id);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch Silent SOS');
    }
  };

  // Mark Alert as Resolved
  const handleResolveAlert = async () => {
    if (!activeAlert) return;
    try {
      const resolved = await api.resolveAlert(activeAlert.id, 'User reported safe');
      setActiveAlert(resolved);
      stopContinuousLocationTracking();
      setSuccessNotice('Alert resolved. Location sharing concluded.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resolve alert');
    }
  };

  // Manual refresh of location
  const handleRefreshLocation = async () => {
    try {
      await captureImmediateLocation();
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner Notice for Active Alert */}
      {activeAlert && activeAlert.status !== 'Resolved' && (
        <div
          id="active-alert-banner"
          className="bg-red-50 border-l-4 border-[#e63946] p-4 rounded-r-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-red-600 text-white rounded-lg animate-pulse shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-red-900">
                  EMERGENCY ALERT TRANSMITTING
                </h2>
                <span className="text-xs bg-red-200 text-red-800 font-semibold px-2 py-0.5 rounded-full">
                  Status: {activeAlert.status}
                </span>
              </div>
              <p className="text-xs text-red-700 mt-0.5">
                Live coordinates are continuously broadcasting to trusted contacts and emergency responders.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-resolve-alert"
            onClick={handleResolveAlert}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Am Safe • Resolve Alert</span>
          </button>
        </div>
      )}

      {/* Notifications / Alerts feedback */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-xs text-emerald-600 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Main Grid: SOS Activator on Left / Center, Live Stats & Contacts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Discreet SOS Button & Quick Contacts */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          {/* Main SOS Trigger Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="mb-4">
              <h1 className="text-xl font-bold text-gray-900">Silent Emergency Dispatch</h1>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Press and hold button for 1 second. Your emergency contacts will receive your real-time coordinates silently.
              </p>
            </div>

            {/* 1-Second Long Press SOS Button */}
            <SosButton
              onActivate={handleTriggerSOS}
              disabled={loadingInitial}
              isActiveAlert={activeAlert !== null && activeAlert.status !== 'Resolved'}
            />

            {/* Contacts Readiness Warning if 0 contacts */}
            {contacts.filter((c) => c.isActive).length === 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center space-x-2 max-w-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  No active emergency contacts configured. Contacts will not receive notifications until added.
                </span>
                <Link to="/contacts" className="font-semibold underline ml-1 shrink-0">
                  Add Now
                </Link>
              </div>
            )}
          </div>

          {/* Trusted Contacts Mini Card */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#0f4c5c]" />
                <h3 className="text-sm font-semibold text-gray-900">Configured Emergency Contacts</h3>
              </div>
              <Link
                to="/contacts"
                className="text-xs font-semibold text-[#0f4c5c] hover:underline flex items-center space-x-1"
              >
                <span>Manage</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {contacts.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-500 mb-2">No trusted contacts added yet.</p>
                <Link
                  to="/contacts"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-white bg-[#2a9d8f] hover:bg-[#238276] px-3 py-1.5 rounded-md transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add First Contact</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">{c.name}</span>
                      <span className="text-gray-500 ml-1.5 font-normal">({c.relationship})</span>
                      <div className="flex items-center space-x-2 text-[11px] text-gray-500 mt-0.5">
                        <span className="flex items-center space-x-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{c.phone}</span>
                        </span>
                        {c.email && (
                          <span className="hidden sm:flex items-center space-x-0.5">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{c.email}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {c.notificationChannels.map((ch) => (
                        <span
                          key={ch}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Location, Timeline & Activity Logs */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          {/* Live Location Card */}
          <LiveLocationCard
            location={currentLocation}
            isTracking={isTrackingLocation}
            onRefreshLocation={handleRefreshLocation}
            permissionDenied={permissionDenied}
          />

          {/* Alert Status Timeline */}
          {activeAlert && (
            <AlertStatusTimeline
              status={activeAlert.status}
              triggerTime={activeAlert.triggerTime}
              acknowledgedAt={activeAlert.acknowledgementDetails?.acknowledgedAt}
              acknowledgedBy={activeAlert.acknowledgementDetails?.acknowledgedBy}
              resolvedTime={activeAlert.resolvedTime}
              responseTimeSeconds={activeAlert.responseTimeSeconds}
            />
          )}

          {/* Activity Logs */}
          <ActivityLogList
            logs={activeAlert ? activeAlert.activityLogs : []}
            maxDisplay={5}
          />
        </div>
      </div>
    </div>
  );
};
