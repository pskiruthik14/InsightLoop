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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EDF1EB] text-[#2D3A31] border border-[#8C9A84]/40 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-[#4D6347] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span>Positive</span>
      </span>
    );
  }

  if (norm === 'negative') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FBF0ED] text-[#AA6552] border border-[#C27B66]/30 ${className}`}>
        <AlertCircle className="w-3.5 h-3.5 text-[#C27B66] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span>Negative</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F2EDE6] text-[#5C5348] border border-[#DCCFC2] ${className}`}>
      <MinusCircle className="w-3.5 h-3.5 text-[#8C7E72] shrink-0" strokeWidth={1.5} aria-hidden="true" />
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
      bg: 'bg-[#FBF0ED]',
      text: 'text-[#AA6552]',
      border: 'border-[#C27B66]/40',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#C27B66]" strokeWidth={1.5} />
    },
    high: {
      label: 'High',
      bg: 'bg-[#F7EFE8]',
      text: 'text-[#8F5543]',
      border: 'border-[#D9BFB2]',
      icon: <AlertCircle className="w-3.5 h-3.5 text-[#AA6552]" strokeWidth={1.5} />
    },
    medium: {
      label: 'Medium',
      bg: 'bg-[#F2EDE6]',
      text: 'text-[#5C5348]',
      border: 'border-[#DCCFC2]',
      icon: <Clock className="w-3.5 h-3.5 text-[#8C7E72]" strokeWidth={1.5} />
    },
    low: {
      label: 'Low',
      bg: 'bg-[#EDF1EB]',
      text: 'text-[#445941]',
      border: 'border-[#B2C2AD]',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#637C5E]" strokeWidth={1.5} />
    }
  };

  const c = configs[norm] || configs.medium;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border} ${className}`}>
      {c.icon}
      <span>{c.label}</span>
    </span>
  );
};

export const EmotionBadge: React.FC<{ emotion: string; className?: string }> = ({ emotion, className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal bg-[#F2EDE6]/80 text-[#2D3A31] border border-[#E6E2DA] ${className}`}>
      {emotion}
    </span>
  );
};
