import React from 'react';
import { MapPin, Navigation, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';


export const LiveLocationCard = ({
  location,
  isTracking,
  onRefreshLocation,
  permissionDenied = false,
}) => {
  const googleMapsUrl = location
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    : '#';
  const osmUrl = location
    ? `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`
    : '#';

  return (
    <div id="live-location-card" className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${isTracking ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-[#0f4c5c]'}`}>
            <MapPin className={`w-5 h-5 ${isTracking ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Live GPS Location</h3>
            <p className="text-xs text-gray-500">
              {isTracking ? 'Real-time background tracking active' : 'Device location standby'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isTracking && (
            <span className="flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              <span>LIVE</span>
            </span>
          )}
          {onRefreshLocation && (
            <button
              type="button"
              id="btn-refresh-gps"
              onClick={onRefreshLocation}
              title="Refresh GPS coordinates"
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {permissionDenied && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Location access disabled</p>
            <p className="mt-0.5">Please allow location permissions in your browser so trusted contacts receive accurate coordinates.</p>
          </div>
        </div>
      )}

      {location ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono text-xs">
            <div>
              <span className="text-gray-400 block text-[11px] font-sans">Latitude</span>
              <span className="text-gray-800 font-medium">{location.latitude.toFixed(5)}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px] font-sans">Longitude</span>
              <span className="text-gray-800 font-medium">{location.longitude.toFixed(5)}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-sans">
              <span className="text-gray-500">
                Accuracy: <strong className="text-gray-700">±{Math.round(location.accuracy)} meters</strong>
              </span>
              <span className="text-gray-400">
                Updated {new Date(location.updatedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-1 text-xs font-medium py-2 px-3 bg-teal-50 text-[#0f4c5c] hover:bg-teal-100 rounded-lg transition-colors border border-teal-200/60"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>

            <a
              href={osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-1 text-xs font-medium py-2 px-3 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <Navigation className="w-3.5 h-3.5 text-gray-500" />
              <span>OpenStreetMap</span>
              <ExternalLink className="w-3 h-3 ml-0.5 text-gray-400" />
            </a>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <Navigation className="w-6 h-6 mx-auto mb-1 text-gray-300" />
          <p>Coordinates will be captured when SOS is activated</p>
        </div>
      )}
    </div>
  );
};
