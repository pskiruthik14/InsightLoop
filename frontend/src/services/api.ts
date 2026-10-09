import {
  User, Business, FeedbackItem, KPIs, TopicItem, IssueCluster,
  RootCauseItem, RecommendationItem, AlertItem, SourceItem, ReportItem,
  AuditLog, Settings, OperationalPillar, UrgentIssue
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('insightloop_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errData = await response.json();
      if (errData.detail) errorMsg = errData.detail;
      else if (errData.message) errorMsg = errData.message;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; full_name: string; business_name: string; business_category?: string }) =>
    request<{ token: string; user: User; business: Business }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User; business: Business }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  demoLogin: () =>
    request<{ token: string; user: User; business: Business }>('/auth/demo-login', {
      method: 'POST',
    }),

  getMe: () =>
    request<{ user: User; business: Business }>('/auth/me'),

  logout: () =>
    request<{ status: string }>('/auth/logout', { method: 'POST' }),

  completeOnboarding: (data: { business_name: string; category: string; size: string; sources: string[]; primary_goal: string }) =>
    request<{ status: string }>('/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  seedDemoData: () =>
    request<{ status: string; count: number; message: string }>('/auth/seed-data', {
      method: 'POST',
    }),

  // Analytics
  getOverview: (params: { days?: number; location?: string; product?: string; source?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.days) q.append('days', params.days.toString());
    if (params.location) q.append('location', params.location);
    if (params.product) q.append('product', params.product);
    if (params.source) q.append('source', params.source);
    return request<{ kpis: KPIs; operational_pillars: OperationalPillar[]; urgent_issues: UrgentIssue[] }>(`/analytics/overview?${q.toString()}`);
  },

  getSentimentTrend: (range = '30d') =>
    request<{ range: string; data: any[] }>(`/analytics/sentiment-trend?range=${range}`),

  getTopics: () =>
    request<{ topics: TopicItem[]; total_mentions: number }>('/analytics/topics'),

  getEmotions: () =>
    request<{ emotions: Array<{ emotion: string; count: number; percentage: number }> }>('/analytics/emotions'),

  getRatings: () =>
    request<{ distribution: Array<{ rating: number; count: number; percentage: number }>; total_rated: number }>('/analytics/ratings'),

  getSourcesComparison: () =>
    request<{ sources: Array<{ source: string; total: number; avg_rating: number; positive_pct: number; negative_pct: number }> }>('/analytics/sources-comparison'),

  getProductComparison: () =>
    request<{ products: Array<{ product: string; total: number; avg_rating: number; positive_pct: number; negative_pct: number }> }>('/analytics/product-comparison'),

  getLocationComparison: () =>
    request<{ locations: Array<{ location: string; total: number; avg_rating: number; positive_pct: number; negative_pct: number; sentiment_score: number }> }>('/analytics/location-comparison'),

  getCustomerVoice: () =>
    request<{
      customers_love: { themes: Array<{ theme: string; mention_count: number; sentiment_pct: number }>; quotes: any[] };
      customers_dislike: { themes: Array<{ theme: string; mention_count: number; negative_pct: number }>; quotes: any[] };
      emerging_concerns: Array<{ concern: string; trend: string; impact: string }>;
    }>('/analytics/customer-voice'),

  // Feedback
  listFeedback: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
    });
    return request<{ items: FeedbackItem[]; total: number; page: number; limit: number; total_pages: number }>(`/feedback?${q.toString()}`);
  },

  getFeedbackDetail: (id: string) =>
    request<FeedbackItem>(`/feedback/${id}`),

  createFeedback: (data: {
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    source: string;
    rating?: number;
    message: string;
    product_name?: string;
    location?: string;
  }) =>
    request<{ status: string; feedback_id: string; feedback: any; analysis: any }>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFeedbackStatus: (id: string, data: Record<string, any>) =>
    request<{ status: string }>(`/feedback/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  generateReply: (id: string, tone: string) =>
    request<{ feedback_id: string; tone: string; draft_response: string }>(`/feedback/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ tone }),
    }),

  // Issues & Root Causes
  getIssues: () =>
    request<{ issues: IssueCluster[] }>('/issues'),

  getRootCauses: () =>
    request<{ root_causes: RootCauseItem[] }>('/issues/root-causes'),

  // Recommendations
  getRecommendations: () =>
    request<{ recommendations: RecommendationItem[] }>('/recommendations'),

  updateRecommendationStatus: (id: string, status: string) =>
    request<{ status: string }>(`/recommendations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Alerts
  getAlerts: () =>
    request<{ alerts: AlertItem[]; active_count: number; thresholds: any }>('/alerts'),

  updateAlertStatus: (id: string, status: string) =>
    request<{ status: string }>(`/alerts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  configureThresholds: (data: {
    alert_sentiment_threshold: number;
    alert_volume_growth_threshold: number;
    alert_rating_threshold: number;
    notification_email?: string;
  }) =>
    request<{ status: string }>('/alerts/configure-thresholds', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Sources
  getSources: () =>
    request<{ sources: SourceItem[] }>('/sources'),

  syncSource: (id: string) =>
    request<{ status: string; last_sync_at: string }>(`/sources/${id}/sync`, { method: 'POST' }),

  configureSource: (id: string, status: string, config: Record<string, any>) =>
    request<{ status: string }>(`/sources/${id}/configure`, {
      method: 'POST',
      body: JSON.stringify({ status, config }),
    }),

  // CSV Import
  previewCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('insightloop_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${API_BASE}/import/preview`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to preview CSV');
    return res.json();
  },

  processCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('insightloop_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${API_BASE}/import/process`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to process CSV');
    return res.json();
  },

  // Reports
  getReports: () =>
    request<{ reports: ReportItem[] }>('/reports'),

  generateReport: (report_type: string) =>
    request<ReportItem>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ report_type }),
    }),

  getReportDetail: (id: string) =>
    request<ReportItem>(`/reports/${id}`),

  // Settings
  getSettings: () =>
    request<{ business: Business; settings: Settings }>('/settings'),

  updateSettings: (data: Partial<Settings> & { mistral_api_key?: string; gemini_api_key?: string; openai_api_key?: string }) =>
    request<{ status: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateProfile: (data: { name: string; category: string; size: string; primary_goal: string }) =>
    request<{ status: string }>('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getTeam: () =>
    request<{ team: User[] }>('/settings/team'),

  inviteTeamMember: (data: { email: string; full_name: string; role: string }) =>
    request<{ status: string }>('/settings/team/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAuditLogs: () =>
    request<{ logs: AuditLog[] }>('/settings/audit-logs'),

  resetDemoData: () =>
    request<{ status: string; message: string }>('/settings/reset-demo-data', {
      method: 'POST',
    }),

  // Ask Your Data
  askData: (query: string) =>
    request<{
      query: string;
      title: string;
      answer: string;
      evidence: string[];
      recommended_action: string;
      data_summary: {
        total_feedback: number;
        average_rating: number;
        positive_percentage: number;
        negative_percentage: number;
        neutral_percentage: number;
      };
    }>('/ask', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
};
