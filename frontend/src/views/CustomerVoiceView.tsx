import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { SentimentBadge } from '../components/common/Badge';
import { api } from '../services/api';
import {
  Heart,
  Frown,
  AlertCircle,
  Quote,
  Star,
  MapPin,
  Package,
  TrendingUp,
} from 'lucide-react';

export const CustomerVoiceView: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getCustomerVoice();
        setData(res);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !data) {
    return <div className="p-12 text-center text-slate-400 text-xs">Loading Customer Voice analysis...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900">Voice of the Customer</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          What your customers care about most, direct praise themes, core friction drivers, and emerging signals.
        </p>
      </div>

      {/* Top 3 Pillars: Love, Dislike, Emerging (Section 18) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customers Love */}
        <Card
          className="border-emerald-200/80 bg-emerald-50/20"
          title={
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Customers Love</span>
            </div>
          }
          subtitle="Top positive attributes driving loyalty"
        >
          <div className="space-y-3 text-xs">
            {data.customers_love?.themes?.map((th: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-white border border-emerald-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{th.theme}</span>
                  <span className="text-[11px] font-bold text-emerald-600">{th.sentiment_pct}% Pos</span>
                </div>
                <p className="text-[11px] text-slate-500">{th.mention_count} customer commendations</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Customers Dislike */}
        <Card
          className="border-rose-200/80 bg-rose-50/20"
          title={
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <Frown className="w-4 h-4 text-rose-600" />
              <span>Customers Dislike</span>
            </div>
          }
          subtitle="Critical points causing friction and churn"
        >
          <div className="space-y-3 text-xs">
            {data.customers_dislike?.themes?.map((th: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-white border border-rose-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{th.theme}</span>
                  <span className="text-[11px] font-bold text-rose-600">{th.negative_pct}% Neg</span>
                </div>
                <p className="text-[11px] text-slate-500">{th.mention_count} customer complaints</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Emerging Concerns */}
        <Card
          className="border-amber-200/80 bg-amber-50/20"
          title={
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Emerging Concerns</span>
            </div>
          }
          subtitle="Early warning signals requiring proactive attention"
        >
          <div className="space-y-3 text-xs">
            {data.emerging_concerns?.map((ec: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-white border border-amber-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{ec.concern}</span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {ec.impact} Impact
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Trend velocity: {ec.trend}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Verbatim Quote Wall (Praise vs Complaints) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Quotes */}
        <Card
          title="Direct Praise Verbatim"
          subtitle="Unedited customer testimonials from Google Reviews, WhatsApp, and Store Logs"
        >
          <div className="space-y-3">
            {data.customers_love?.quotes?.map((q: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 border-l-3 border-l-emerald-500"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{q.customer_name}</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{q.rating}/5.0</span>
                  </div>
                </div>
                <p className="text-slate-800 italic leading-relaxed">"{q.message}"</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                  <span>{q.product_name}</span>
                  <span>•</span>
                  <span>{q.location}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Friction Quotes */}
        <Card
          title="Direct Complaint Verbatim"
          subtitle="Real customer feedback highlighting where operational execution slipped"
        >
          <div className="space-y-3">
            {data.customers_dislike?.quotes?.map((q: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 border-l-3 border-l-rose-500"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{q.customer_name}</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{q.rating}/5.0</span>
                  </div>
                </div>
                <p className="text-slate-800 italic leading-relaxed">"{q.message}"</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                  <span>{q.product_name}</span>
                  <span>•</span>
                  <span>{q.location}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
