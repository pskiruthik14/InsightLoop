import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SentimentBadge, PriorityBadge } from '../common/Badge';
import { SpeechToTextButton } from '../common/SpeechToTextButton';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Star } from 'lucide-react';

interface ManualFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualFeedbackModal: React.FC<ManualFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [source, setSource] = useState('In-Store Feedback');
  const [rating, setRating] = useState<number>(4);
  const [productName, setProductName] = useState('Artisanal Sourdough Bread');
  const [location, setLocation] = useState('Coimbatore');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setAnalysisResult(null);

    try {
      const res = await api.createFeedback({
        customer_name: customerName.trim() || 'Walk-in Customer',
        source,
        rating,
        product_name: productName,
        location,
        message: message.trim(),
      });

      setAnalysisResult(res.analysis);
      showToast({
        type: 'success',
        title: 'Feedback analyzed & saved',
        message: `Classified as ${res.analysis.sentiment} with ${Math.round(res.analysis.confidence * 100)}% confidence.`,
      });
      onSuccess();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Submission failed',
        message: err.message || 'Could not process feedback.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMessage('');
    setAnalysisResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetForm}
      title="Add Customer Feedback"
      subtitle="Enter raw customer review from in-store POS, WhatsApp, or phone log for immediate AI classification."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Source Channel</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="In-Store Feedback">In-Store Feedback</option>
              <option value="WhatsApp">WhatsApp Message</option>
              <option value="Google Reviews">Google Review</option>
              <option value="Swiggy / Zomato">Food Delivery App</option>
              <option value="Website Forms">Website Form</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 text-amber-400 hover:text-amber-500 cursor-pointer"
                >
                  <Star className={`w-4 h-4 ${s <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Product / Item</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Cold Brew Coffee"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Location / Branch</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="Coimbatore">Coimbatore</option>
              <option value="Chennai">Chennai</option>
              <option value="Erode">Erode</option>
              <option value="Salem">Salem</option>
              <option value="Bangalore">Bangalore</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <label className="block text-xs font-medium text-slate-700">
              Customer Message / Review Text <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 hidden sm:inline">Dictate in English, Tamil, Hindi</span>
              <SpeechToTextButton
                variant="button"
                showLanguageSelector={true}
                onTranscript={(transcript) => {
                  setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
                }}
              />
            </div>
          </div>
          <textarea
            rows={3}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Sourdough bread super ah irundhuchu but delivery romba late... (or tap Voice Dictation to speak)"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
          />
        </div>

        {/* Live Analysis Output Box */}
        {analysisResult && (
          <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200/80 space-y-2 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Live AI Analysis
              </span>
              <div className="flex items-center gap-2">
                <SentimentBadge sentiment={analysisResult.sentiment} />
                <PriorityBadge priority={analysisResult.priority} />
              </div>
            </div>
            <p className="text-slate-700 text-xs">{analysisResult.summary}</p>
            {analysisResult.translated_text && (
              <p className="text-[11px] text-slate-500 italic bg-white/80 p-2 rounded border border-slate-200">
                <span className="font-medium text-slate-700">Normalized Interpretation:</span> "{analysisResult.translated_text}"
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysisResult.aspects?.map((asp: any, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded bg-white text-[11px] border border-slate-200 text-slate-700">
                  {asp.aspect}: <strong className={asp.sentiment === 'Negative' ? 'text-rose-600' : 'text-emerald-600'}>{asp.sentiment}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            {analysisResult ? 'Done' : 'Cancel'}
          </Button>
          {!analysisResult ? (
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Process & Analyze
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMessage('');
                setAnalysisResult(null);
              }}
            >
              Add Another Review
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};
