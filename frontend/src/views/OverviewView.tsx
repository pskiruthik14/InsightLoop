import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SentimentBadge, PriorityBadge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { api } from '../services/api';
import { KPIs, OperationalPillar, UrgentIssue } from '../types';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  MessageSquare,
  ShieldCheck,
  Info,
  Calendar,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface OverviewViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenAskDrawer: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateTab,
  onOpenAskDrawer,
}) => {
  const [days, setDays] = useState(30);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [pillars, setPillars] = useState<OperationalPillar[]>([]);
  const [urgentIssues, setUrgentIssues] = useState<UrgentIssue[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const overview = await api.getOverview({
        days,
        location: selectedLocation !== 'all' ? selectedLocation : undefined,
      });
      setKpis(overview.kpis);
      setPillars(overview.operational_pillars);
      setUrgentIssues(overview.urgent_issues);

      const trend = await api.getSentimentTrend(days <= 7 ? '7d' : days <= 30 ? '30d' : '90d');
      setTrendData(trend.data);
    } catch {
      // Handled gracefully
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days, selectedLocation]);

  if (isLoading && !kpis) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Executive Health Overview</h2>
          <p className="text-xs text-slate-500">Real-time customer sentiment health and operational risk triage</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Location Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-medium"
            >
              <option value="all">All Locations (5 Outlets)</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Chennai">Chennai</option>
              <option value="Erode">Erode</option>
              <option value="Salem">Salem</option>
              <option value="Bangalore">Bangalore</option>
            </select>
          </div>

          {/* Date Window Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  days === d ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d === 7 ? '7 Days' : d === 30 ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top KPI Cards (Section 7) */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {/* Sentiment Health Score (Section 9) */}
          <Card className="col-span-2 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Customer Sentiment</span>
              <button
                onClick={() => setShowFormulaModal(!showFormulaModal)}
                title="View Scoring Formula"
                className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {kpis.sentiment_score}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
              <span
                className={`text-xs font-semibold flex items-center ml-auto ${
                  kpis.score_change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {kpis.score_change >= 0 ? '+' : ''}
                {kpis.score_change}% vs prev
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {kpis.score_explanation}
            </p>
          </Card>

          {/* Positive % */}
          <Card>
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Positive</span>
              <Smile className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.positive_percentage}%</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">High customer delight</p>
          </Card>

          {/* Negative % */}
          <Card>
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Negative</span>
              <Frown className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.negative_percentage}%</p>
            <p className="text-[11px] text-rose-600 font-medium mt-1">Actionable friction</p>
          </Card>

          {/* Neutral % */}
          <Card>
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Neutral</span>
              <Meh className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.neutral_percentage}%</p>
            <p className="text-[11px] text-slate-500 mt-1">Mixed expectations</p>
          </Card>

          {/* Total Feedback */}
          <Card>
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Total Reviews</span>
              <MessageSquare className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.total_feedback}</p>
            <p className="text-[11px] text-slate-500 mt-1">Verified entries</p>
          </Card>

          {/* Critical Issues & Response Rate */}
          <Card>
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Critical Flags</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-rose-600 mt-2">{kpis.critical_issues}</p>
            <p className="text-[11px] text-slate-500 mt-1">{kpis.response_rate}% handled</p>
          </Card>
        </div>
      )}

      {/* Transparent Formula Explanation Banner (Section 9) */}
      {showFormulaModal && (
        <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-indigo-900">Transparent Sentiment Scoring Formula</h4>
            <button
              onClick={() => setShowFormulaModal(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <p className="font-mono text-[11px] bg-white/80 p-2 rounded border border-indigo-200">
            Sentiment Score = (Positive Feedback % × 1.0) + (Neutral Feedback % × 0.35) [Normalized to 0–100 Scale]
          </p>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Unlike opaque proprietary AI ratings, InsightLoop weights every feedback entry transparently against verified operational pillars so your team always knows why the score shifted.
          </p>
        </div>
      )}

      {/* Charts Row: Interactive Sentiment Trend & Operational Pillars (Section 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Sentiment Time-Series Chart */}
        <Card
          className="lg:col-span-2"
          title="Customer Sentiment Trend"
          subtitle="Daily volume breakdown across Positive, Neutral, and Negative sentiments"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Positive
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Neutral
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Negative
              </span>
            </div>
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl space-y-1">
                          <p className="font-semibold text-slate-200">{label}</p>
                          <p className="text-slate-400">Total reviews: {data.total}</p>
                          <p className="text-emerald-400 font-medium">Positive: {data.positive} ({data.positive_pct}%)</p>
                          <p className="text-amber-300 font-medium">Neutral: {data.neutral} ({data.neutral_pct}%)</p>
                          <p className="text-rose-400 font-medium">Negative: {data.negative} ({data.negative_pct}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#posGrad)" />
                <Area type="monotone" dataKey="negative" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#negGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Operational Pillars Satisfaction Bar Breakdown */}
        <Card
          title="Operational Pillars"
          subtitle="Satisfaction score across key MSME areas"
          action={
            <button
              onClick={() => onNavigateTab('sentiment')}
              className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              Deep Dive
            </button>
          }
        >
          <div className="space-y-3.5">
            {pillars.map((pil, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">{pil.name}</span>
                  <span className="font-bold text-slate-900">{pil.satisfaction_pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pil.satisfaction_pct >= 75
                        ? 'bg-emerald-500'
                        : pil.satisfaction_pct >= 55
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${pil.satisfaction_pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{pil.positive_count} satisfied</span>
                  <span className="text-rose-500">{pil.negative_count} complaints</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Urgent Critical Issues Section (Section 7 & 16) */}
      <Card
        title="Immediate Operational Friction Points"
        subtitle="Identified bottlenecks impacting customer satisfaction and recurring revenue"
        action={
          <Button
            size="sm"
            variant="outline"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => onNavigateTab('recommendations')}
          >
            View Tactical Action Plan
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {urgentIssues.map((iss, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {iss.topic}
                  </span>
                  <PriorityBadge priority={iss.severity} />
                </div>
                <h4 className="font-bold text-slate-900 text-xs leading-snug">{iss.name}</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Affecting <strong>{iss.feedback_count} customers</strong> with{' '}
                  <strong className="text-rose-600">{iss.negative_pct}% negative concentration</strong>.
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {iss.affected_locations?.map((loc: string, lIdx: number) => (
                    <span
                      key={lIdx}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-slate-200 text-slate-600"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <p className="text-[11px] text-emerald-800 font-medium">
                  <strong>Recommended: </strong>
                  {iss.recommended_action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
