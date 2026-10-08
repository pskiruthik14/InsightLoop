import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PriorityBadge } from '../components/common/Badge';
import { api } from '../services/api';
import { TopicItem, IssueCluster, RootCauseItem } from '../types';
import {
  Layers,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface TopicsViewProps {
  onFilterByTopic: (topic: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const TopicsView: React.FC<TopicsViewProps> = ({
  onFilterByTopic,
  onNavigateTab,
}) => {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [issues, setIssues] = useState<IssueCluster[]>([]);
  const [rootCauses, setRootCauses] = useState<RootCauseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'clusters' | 'root_causes'>('clusters');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topRes = await api.getTopics();
        const issRes = await api.getIssues();
        const rcRes = await api.getRootCauses();
        setTopics(topRes.topics);
        setIssues(issRes.issues);
        setRootCauses(rcRes.root_causes);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header and Toggle */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Topics & Operational Failure Clusters</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-clustering recurring problems and identifying root operational failure points.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('clusters')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'clusters' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recurring Issue Clusters
          </button>
          <button
            onClick={() => setActiveTab('root_causes')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'root_causes' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Root-Cause Intelligence (Evidence vs Hypothesis)
          </button>
        </div>
      </div>

      {/* High-Level Topic Volume Distribution (Section 15) */}
      <Card
        title="Topic Share of Voice"
        subtitle="Click any category to filter all matching customer reviews in the Feedback Inbox"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topics.map((t) => (
            <div
              key={t.id}
              onClick={() => onFilterByTopic(t.name)}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900 text-xs group-hover:text-indigo-600">
                  {t.name}
                </span>
                <span className="text-[11px] font-mono text-slate-500">{t.feedback_count} reviews</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex mb-2">
                <div className="h-full bg-emerald-500" style={{ width: `${t.positive_pct}%` }} />
                <div className="h-full bg-rose-500" style={{ width: `${t.negative_pct}%` }} />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 font-medium">{t.positive_pct}% Pos</span>
                <span className="text-slate-400">•</span>
                <span className="text-rose-600 font-medium">{t.negative_pct}% Neg</span>
                <span className="text-slate-400">•</span>
                <span className="text-indigo-600 font-semibold group-hover:underline">View Inbox →</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tab 1: Issue Clustering (Section 16) */}
      {activeTab === 'clusters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Recurring Customer Problems</h3>
            <span className="text-xs text-slate-500">{issues.length} distinct problem clusters identified</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((iss) => (
              <Card
                key={iss.id}
                title={
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{iss.name}</span>
                  </div>
                }
                action={<PriorityBadge priority={iss.severity} />}
                subtitle={`Operational Pillar: ${iss.topic}`}
              >
                <div className="space-y-3.5 text-xs">
                  {/* Metric Ribbon */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <div>
                      <p className="text-base font-bold text-slate-900">{iss.feedback_count}</p>
                      <p className="text-[10px] text-slate-500">Total Mentions</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-rose-600">{iss.negative_pct}%</p>
                      <p className="text-[10px] text-slate-500">Negative Ratio</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-amber-600">+{iss.trend_percentage}%</p>
                      <p className="text-[10px] text-slate-500">30d Growth</p>
                    </div>
                  </div>

                  {/* Affected Locations */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Affected Branches / Outlets
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {iss.affected_locations.map((loc: string, lIdx: number) => (
                        <span
                          key={lIdx}
                          className="px-2 py-0.5 rounded text-[11px] bg-white border border-slate-200 text-slate-700 flex items-center gap-1"
                        >
                          <MapPin className="w-2.5 h-2.5 text-slate-400" />
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Verbatim Quotes Evidence */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Customer Verbatim Quotes (Evidence)
                    </span>
                    <div className="space-y-1.5">
                      {iss.evidence_quotes.slice(0, 2).map((q: string, qIdx: number) => (
                        <div
                          key={qIdx}
                          className="p-2 rounded bg-slate-50 text-[11px] text-slate-700 italic border-l-2 border-l-rose-500"
                        >
                          "{q}"
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Common Root Cause Summary */}
                  <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200 text-indigo-950">
                    <p className="font-semibold text-[11px] mb-0.5">Underlying Failure Point:</p>
                    <p className="text-[11px] text-slate-700">{iss.root_cause_summary}</p>
                  </div>

                  {/* Recommended Action CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-800 font-medium">
                      Action: {iss.recommended_action}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigateTab('recommendations')}
                      className="text-xs shrink-0"
                    >
                      View Plan
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Root-Cause Intelligence (Section 17 - Observed Evidence vs LLM Hypothesis) */}
      {activeTab === 'root_causes' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Trust & Explainability Standard:</p>
              <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                InsightLoop strictly delineates <strong>Verifiable Customer Evidence</strong> (direct complaint counts, branch metrics, and unedited quotes) from <strong>LLM Operational Hypotheses</strong> (probabilistic operational inferences). Hypotheses are clearly tagged to avoid confusing speculation with established fact.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {rootCauses.map((rc) => (
              <Card
                key={rc.id}
                title={rc.problem}
                subtitle={`Operational Category: ${rc.operational_pillar}`}
                action={<PriorityBadge priority={rc.severity} />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Column 1: Observed Verifiable Evidence */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Observed Empirical Evidence</span>
                    </div>

                    <div className="space-y-1.5 text-slate-700">
                      <p>
                        • <strong>{rc.observed_evidence.verifiable_complaint_count} customer reviews</strong> reported this failure point directly.
                      </p>
                      <p>
                        • <strong>{rc.observed_evidence.negative_concentration_pct}% negative concentration</strong> across mentions.
                      </p>
                      <p>
                        • Geographic concentration: <strong>{rc.observed_evidence.affected_geographies.join(', ')}</strong>.
                      </p>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Verbatim Citations:</span>
                      {rc.observed_evidence.customer_quotes.map((q: string, idx: number) => (
                        <div key={idx} className="p-2 rounded bg-white border border-slate-200 italic text-[11px] text-slate-700">
                          "{q}"
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: LLM Hypotheses */}
                  <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-950 font-bold">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>LLM Operational Hypotheses</span>
                    </div>

                    <div className="space-y-2">
                      {rc.llm_hypotheses.map((hyp: any, hIdx: number) => (
                        <div key={hIdx} className="p-3 rounded-lg bg-white border border-indigo-100 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-indigo-600 font-semibold">
                            <span>{hyp.label}</span>
                            <span>{Math.round(hyp.confidence * 100)}% Confidence</span>
                          </div>
                          <p className="text-slate-800 text-xs leading-relaxed">{hyp.hypothesis}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
                      <span className="font-semibold">Recommended Tactical Action: </span>
                      {rc.recommended_action}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
