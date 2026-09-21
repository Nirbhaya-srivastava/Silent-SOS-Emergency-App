import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, CheckCircle, Radio } from 'lucide-react';


const HOLD_DURATION_MS = 1000;

export const SosButton = ({
  onActivate,
  disabled = false,
  isActiveAlert = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const activatedRef = useRef(false);

  const startPress = () => {
    if (disabled || isActiveAlert) return;
    setIsPressing(true);
    activatedRef.current = false;
    startTimeRef.current = performance.now();

    const updateLoop = (now) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const currentProgress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(currentProgress);

      if (elapsed >= HOLD_DURATION_MS) {
        if (!activatedRef.current) {
          activatedRef.current = true;
          setIsPressing(false);
          setProgress(100);
          onActivate();
        }
        return;
      }

      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);
  };

  const endPress = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    startTimeRef.current = null;
    setIsPressing(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // SVG dimensions for circular progress
  const size = 260;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div id="sos-trigger-container" className="flex flex-col items-center justify-center p-4 prevent-select">
      <div className="relative flex items-center justify-center w-[280px] h-[280px]">
        {/* Background SVG Circle and Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress fill */}
          {!isActiveAlert && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e63946"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-75"
            />
          )}
        </svg>

        {/* SOS Action Button */}
        <button
          type="button"
          id="btn-silent-sos-trigger"
          disabled={disabled || isActiveAlert}
          aria-label={
            isActiveAlert
              ? 'Emergency alert is currently active'
              : 'Hold for 1 second to send Silent SOS'
          }
          onMouseDown={startPress}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          onTouchStart={(e) => {
            e.preventDefault();
            startPress();
          }}
          onTouchEnd={endPress}
          onTouchCancel={endPress}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              if (!isPressing) startPress();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              endPress();
            }
          }}
          className={`relative z-10 w-[220px] h-[220px] rounded-full flex flex-col items-center justify-center text-center p-4 transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-[#0f4c5c]/40 ${
            isActiveAlert
              ? 'bg-[#e63946] text-white shadow-xl cursor-default'
              : isPressing
              ? 'bg-[#d62839] text-white scale-95 shadow-inner'
              : 'bg-[#0f4c5c] text-white hover:bg-[#0d3f4c] shadow-lg cursor-pointer'
          }`}
        >
          {isActiveAlert ? (
            <>
              <div className="flex items-center space-x-1.5 mb-2">
                <Radio className="w-6 h-6 text-white animate-pulse" />
                <span className="text-xs uppercase tracking-wider font-semibold">Active</span>
              </div>
              <span className="text-lg font-bold leading-tight">SOS Transmitting</span>
              <span className="text-xs text-white/90 mt-1">Live GPS Sharing</span>
            </>
          ) : (
            <>
              <ShieldAlert className={`w-10 h-10 mb-2 transition-transform ${isPressing ? 'scale-110' : ''}`} />
              <span className="text-lg font-bold uppercase tracking-wide leading-snug">
                Hold to Send
                <br />
                Silent SOS
              </span>
              <span className="text-xs text-teal-200 mt-2 font-medium">
                {isPressing ? `Holding... ${Math.round(progress)}%` : 'Hold for 1 second'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Safety Instructions / Status hint */}
      <div className="mt-4 text-center max-w-xs">
        {isActiveAlert ? (
          <div className="flex items-center justify-center space-x-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Contacts notified • Silent GPS streaming</span>
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            Press and hold for 1 continuous second. Dispatches silently with <span className="font-semibold text-gray-700">no sound or ring</span>.
          </p>
        )}
      </div>
    </div>
  );
};
