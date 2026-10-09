import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PriorityBadge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { api } from '../services/api';
import { KPIs, OperationalPillar, UrgentIssue } from '../types';
import {
  Smile,
  Frown,
  Meh,
  MessageSquare,
  AlertTriangle,
  Info,
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
  onOpenAskDrawer: _onOpenAskDrawer,
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
      let currentOverview = overview;
      if (overview.kpis.total_feedback === 0) {
        try {
          await api.seedDemoData();
          currentOverview = await api.getOverview({
            days,
            location: selectedLocation !== 'all' ? selectedLocation : undefined,
          });
        } catch {
          // ignore
        }
      }

      setKpis(currentOverview.kpis);
      setPillars(currentOverview.operational_pillars);
      setUrgentIssues(currentOverview.urgent_issues);

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
    <div className="space-y-7">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/90 p-4.5 rounded-3xl border border-[#E6E2DA] shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-semibold text-[#2D3A31]">Executive Health Overview</h2>
          <p className="text-xs font-sans text-[#8C9A84]">Real-time customer sentiment health and operational risk triage</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Location Filter */}
          <div className="flex items-center gap-2 text-xs font-sans text-[#2D3A31] bg-[#F9F8F4] border border-[#E6E2DA] rounded-full px-3.5 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#8C9A84]" strokeWidth={1.5} />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-medium text-[#2D3A31]"
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
          <div className="flex items-center gap-1 bg-[#F2EDE6] p-1 rounded-full border border-[#E6E2DA]">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3.5 py-1 text-xs font-sans font-medium rounded-full transition-all duration-300 cursor-pointer ${
                  days === d
                    ? 'bg-[#2D3A31] text-[#F9F8F4] font-semibold shadow-xs'
                    : 'text-[#5C6B5F] hover:text-[#2D3A31]'
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {/* Sentiment Health Score (Section 9) */}
          <Card className="col-span-2 bg-gradient-to-br from-[#EDF1EB] to-white border-[#8C9A84]/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans uppercase tracking-wider text-[#8C9A84] font-medium">Customer Sentiment</span>
              <button
                onClick={() => setShowFormulaModal(!showFormulaModal)}
                title="View Scoring Formula"
                className="text-[#4D6347] hover:text-[#2D3A31] cursor-pointer"
                aria-label="View scoring explanation"
              >
                <Info className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-serif font-bold text-[#2D3A31] tracking-tight">
                {kpis.sentiment_score}
              </span>
              <span className="text-xs text-[#8C9A84] font-sans">/ 100</span>
              <span
                className={`text-xs font-sans font-medium px-2 py-0.5 rounded-full ml-auto ${
                  kpis.score_change >= 0
                    ? 'bg-[#EDF1EB] text-[#4D6347] border border-[#8C9A84]/40'
                    : 'bg-[#FBF0ED] text-[#AA6552] border border-[#C27B66]/30'
                }`}
              >
                {kpis.score_change >= 0 ? '+' : ''}
                {kpis.score_change}% vs prev
              </span>
            </div>
            <p className="text-xs font-sans text-[#5A695E] mt-2 line-clamp-2 leading-relaxed">
              {kpis.score_explanation}
            </p>
          </Card>

          {/* Positive % */}
          <Card>
            <div className="flex items-center justify-between text-[#8C9A84] text-xs">
              <span className="font-medium">Positive</span>
              <div className="w-7 h-7 rounded-full bg-[#EDF1EB] flex items-center justify-center text-[#4D6347]">
                <Smile className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#2D3A31] mt-2">{kpis.positive_percentage}%</p>
            <p className="text-[11px] font-sans text-[#4D6347] mt-1 font-medium">High delight</p>
          </Card>

          {/* Negative % */}
          <Card>
            <div className="flex items-center justify-between text-[#8C9A84] text-xs">
              <span className="font-medium">Negative</span>
              <div className="w-7 h-7 rounded-full bg-[#FBF0ED] flex items-center justify-center text-[#C27B66]">
                <Frown className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#2D3A31] mt-2">{kpis.negative_percentage}%</p>
            <p className="text-[11px] font-sans text-[#AA6552] mt-1 font-medium">Actionable friction</p>
          </Card>

          {/* Neutral % */}
          <Card>
            <div className="flex items-center justify-between text-[#8C9A84] text-xs">
              <span className="font-medium">Neutral</span>
              <div className="w-7 h-7 rounded-full bg-[#F2EDE6] flex items-center justify-center text-[#8C7E72]">
                <Meh className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#2D3A31] mt-2">{kpis.neutral_percentage}%</p>
            <p className="text-[11px] font-sans text-[#8C7E72] mt-1 font-medium">Mixed feedback</p>
          </Card>

          {/* Total Feedback */}
          <Card>
            <div className="flex items-center justify-between text-[#8C9A84] text-xs">
              <span className="font-medium">Total Reviews</span>
              <div className="w-7 h-7 rounded-full bg-[#EDF1EB] flex items-center justify-center text-[#4D6347]">
                <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#2D3A31] mt-2">{kpis.total_feedback}</p>
            <p className="text-[11px] font-sans text-[#8C9A84] mt-1 font-medium">Verified entries</p>
          </Card>

          {/* Critical Issues & Response Rate */}
          <Card>
            <div className="flex items-center justify-between text-[#8C9A84] text-xs">
              <span className="font-medium">Critical Flags</span>
              <div className="w-7 h-7 rounded-full bg-[#FBF0ED] flex items-center justify-center text-[#C27B66]">
                <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#C27B66] mt-2">{kpis.critical_issues}</p>
            <p className="text-[11px] font-sans text-[#8C9A84] mt-1 font-medium">{kpis.response_rate}% handled</p>
          </Card>
        </div>
      )}

      {/* Transparent Formula Explanation Banner (Section 9) */}
      {showFormulaModal && (
        <div className="p-5 rounded-3xl bg-white border border-[#E6E2DA] text-xs text-[#2D3A31] space-y-2 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-semibold text-[#2D3A31] text-sm">Transparent Sentiment Scoring Formula</h4>
            <button
              onClick={() => setShowFormulaModal(false)}
              className="text-[#8C9A84] hover:text-[#2D3A31] text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="font-mono text-xs bg-[#F9F8F4] p-3 rounded-2xl border border-[#E6E2DA] text-[#4D6347]">
            Sentiment Score = (Positive Feedback % × 1.0) + (Neutral Feedback % × 0.35) [Normalized to 0–100 Scale]
          </p>
          <p className="text-[#5A695E] text-xs leading-relaxed">
            Unlike opaque proprietary AI ratings, InsightLoop weights every feedback entry transparently against verified operational pillars so your business always understands why the score changed.
          </p>
        </div>
      )}

      {/* Charts Row: Interactive Sentiment Trend & Operational Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Sentiment Time-Series Chart */}
        <Card
          className="lg:col-span-2"
          title="Customer Sentiment Trend"
          subtitle="Daily volume breakdown across Positive, Neutral, and Negative sentiments"
          action={
            <div className="flex items-center gap-3.5 text-xs font-sans">
              <span className="flex items-center gap-1.5 text-[#2D3A31]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C9A84]" />
                Positive
              </span>
              <span className="flex items-center gap-1.5 text-[#2D3A31]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DCCFC2]" />
                Neutral
              </span>
              <span className="flex items-center gap-1.5 text-[#2D3A31]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C27B66]" />
                Negative
              </span>
            </div>
          }
        >
          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8C9A84" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8C9A84" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C27B66" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C27B66" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E2DA" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8C9A84' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8C9A84' }} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1F2922] text-[#F9F8F4] p-3.5 rounded-2xl text-xs shadow-xl space-y-1 border border-[#2D3A31]">
                          <p className="font-serif font-semibold text-[#F9F8F4]">{label}</p>
                          <p className="text-[#A3B09C]">Total reviews: {data.total}</p>
                          <p className="text-[#8C9A84] font-medium">Positive: {data.positive} ({data.positive_pct}%)</p>
                          <p className="text-[#DCCFC2] font-medium">Neutral: {data.neutral} ({data.neutral_pct}%)</p>
                          <p className="text-[#C27B66] font-medium">Negative: {data.negative} ({data.negative_pct}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="positive" stroke="#8C9A84" strokeWidth={2} fillOpacity={1} fill="url(#posGrad)" />
                <Area type="monotone" dataKey="negative" stroke="#C27B66" strokeWidth={2} fillOpacity={1} fill="url(#negGrad)" />
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
              className="text-xs text-[#2D3A31] font-semibold underline hover:text-[#4D6347] cursor-pointer"
            >
              Deep Dive
            </button>
          }
        >
          <div className="space-y-4">
            {pillars.map((pil, idx) => (
              <div key={idx} className="space-y-1.5 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#2D3A31]">{pil.name}</span>
                  <span className="font-bold text-[#2D3A31]">{pil.satisfaction_pct}%</span>
                </div>
                <div className="w-full h-2 bg-[#F2EDE6] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      pil.satisfaction_pct >= 75
                        ? 'bg-[#8C9A84]'
                        : pil.satisfaction_pct >= 55
                        ? 'bg-[#DCCFC2]'
                        : 'bg-[#C27B66]'
                    }`}
                    style={{ width: `${pil.satisfaction_pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#8C9A84]">
                  <span>{pil.positive_count} satisfied</span>
                  <span className="text-[#C27B66]">{pil.negative_count} complaints</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Urgent Critical Issues Section */}
      <Card
        title="Immediate Operational Friction Points"
        subtitle="Identified bottlenecks impacting customer satisfaction and recurring revenue"
        action={
          <Button
            size="sm"
            variant="outline"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />}
            onClick={() => onNavigateTab('recommendations')}
          >
            Tactical Action Plan
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
          {urgentIssues.map((iss, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] flex flex-col justify-between space-y-3.5 shadow-xs hover:-translate-y-0.5 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-sans font-medium text-[#8C9A84] uppercase tracking-wider">
                    {iss.topic}
                  </span>
                  <PriorityBadge priority={iss.severity} />
                </div>
                <h4 className="font-serif font-bold text-[#2D3A31] text-sm leading-snug">{iss.name}</h4>
                <p className="text-xs font-sans text-[#5A695E] mt-1.5 leading-relaxed">
                  Affecting <strong>{iss.feedback_count} customers</strong> with{' '}
                  <strong className="text-[#AA6552]">{iss.negative_pct}% negative concentration</strong>.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {iss.affected_locations?.map((loc: string, lIdx: number) => (
                    <span
                      key={lIdx}
                      className="px-2.5 py-0.5 rounded-full text-[10px] bg-white border border-[#E6E2DA] text-[#5C6B5F]"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6E2DA]">
                <p className="text-xs font-sans text-[#4D6347] font-medium leading-relaxed">
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
