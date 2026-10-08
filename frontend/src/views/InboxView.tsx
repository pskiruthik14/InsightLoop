import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SentimentBadge, PriorityBadge, EmotionBadge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { FeedbackDetailDrawer } from '../components/modals/FeedbackDetailDrawer';
import { FeedbackItem } from '../types';
import { api } from '../services/api';
import {
  Search,
  Filter,
  Download,
  Star,
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';

interface InboxViewProps {
  searchQuery?: string;
  onOpenAddModal: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  searchQuery = '',
  onOpenAddModal,
}) => {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterSearch, setFilterSearch] = useState(searchQuery);
  const [filterSource, setFilterSource] = useState('all');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterReviewed, setFilterReviewed] = useState<string>('all');

  // Detail drawer
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync external search query
  useEffect(() => {
    if (searchQuery !== filterSearch) {
      setFilterSearch(searchQuery);
      setCurrentPage(1);
    }
  }, [searchQuery]);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const res = await api.listFeedback({
        page: currentPage,
        limit: 15,
        search: filterSearch.trim() || undefined,
        source: filterSource !== 'all' ? filterSource : undefined,
        sentiment: filterSentiment !== 'all' ? filterSentiment : undefined,
        topic: filterTopic !== 'all' ? filterTopic : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
        rating: filterRating !== 'all' ? Number(filterRating) : undefined,
        reviewed: filterReviewed !== 'all' ? Number(filterReviewed) : undefined,
      });
      setItems(res.items);
      setTotalCount(res.total);
      setTotalPages(res.total_pages);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [
    currentPage,
    filterSearch,
    filterSource,
    filterSentiment,
    filterTopic,
    filterPriority,
    filterRating,
    filterReviewed,
  ]);

  const handleOpenDetail = (item: FeedbackItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleExportCsv = () => {
    const q = new URLSearchParams();
    if (filterSource !== 'all') q.append('source', filterSource);
    if (filterSentiment !== 'all') q.append('sentiment', filterSentiment);
    if (filterTopic !== 'all') q.append('topic', filterTopic);
    window.open(`/api/feedback/export?${q.toString()}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Customer Feedback Inbox</h2>
            <p className="text-xs text-slate-500">
              Showing {totalCount} verified feedback items across all active customer touchpoints
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
            <Button variant="primary" size="sm" onClick={onOpenAddModal}>
              + Add Feedback
            </Button>
          </div>
        </div>

        {/* Multi-Faceted Filters (Section 27) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Sentiment Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Sentiment
            </label>
            <select
              value={filterSentiment}
              onChange={(e) => {
                setFilterSentiment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium cursor-pointer"
            >
              <option value="all">All Polarity</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Operational Topic
            </label>
            <select
              value={filterTopic}
              onChange={(e) => {
                setFilterTopic(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium cursor-pointer"
            >
              <option value="all">All Topics</option>
              <option value="Product Quality">Product Quality</option>
              <option value="Delivery & Logistics">Delivery & Logistics</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Pricing & Value">Pricing & Value</option>
              <option value="Packaging & Presentation">Packaging</option>
              <option value="Hygiene & Store Ambiance">Hygiene & Ambiance</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Channel
            </label>
            <select
              value={filterSource}
              onChange={(e) => {
                setFilterSource(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="Google Reviews">Google Reviews</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Swiggy / Zomato">Food Delivery</option>
              <option value="In-Store Feedback">In-Store Log</option>
              <option value="Website Forms">Website</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Urgency
            </label>
            <select
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium cursor-pointer"
            >
              <option value="all">All Urgency</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Star Rating
            </label>
            <select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Review Status */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Triage Status
            </label>
            <select
              value={filterReviewed}
              onChange={(e) => {
                setFilterReviewed(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="0">Unreviewed</option>
              <option value="1">Reviewed & Handled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Feedback Table (Section 10) */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No feedback matching your filters"
            description="Try clearing your search query or selecting 'All' across the filter drop-downs."
            actionText="Clear Filters"
            onAction={() => {
              setFilterSearch('');
              setFilterSource('all');
              setFilterSentiment('all');
              setFilterTopic('all');
              setFilterPriority('all');
              setFilterRating('all');
              setFilterReviewed('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Customer & Channel</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Sentiment</th>
                  <th className="py-3 px-4">Topic / Product</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Customer & Channel */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{item.customer_name}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{item.location}</span>
                      </div>
                    </td>

                    {/* Message Preview */}
                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <p className="line-clamp-2 text-slate-800 leading-relaxed font-sans">
                        "{item.message}"
                      </p>
                      {item.detected_language !== 'en' && item.translated_text && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 italic mt-0.5">
                          <Globe className="w-2.5 h-2.5" />
                          Translated: "{item.translated_text}"
                        </span>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span className="font-semibold text-slate-800">{item.rating || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Sentiment & Emotion */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <SentimentBadge sentiment={item.sentiment} />
                        {item.emotions?.[0] && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.emotions[0]}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Topic & Product */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800">{item.topics?.[0] || 'General'}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px] mt-0.5">
                        {item.product_name}
                      </p>
                    </td>

                    {/* Urgency & Reviewed Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <PriorityBadge priority={item.priority} />
                        {item.reviewed ? (
                          <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Reviewed
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(item);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 p-1.5"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Drawer */}
      <FeedbackDetailDrawer
        item={selectedItem}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdated={loadFeedback}
      />
    </div>
  );
};
