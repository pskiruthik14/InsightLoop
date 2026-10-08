import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PriorityBadge } from '../components/common/Badge';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { AlertItem } from '../types';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [thresholds, setThresholds] = useState<any>({
    alert_sentiment_threshold: 25.0,
    alert_volume_growth_threshold: 20.0,
    alert_rating_threshold: 3.2,
    notification_email: 'owner@artisanroastery.com',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingThresholds, setIsSavingThresholds] = useState(false);

  const loadAlerts = async () => {
    try {
      const res = await api.getAlerts();
      setAlerts(res.alerts);
      if (res.thresholds) setThresholds(res.thresholds);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateAlertStatus(id, status);
      showToast({ type: 'success', title: `Alert marked as ${status}` });
      loadAlerts();
    } catch {
      showToast({ type: 'error', title: 'Update failed' });
    }
  };

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingThresholds(true);
    try {
      await api.configureThresholds({
        alert_sentiment_threshold: Number(thresholds.alert_sentiment_threshold),
        alert_volume_growth_threshold: Number(thresholds.alert_volume_growth_threshold),
        alert_rating_threshold: Number(thresholds.alert_rating_threshold),
        notification_email: thresholds.notification_email,
      });
      showToast({ type: 'success', title: 'Alert thresholds saved successfully' });
    } catch {
      showToast({ type: 'error', title: 'Could not save thresholds' });
    } finally {
      setIsSavingThresholds(false);
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const pastAlerts = alerts.filter((a) => a.status !== 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Alerts & Operational Thresholds</h2>
            {activeAlerts.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {activeAlerts.length} Active Triggers
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time threshold breaches flagged when complaints spike or ratings drop.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active & Resolved Alerts Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BellRing className="w-4 h-4 text-indigo-600" />
            <span>Active Alerts Stream</span>
          </h3>

          {activeAlerts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All operational indicators are currently within safety thresholds.
            </div>
          ) : (
            activeAlerts.map((alt) => (
              <Card
                key={alt.id}
                className="border-rose-200 bg-rose-50/20"
                title={
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{alt.title}</span>
                  </div>
                }
                action={<PriorityBadge priority={alt.severity} />}
                subtitle={`Triggered: ${alt.triggered_at}`}
              >
                <div className="space-y-3 text-xs">
                  <p className="text-slate-700 leading-relaxed font-sans">{alt.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-rose-100">
                    <span className="text-[11px] text-slate-500">
                      Metric value: <strong className="text-rose-600">+{alt.metric_value}%</strong> (Threshold: {alt.threshold_value}%)
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(alt.id, 'acknowledged')}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(alt.id, 'resolved')}
                      >
                        Resolve Alert
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}

          {/* Past Resolved Alerts */}
          {pastAlerts.length > 0 && (
            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Acknowledged & Resolved History
              </h4>
              {pastAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{alt.title}</p>
                    <p className="text-[11px] text-slate-500">{alt.description}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 capitalize">
                    {alt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Threshold Configuration Card (Section 22) */}
        <div>
          <Card
            title="Configure Alert Thresholds"
            subtitle="Customize trigger points for proactive operational notifications"
          >
            <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Negative Sentiment Spike Threshold (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="1"
                    value={thresholds.alert_sentiment_threshold}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, alert_sentiment_threshold: e.target.value })
                    }
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-bold text-slate-900 w-10 text-right">
                    {thresholds.alert_sentiment_threshold}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Alerts if negative feedback exceeds this percentage over a 7-day period.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Issue Volume Growth Threshold (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="1"
                    value={thresholds.alert_volume_growth_threshold}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, alert_volume_growth_threshold: e.target.value })
                    }
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-bold text-slate-900 w-10 text-right">
                    {thresholds.alert_volume_growth_threshold}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Alerts if recurring complaints surge rapidly vs preceding baseline.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Minimum Star Rating Trigger
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2.0"
                    max="4.5"
                    step="0.1"
                    value={thresholds.alert_rating_threshold}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, alert_rating_threshold: e.target.value })
                    }
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-bold text-slate-900 w-10 text-right">
                    {thresholds.alert_rating_threshold}★
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Alerts when 7-day average star rating drops below this threshold.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Emergency Alert Email
                </label>
                <input
                  type="email"
                  value={thresholds.notification_email}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, notification_email: e.target.value })
                  }
                  placeholder="owner@artisancafe.com"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingThresholds}
                className="w-full"
              >
                Save Threshold Parameters
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
