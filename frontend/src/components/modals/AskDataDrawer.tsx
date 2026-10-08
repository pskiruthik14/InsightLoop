import React, { useState } from 'react';
import { Drawer } from '../common/Drawer';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { Sparkles, Send, Quote, AlertCircle, TrendingDown, CheckCircle2, Loader2 } from 'lucide-react';

interface AskDataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskDataDrawer: React.FC<AskDataDrawerProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const suggestedQuestions = [
    'Why did sentiment decrease this month?',
    'What are customers complaining about the most?',
    'Which product has the worst feedback?',
    'What should I fix first?',
    'Summarize customer feedback about delivery.',
  ];

  const handleSearch = async (questionText: string) => {
    if (!questionText.trim()) return;
    setQuery(questionText);
    setIsLoading(true);
    setResult(null);

    try {
      const data = await api.askData(questionText.trim());
      setResult(data);
    } catch {
      setResult({
        title: 'Query Error',
        answer: 'Could not execute data retrieval against your workspace.',
        evidence: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Ask Your Customer Data"
      subtitle="Evidence-based conversational queries directly backed by SQL aggregations & verbatim quotes."
      width="lg"
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Suggested Queries */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Suggested Business Inquiries
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSearch(q)}
                className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about complaints, products, or locations..."
            className="w-full pl-3 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pt-2">
          {isLoading && (
            <div className="p-8 text-center text-slate-500 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
              <p className="text-xs font-medium">Querying 524 customer reviews & calculating statistical correlations...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Answer Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <h4 className="font-semibold text-xs sm:text-sm">{result.title}</h4>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {result.answer}
                </div>
                {result.recommended_action && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Recommended Action: </span>
                      {result.recommended_action}
                    </div>
                  </div>
                )}
              </div>

              {/* Verified Evidence Quotes */}
              {result.evidence && result.evidence.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-indigo-600" />
                      Observed Supporting Evidence ({result.evidence.length} Quotes)
                    </h5>
                    <span className="text-[10px] text-slate-500">Traceable to database records</span>
                  </div>
                  <div className="space-y-1.5">
                    {result.evidence.map((quote: string, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 italic border-l-3 border-l-indigo-500"
                      >
                        "{quote}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Summary Pill */}
              {result.data_summary && (
                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Verified Sample Size: <strong>{result.data_summary.total_feedback} Reviews</strong></span>
                  <span>Avg Rating: <strong>{result.data_summary.average_rating}/5.0</strong></span>
                  <span>Negative: <strong className="text-rose-600">{result.data_summary.negative_percentage}%</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
