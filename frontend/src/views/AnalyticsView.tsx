import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { api } from '../services/api';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
  MapPin,
  Package,
  Share2,
  Star,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [emotions, setEmotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, pRes, lRes, rRes, tRes, eRes] = await Promise.all([
          api.getSourcesComparison(),
          api.getProductComparison(),
          api.getLocationComparison(),
          api.getRatings(),
          api.getTopics(),
          api.getEmotions(),
        ]);
        setSources(sRes.sources);
        setProducts(pRes.products);
        setLocations(lRes.locations);
        setRatings(rRes.distribution);
        setTopics(tRes.topics);
        setEmotions(eRes.emotions);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieData = [
    { name: 'Positive', value: 312, color: '#10b981' },
    { name: 'Neutral', value: 71, color: '#f59e0b' },
    { name: 'Negative', value: 141, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900">Advanced Analytics & Segmentation</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Deep comparative cross-tabulations across branches, product categories, channels, and customer ratings.
        </p>
      </div>

      {/* Row 1: Sentiment Donut & Star Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution Donut Chart */}
        <Card
          title="Sentiment Polarity Distribution"
          subtitle="Proportion of positive, neutral, and negative customer opinion"
        >
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} reviews`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-xs text-slate-700">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Rating Distribution Histogram */}
        <Card
          title="Rating Distribution (1–5 Stars)"
          subtitle="Customer star rating breakdown across all recorded feedback"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="rating" tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(r) => `${r}★`} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} reviews`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2: Location Comparison & Product Comparison (Section 19 & 28) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Comparison Table & Scores */}
        <Card
          title="Location & Outlet Performance"
          subtitle="Compare sentiment score and friction across branch locations"
        >
          <div className="space-y-3">
            {locations.map((loc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{loc.location}</p>
                    <p className="text-[11px] text-slate-500">{loc.total} total reviews • {loc.avg_rating}★</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-sm text-slate-900">{loc.sentiment_score}</span>
                  <span className="text-[10px] text-slate-400 block">Sentiment Score</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Product Comparison List */}
        <Card
          title="Product Catalog Satisfaction"
          subtitle="Ranked by customer satisfaction score and negative complaints"
        >
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {products.map((prod, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{prod.product}</p>
                  <p className="text-[11px] text-slate-500">{prod.total} reviews • {prod.avg_rating}★ avg</p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-600 font-semibold">{prod.positive_pct}% Pos</span>
                  <span className="text-[10px] text-rose-500 block">{prod.negative_pct}% Neg</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Channel / Source Comparison */}
      <Card
        title="Source Channel Comparison"
        subtitle="Compare customer volume and polarity across Google, WhatsApp, Delivery Apps, and In-Store"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sources} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="source" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
              <Bar dataKey="positive_pct" name="Positive %" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="negative_pct" name="Negative %" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
