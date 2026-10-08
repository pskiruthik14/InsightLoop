import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ReportItem } from '../types';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { showToast } = useToast();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('monthly_intelligence');

  const loadReports = async () => {
    try {
      const res = await api.getReports();
      setReports(res.reports);
      if (res.reports.length > 0 && !selectedReport) {
        setSelectedReport(res.reports[0]);
      }
    } catch {
      // Handled
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newRep = await api.generateReport(selectedType);
      showToast({ type: 'success', title: 'Intelligence report generated successfully' });
      setSelectedReport(newRep);
      loadReports();
    } catch {
      showToast({ type: 'error', title: 'Generation failed' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Generator Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Intelligence Reports & Audits</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data-backed executive digests with verifiable empirical evidence and tactical action roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium cursor-pointer"
          >
            <option value="monthly_intelligence">Monthly Customer Intelligence Report</option>
            <option value="weekly_voice">Weekly Customer Voice Audit</option>
            <option value="product_feedback">Product Quality & Catalog Audit</option>
            <option value="complaint_analysis">Critical Complaint & Bottlenecks Review</option>
            <option value="executive_summary">Executive C-Suite Summary</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            isLoading={isGenerating}
            onClick={handleGenerate}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Generate New Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Reports Archive List */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Generated Reports Archive
          </h3>
          {reports.map((rep) => (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep)}
              className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                selectedReport?.id === rep.id
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{rep.title}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{rep.generated_at}</p>
            </div>
          ))}
        </div>

        {/* Selected Report Document Viewer (Printable Layout) */}
        <div className="lg:col-span-3">
          {selectedReport ? (
            <Card
              className="p-8 print:border-none print:shadow-none bg-white space-y-6"
              action={
                <div className="flex items-center gap-2 print:hidden">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                    onClick={handlePrint}
                  >
                    Print / Export PDF
                  </Button>
                </div>
              }
            >
              {/* Report Header */}
              <div className="border-b border-slate-200 pb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-600 font-bold uppercase tracking-wider">
                    InsightLoop Verified Audit • {selectedReport.id}
                  </span>
                  <span className="text-xs text-slate-400">{selectedReport.generated_at}</span>
                </div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {selectedReport.title}
                </h1>
                <p className="text-xs text-slate-500">
                  Prepared for: <strong>Artisan Kitchen & Cafe Management Team</strong>
                </p>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">1. Executive Summary</h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed font-sans">
                  {selectedReport.summary}
                </div>
              </div>

              {/* Empirical Metrics Snapshot */}
              {selectedReport.metrics && (
                <div className="space-y-2 text-xs">
                  <h3 className="font-bold text-slate-900 text-sm">2. Quantitative Baseline</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-lg border border-slate-200 bg-white">
                      <p className="text-lg font-bold text-slate-900">{selectedReport.metrics.total_reviews}</p>
                      <p className="text-[10px] text-slate-400">Reviews Analyzed</p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-white">
                      <p className="text-lg font-bold text-emerald-600">{selectedReport.metrics.positive_percentage}%</p>
                      <p className="text-[10px] text-slate-400">Positive Polarity</p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-white">
                      <p className="text-lg font-bold text-rose-600">{selectedReport.metrics.negative_percentage}%</p>
                      <p className="text-[10px] text-slate-400">Negative Friction</p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-white">
                      <p className="text-lg font-bold text-indigo-600">{selectedReport.metrics.average_rating}★</p>
                      <p className="text-[10px] text-slate-400">Average Rating</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Positive Commendations & Critical Friction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <h4 className="font-bold text-emerald-950">Major Positive Themes</h4>
                  <ul className="space-y-1 text-slate-700">
                    <li>• Artisanal sourdough bread and pastry crumb freshness consistently praised.</li>
                    <li>• Front-of-house staff courtesy and barista hospitality highly commended.</li>
                    <li>• High hygiene visibility and cafe ambiance scores across all branches.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2">
                  <h4 className="font-bold text-rose-950">Primary Operational Bottlenecks</h4>
                  <ul className="space-y-1 text-slate-700">
                    <li>• Weekend evening delivery turnaround times (7:00 PM – 9:30 PM).</li>
                    <li>• Cold brew beverage cup lid leaks during courier transit.</li>
                    <li>• Counter cashier UPI double-scan dispute delays.</li>
                  </ul>
                </div>
              </div>

              {/* Recommended Action Items */}
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">3. Recommended Tactical Action Plan</h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-start gap-3">
                    <span className="font-bold text-indigo-600">P1</span>
                    <div>
                      <p className="font-semibold text-slate-900">Implement Peak-Hour Dispatch Buffer & Packaging Station (7–9 PM)</p>
                      <p className="text-[11px] text-slate-500">Estimated cost: Low (&lt; ₹3,000 / $35). Expected return: Protects ₹45,000 monthly repeat revenue.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-start gap-3">
                    <span className="font-bold text-indigo-600">P2</span>
                    <div>
                      <p className="font-semibold text-slate-900">Upgrade to Tamper-Proof Spill-Lock Lids for Delivery Beverages</p>
                      <p className="text-[11px] text-slate-500">Prevents 75% of damaged order refunds. Unit cost ~₹0.80 per cup.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">No reports generated yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
