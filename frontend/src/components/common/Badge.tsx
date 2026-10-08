import React from 'react';
import { CheckCircle2, MinusCircle, AlertCircle, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

interface SentimentBadgeProps {
  sentiment: 'Positive' | 'Neutral' | 'Negative' | string;
  className?: string;
}

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment, className = '' }) => {
  const norm = sentiment ? sentiment.toLowerCase() : 'neutral';

  if (norm === 'positive') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />
        <span>Positive</span>
      </span>
    );
  }

  if (norm === 'negative') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
        <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" aria-hidden="true" />
        <span>Negative</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
      <MinusCircle className="w-3 h-3 text-amber-600 shrink-0" aria-hidden="true" />
      <span>Neutral</span>
    </span>
  );
};

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'critical' | string;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const norm = priority ? priority.toLowerCase() : 'medium';

  const configs: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    critical: {
      label: 'Critical',
      bg: 'bg-rose-100',
      text: 'text-rose-800',
      border: 'border-rose-300',
      icon: <AlertTriangle className="w-3 h-3 text-rose-600" />
    },
    high: {
      label: 'High',
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
      icon: <AlertCircle className="w-3 h-3 text-orange-600" />
    },
    medium: {
      label: 'Medium',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <Clock className="w-3 h-3 text-amber-600" />
    },
    low: {
      label: 'Low',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <ShieldCheck className="w-3 h-3 text-slate-500" />
    }
  };

  const c = configs[norm] || configs.medium;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}>
      {c.icon}
      <span>{c.label}</span>
    </span>
  );
};

export const EmotionBadge: React.FC<{ emotion: string; className?: string }> = ({ emotion, className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
      {emotion}
    </span>
  );
};
