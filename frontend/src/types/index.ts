export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'analyst' | 'viewer';
}

export interface Business {
  id: string;
  name: string;
  category: string;
  size?: string;
  primary_goal?: string;
  onboarding_completed: boolean;
}

export interface AspectSentiment {
  aspect: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  confidence: number;
  keywords: string[];
}

export interface FeedbackItem {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  source: string;
  rating: number | null;
  message: string;
  original_language: string;
  detected_language: string;
  translated_text?: string | null;
  product_name: string;
  location: string;
  created_at: string;
  reviewed: boolean | number;
  assigned_to?: string | null;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
  archived: boolean | number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentiment_score: number;
  confidence: number;
  emotions: string[];
  topics: string[];
  aspects: AspectSentiment[];
  intent: string;
  analysis_priority: string;
  summary: string;
  actionable: boolean | number;
  explanation: string;
  provider_used?: string;
}

export interface KPIs {
  sentiment_score: number;
  score_change: number;
  score_explanation: string;
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;
  total_feedback: number;
  critical_issues: number;
  response_rate: number;
  average_rating: number;
}

export interface OperationalPillar {
  name: string;
  total: number;
  positive_count: number;
  negative_count: number;
  satisfaction_pct: number;
}

export interface UrgentIssue {
  name: string;
  topic: string;
  feedback_count: number;
  negative_pct: number;
  severity: string;
  affected_locations: string[];
  recommended_action: string;
}

export interface TopicItem {
  id: string;
  name: string;
  feedback_count: number;
  share_percentage: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  positive_pct: number;
  negative_pct: number;
  trend_percentage: number;
}

export interface IssueCluster {
  id: string;
  name: string;
  topic: string;
  feedback_count: number;
  negative_pct: number;
  trend_percentage: number;
  affected_locations: string[];
  root_cause_summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence_quotes: string[];
  confidence: number;
  recommended_action: string;
  updated_at: string;
}

export interface RootCauseItem {
  id: string;
  problem: string;
  operational_pillar: string;
  severity: string;
  observed_evidence: {
    verifiable_complaint_count: number;
    negative_concentration_pct: number;
    affected_geographies: string[];
    customer_quotes: string[];
  };
  llm_hypotheses: Array<{
    hypothesis: string;
    confidence: number;
    label: string;
  }>;
  recommended_action: string;
}

export interface RecommendationItem {
  id: string;
  priority_rank: number;
  title: string;
  description: string;
  category: string;
  priority_score: number;
  priority_label: string;
  formula_breakdown: {
    formula: string;
    severity_factor: number;
    frequency_factor: number;
    recency_factor: number;
    trend_factor: number;
    computed_score: number;
  };
  rationale: string;
  affected_count: number;
  potential_impact: string;
  estimated_cost: string;
  implementation_steps: string[];
  status: 'open' | 'in_progress' | 'resolved';
  updated_at: string;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  alert_type: string;
  triggered_at: string;
  status: 'active' | 'acknowledged' | 'resolved';
  metric_value: number;
  threshold_value: number;
}

export interface SourceItem {
  id: string;
  type: string;
  name: string;
  status: 'connected' | 'not_connected' | 'error';
  feedback_count: number;
  last_sync_at: string | null;
  health_status: 'healthy' | 'degraded' | 'idle';
  config: Record<string, any>;
}

export interface ReportItem {
  id: string;
  type: string;
  title: string;
  generated_at: string;
  summary: string;
  metrics: {
    total_reviews: number;
    positive_percentage: number;
    negative_percentage: number;
    neutral_percentage: number;
    average_rating: number;
    topics_analyzed: number;
    critical_issues_flagged: number;
  };
  data_snapshot?: {
    topics: any[];
    issues: any[];
    recommendations: any[];
    positive_highlights: string[];
    negative_friction_points: string[];
  };
}

export interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Settings {
  mask_pii: boolean;
  ai_provider: string;
  alert_sentiment_threshold: number;
  alert_volume_growth_threshold: number;
  alert_rating_threshold: number;
  notification_email: string;
  auto_triage: boolean;
  has_gemini_key: boolean;
  has_openai_key: boolean;
  has_anthropic_key: boolean;
}
