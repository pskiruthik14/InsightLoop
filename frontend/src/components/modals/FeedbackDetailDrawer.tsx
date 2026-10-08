import React, { useState } from 'react';
import { Drawer } from '../common/Drawer';
import { Button } from '../common/Button';
import { SentimentBadge, PriorityBadge, EmotionBadge } from '../common/Badge';
import { FeedbackItem } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Star,
  Globe,
  Tag,
  CheckCircle2,
  Copy,
  Sparkles,
  MessageSquare,
  Clock,
  MapPin,
  Package,
} from 'lucide-react';

interface FeedbackDetailDrawerProps {
  item: FeedbackItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const FeedbackDetailDrawer: React.FC<FeedbackDetailDrawerProps> = ({
  item,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { showToast } = useToast();

  const [notes, setNotes] = useState(item?.notes || '');
  const [priority, setPriority] = useState(item?.priority || 'medium');
  const [assignedTo, setAssignedTo] = useState(item?.assigned_to || '');
  const [isReviewed, setIsReviewed] = useState(Boolean(item?.reviewed));
  const [isSaving, setIsSaving] = useState(false);

  // AI Reply Generator State
  const [replyTone, setReplyTone] = useState('empathetic');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  // Sync state when item changes
  React.useEffect(() => {
    if (item) {
      setNotes(item.notes || '');
      setPriority(item.priority || 'medium');
      setAssignedTo(item.assigned_to || '');
      setIsReviewed(Boolean(item.reviewed));
      setGeneratedReply('');
    }
  }, [item]);

  if (!item) return null;

  const handleSaveStatus = async () => {
    setIsSaving(true);
    try {
      await api.updateFeedbackStatus(item.id, {
        reviewed: isReviewed,
        priority,
        assigned_to: assignedTo.trim() || null,
        notes: notes.trim(),
      });
      showToast({ type: 'success', title: 'Feedback status saved' });
      onUpdated();
    } catch {
      showToast({ type: 'error', title: 'Update failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReply = async () => {
    setIsGeneratingReply(true);
    try {
      const res = await api.generateReply(item.id, replyTone);
      setGeneratedReply(res.draft_response);
    } catch {
      showToast({ type: 'error', title: 'Could not generate reply' });
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReply);
    showToast({ type: 'success', title: 'Copied reply to clipboard' });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Details (${item.id})`}
      subtitle={`Received via ${item.source} • ${item.created_at}`}
      width="lg"
    >
      <div className="space-y-5 text-xs text-slate-700">
        {/* Customer Header Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-slate-900">{item.customer_name}</p>
              <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {item.location}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3 text-slate-400" />
                  {item.product_name}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-0.5 justify-end">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= (item.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.rating ? `${item.rating}/5.0 stars` : 'Unrated'}</p>
            </div>
          </div>
        </div>

        {/* Original Customer Message */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-900 flex items-center justify-between">
            <span>Original Customer Message</span>
            {item.detected_language !== 'en' && (
              <span className="text-[10px] font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Detected Language: {item.detected_language.toUpperCase()}
              </span>
            )}
          </label>
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs leading-relaxed font-sans shadow-2xs">
            "{item.message}"
          </div>

          {/* Multilingual Translated Interpretation (Section 12) */}
          {item.translated_text && item.translated_text !== item.message && (
            <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 text-indigo-950 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                Normalized English Translation
              </div>
              <p className="italic text-xs font-sans text-indigo-900">"{item.translated_text}"</p>
            </div>
          )}
        </div>

        {/* AI Sentiment & Classification Breakdown */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <h4 className="font-semibold text-slate-900 flex items-center justify-between text-xs">
            <span>Sentiment & Emotion Triage</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Confidence: <strong>{Math.round(item.confidence * 100)}%</strong>
            </span>
          </h4>

          <div className="flex flex-wrap items-center gap-2">
            <SentimentBadge sentiment={item.sentiment} />
            <PriorityBadge priority={item.priority} />
            {item.emotions?.map((em, idx) => (
              <EmotionBadge key={idx} emotion={em} />
            ))}
          </div>

          <div className="p-2.5 rounded bg-white border border-slate-200 text-[11px] text-slate-600">
            <span className="font-medium text-slate-800">Model Explanation: </span>
            {item.explanation || item.summary}
          </div>
        </div>

        {/* Aspect-Level Sentiment Decomposition (Section 11) */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 text-xs">Aspect-Level Polarity Breakdown</h4>
          <div className="grid grid-cols-1 gap-2">
            {item.aspects && item.aspects.length > 0 ? (
              item.aspects.map((asp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200"
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-xs">{asp.aspect}</p>
                    {asp.keywords && asp.keywords.length > 0 && (
                      <p className="text-[10px] text-slate-400">
                        Trigger terms: {asp.keywords.join(', ')}
                      </p>
                    )}
                  </div>
                  <SentimentBadge sentiment={asp.sentiment} />
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-xs italic">No specific sub-aspect terms identified.</p>
            )}
          </div>
        </div>

        {/* AI Empathetic Response Generator (Section 10 & 46) */}
        <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-indigo-950 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Smart Review Responder
            </h4>
            <div className="flex items-center gap-1">
              {['empathetic', 'professional', 'enthusiastic', 'promotional'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setReplyTone(t)}
                  className={`text-[10px] px-2 py-0.5 rounded capitalize font-medium cursor-pointer transition-colors ${
                    replyTone === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateReply}
            isLoading={isGeneratingReply}
            className="w-full text-xs"
          >
            Draft {replyTone} Response
          </Button>

          {generatedReply && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-200">
              <div className="p-3 rounded-lg bg-white border border-indigo-200 text-xs text-slate-800 leading-relaxed font-sans">
                {generatedReply}
              </div>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Copy className="w-3 h-3" />}
                onClick={copyToClipboard}
              >
                Copy to Clipboard
              </Button>
            </div>
          )}
        </div>

        {/* Operational Workflow Actions (Section 10) */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <h4 className="font-semibold text-slate-900 text-xs">Internal Workflow Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Urgency</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Assigned Agent / Lead</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Store Manager"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Called customer at 11 AM to apologize and replaced order."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isReviewed}
                onChange={(e) => setIsReviewed(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Mark as Reviewed & Handled
            </label>

            <Button size="sm" variant="primary" isLoading={isSaving} onClick={handleSaveStatus}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
