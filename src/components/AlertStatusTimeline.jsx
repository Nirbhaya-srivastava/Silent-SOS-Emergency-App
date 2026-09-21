import React from 'react';
import { Send, CheckCircle2, ShieldCheck, Check } from 'lucide-react';


export const AlertStatusTimeline = ({
  status,
  triggerTime,
  acknowledgedAt,
  acknowledgedBy,
  resolvedTime,
  responseTimeSeconds,
}) => {
  const steps = [
    {
      id: 'Sent',
      title: 'Alert Dispatched',
      subtitle: triggerTime ? new Date(triggerTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Pending',
      description: 'Dispatched to trusted contacts via SMS & Email',
      icon: Send,
    },
    {
      id: 'Acknowledged',
      title: 'Acknowledged',
      subtitle: acknowledgedAt
        ? new Date(acknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : 'Awaiting responder',
      description: acknowledgedBy ? `Confirmed by ${acknowledgedBy}` : 'Emergency operator reviewing',
      icon: ShieldCheck,
    },
    {
      id: 'Resolved',
      title: 'Resolved',
      subtitle: resolvedTime
        ? `${new Date(resolvedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${responseTimeSeconds || 0}s duration)`
        : 'In progress',
      description: resolvedTime ? 'Emergency ended & safety confirmed' : 'Location streaming active',
      icon: CheckCircle2,
    },
  ];

  const getStepState = (stepId) => {
    if (status === 'Resolved') return 'completed';
    if (status === 'Acknowledged') {
      if (stepId === 'Sent') return 'completed';
      if (stepId === 'Acknowledged') return 'current';
      return 'upcoming';
    }
    // Sent
    if (stepId === 'Sent') return 'current';
    return 'upcoming';
  };

  return (
    <div id="alert-status-timeline" className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Emergency Alert Timeline</h3>
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            status === 'Resolved'
              ? 'bg-emerald-100 text-emerald-800'
              : status === 'Acknowledged'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800 animate-pulse'
          }`}
        >
          Status: {status}
        </span>
      </div>

      <div className="relative">
        <div className="grid grid-cols-3 gap-2 text-center">
          {steps.map((step, idx) => {
            const state = getStepState(step.id);
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center relative">
                {/* Connector line between steps */}
                {idx < steps.length - 1 && (
                  <div
                    className={`hidden sm:block absolute top-5 left-1/2 w-full h-0.5 -z-0 ${
                      state === 'completed' ? 'bg-[#2a9d8f]' : 'bg-gray-200'
                    }`}
                  />
                )}

                {/* Circle Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${
                    state === 'completed'
                      ? 'bg-[#2a9d8f] text-white shadow-sm'
                      : state === 'current'
                      ? 'bg-[#e63946] text-white ring-4 ring-red-100 shadow-md animate-pulse'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {state === 'completed' ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                <div className="mt-2.5">
                  <span className="block text-xs font-semibold text-gray-900 leading-tight">
                    {step.title}
                  </span>
                  <span className="block text-[11px] font-medium text-gray-500 mt-0.5">
                    {step.subtitle}
                  </span>
                  <p className="hidden md:block text-[10px] text-gray-400 mt-1 max-w-[120px] mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
