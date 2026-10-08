import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PriorityBadge } from '../components/common/Badge';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { RecommendationItem } from '../types';
import {
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Info,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const RecommendationsView: React.FC = () => {
  const { showToast } = useToast();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.getRecommendations();
      setRecommendations(res.recommendations);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateRecommendationStatus(id, newStatus);
      showToast({ type: 'success', title: `Action item moved to ${newStatus.replace('_', ' ')}` });
      loadData();
    } catch {
      showToast({ type: 'error', title: 'Update failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Tactical Recommendations Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Low-cost, high-impact operational solutions prioritized by our mathematical scoring formula.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Formula: </strong> Severity (35%) + Frequency (25%) + Recency (20%) + Trend (20%)
          </span>
        </div>
      </div>

      {/* Priority Action Items List (Section 20 & 21) */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isResolved = rec.status === 'resolved';
          const isInProgress = rec.status === 'in_progress';

          return (
            <Card
              key={rec.id}
              className={isResolved ? 'opacity-70 bg-slate-50/50' : ''}
              title={
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    #{rec.priority_rank}
                  </span>
                  <div>
                    <h3 className={`font-bold text-slate-900 text-sm ${isResolved ? 'line-through' : ''}`}>
                      {rec.title}
                    </h3>
                    <p className="text-xs text-slate-500">{rec.description}</p>
                  </div>
                </div>
              }
              action={
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    Score: {rec.priority_score} / 100
                  </span>
                  <PriorityBadge priority={rec.priority_score > 85 ? 'critical' : rec.priority_score > 70 ? 'high' : 'medium'} />
                </div>
              }
            >
              <div className="space-y-4 text-xs">
                {/* Rationale & Explainability (Section 21) */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-semibold text-slate-900 text-xs">Why this recommendation?</span>
                  <p className="text-slate-700 leading-relaxed font-sans">{rec.rationale}</p>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-slate-600 text-[11px]">
                    <div>
                      Affected Volume: <strong>{rec.affected_count} Customers</strong>
                    </div>
                    <div>
                      Estimated Cost: <strong className="text-emerald-700">{rec.estimated_cost}</strong>
                    </div>
                    <div>
                      Expected Return: <strong>{rec.potential_impact}</strong>
                    </div>
                  </div>
                </div>

                {/* Implementation Steps Checklist */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Step-by-Step Implementation SOP:</h4>
                  <div className="space-y-1.5">
                    {rec.implementation_steps.map((step: string, sIdx: number) => (
                      <div
                        key={sIdx}
                        className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 text-slate-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Operational Pillar: <strong>{rec.category}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={rec.status === 'open' ? 'secondary' : 'outline'}
                      onClick={() => handleStatusChange(rec.id, 'open')}
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant={isInProgress ? 'primary' : 'outline'}
                      onClick={() => handleStatusChange(rec.id, 'in_progress')}
                    >
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant={isResolved ? 'secondary' : 'outline'}
                      onClick={() => handleStatusChange(rec.id, 'resolved')}
                    >
                      {isResolved ? 'Resolved ✓' : 'Mark Resolved'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
