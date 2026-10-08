import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Settings, Business, User, AuditLog } from '../types';
import {
  Settings as SettingsIcon,
  Shield,
  Bot,
  Users,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  Lock,
  UserPlus,
  Key,
  ShieldAlert,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'privacy' | 'team' | 'audit' | 'data'>('profile');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [team, setTeam] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Profile form
  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('');
  const [bizSize, setBizSize] = useState('');
  const [bizGoal, setBizGoal] = useState('');

  // AI Configuration
  const [aiProvider, setAiProvider] = useState('hybrid');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');

  // Privacy
  const [maskPii, setMaskPii] = useState(true);

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('analyst');

  const [isSaving, setIsSaving] = useState(false);

  const loadSettingsData = async () => {
    try {
      const res = await api.getSettings();
      setSettings(res.settings);
      setBusiness(res.business);
      setBizName(res.business?.name || '');
      setBizCategory(res.business?.category || '');
      setBizSize(res.business?.size || '10-49 employees');
      setBizGoal(res.business?.primary_goal || '');
      setAiProvider(res.settings.ai_provider || 'hybrid');
      setMaskPii(Boolean(res.settings.mask_pii));

      const teamRes = await api.getTeam();
      setTeam(teamRes.team);

      const logsRes = await api.getAuditLogs();
      setAuditLogs(logsRes.logs);
    } catch {
      // Handled
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({
        name: bizName,
        category: bizCategory,
        size: bizSize,
        primary_goal: bizGoal,
      });
      showToast({ type: 'success', title: 'Business profile updated' });
      loadSettingsData();
    } catch {
      showToast({ type: 'error', title: 'Failed to save profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings({
        ai_provider: aiProvider,
        gemini_api_key: geminiKey || undefined,
        openai_api_key: openaiKey || undefined,
      });
      showToast({ type: 'success', title: 'AI provider settings updated' });
      loadSettingsData();
    } catch {
      showToast({ type: 'error', title: 'Failed to save AI configuration' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePii = async () => {
    const nextVal = !maskPii;
    setMaskPii(nextVal);
    try {
      await api.updateSettings({ mask_pii: nextVal });
      showToast({
        type: 'success',
        title: nextVal ? 'PII Masking Enabled' : 'PII Masking Disabled',
        message: nextVal ? 'Customer emails and phone numbers are now masked across views.' : 'Raw customer contact info is now visible.',
      });
      loadSettingsData();
    } catch {
      showToast({ type: 'error', title: 'Failed to update privacy setting' });
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.inviteTeamMember({
        email: inviteEmail,
        full_name: inviteName,
        role: inviteRole,
      });
      showToast({ type: 'success', title: `Invitation created for ${inviteEmail}` });
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
      loadSettingsData();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Invite failed', message: err.message });
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset workspace back to original 520+ demo customer feedback records?')) return;
    try {
      await api.resetDemoData();
      showToast({ type: 'success', title: 'Demo dataset restored successfully' });
      loadSettingsData();
    } catch {
      showToast({ type: 'error', title: 'Reset failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900">Workspace Settings & Administration</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure business profile, LLM provider abstraction, privacy compliance, team roles, and audit trail.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="md:col-span-1 space-y-1">
          {[
            { id: 'profile', label: 'Business Profile', icon: <SettingsIcon className="w-4 h-4" /> },
            { id: 'ai', label: 'AI Configuration', icon: <Bot className="w-4 h-4" /> },
            { id: 'privacy', label: 'Privacy & PII Masking', icon: <Shield className="w-4 h-4" /> },
            { id: 'team', label: 'Team Members & Roles', icon: <Users className="w-4 h-4" /> },
            { id: 'audit', label: 'Audit Trail Logs', icon: <ShieldAlert className="w-4 h-4" /> },
            { id: 'data', label: 'Data Management', icon: <FileSpreadsheet className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="md:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card title="Business Profile" subtitle="Update basic enterprise identity and industry categorization">
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Industry Category</label>
                    <input
                      type="text"
                      value={bizCategory}
                      onChange={(e) => setBizCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Company Size</label>
                    <input
                      type="text"
                      value={bizSize}
                      onChange={(e) => setBizSize(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Operational Focus</label>
                  <input
                    type="text"
                    value={bizGoal}
                    onChange={(e) => setBizGoal(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                  Save Profile Changes
                </Button>
              </form>
            </Card>
          )}

          {/* AI Configuration Tab (Section 14 & 48) */}
          {activeTab === 'ai' && (
            <Card title="AI Intelligence Provider Configuration" subtitle="Configure provider abstraction layer with automatic deterministic fallback">
              <form onSubmit={handleSaveAiConfig} className="space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200 text-indigo-950 space-y-1">
                  <p className="font-semibold">Provider Abstraction Guarantee:</p>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    InsightLoop supports <strong>Google Gemini</strong>, <strong>OpenAI GPT-4o-mini</strong>, and <strong>Local Rule-Based ABSA</strong>. If external API keys are omitted or rate-limited, the system falls back to the deterministic multilingual rule engine without downtime.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Active AI Engine</label>
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="hybrid">Hybrid Engine (Gemini / OpenAI with Offline Rule Fallback)</option>
                    <option value="gemini">Google Gemini API (gemini-1.5-flash)</option>
                    <option value="openai">OpenAI API (gpt-4o-mini)</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="rule_based">Deterministic Rule & Linguistic ABSA Engine (Zero API Cost)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Google Gemini API Key {settings?.has_gemini_key && <span className="text-emerald-600 font-normal">(Configured ✓)</span>}
                  </label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    OpenAI API Key {settings?.has_openai_key && <span className="text-emerald-600 font-normal">(Configured ✓)</span>}
                  </label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                </div>

                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                  Update AI Configuration
                </Button>
              </form>
            </Card>
          )}

          {/* Privacy Tab (Section 35) */}
          {activeTab === 'privacy' && (
            <Card title="Privacy & Customer PII Masking" subtitle="GDPR / DPDP compliant data protection for customer personal info">
              <div className="space-y-4 text-xs">
                <div className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="space-y-1 max-w-md">
                    <p className="font-bold text-slate-900 text-sm">Mask Customer Personal Information (PII)</p>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      When enabled, customer emails (e.g. <code>arun@gmail.com</code>) become <code>a***@gmail.com</code> and phone numbers (e.g. <code>+91 98430 11234</code>) become <code>+91 98*** 11***</code> across all dashboards and exported tables.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={maskPii}
                    onChange={handleTogglePii}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-1"
                  />
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PII protection is currently {maskPii ? 'Active' : 'Disabled'}.</span>
                </div>
              </div>
            </Card>
          )}

          {/* Team Collaboration Tab (Section 53) */}
          {activeTab === 'team' && (
            <Card
              title="Team Members & Role-Based Access"
              subtitle="Manage team members, roles (Owner, Admin, Analyst, Viewer), and access permissions"
              action={
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  onClick={() => setInviteModalOpen(true)}
                >
                  Invite Member
                </Button>
              }
            >
              <div className="space-y-3 text-xs">
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {team.map((mem) => (
                    <div key={mem.id} className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50">
                      <div>
                        <p className="font-semibold text-slate-900">{mem.full_name}</p>
                        <p className="text-[11px] text-slate-500">{mem.email}</p>
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {mem.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Audit Logs Tab (Section 54) */}
          {activeTab === 'audit' && (
            <Card title="Audit Trail Log" subtitle="Verifiable record of sensitive operational actions, imports, and threshold adjustments">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 font-mono text-[10px]">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{log.user_email}</td>
                        <td className="py-2.5 px-3 font-semibold text-indigo-700">{log.action}</td>
                        <td className="py-2.5 px-3 text-slate-600">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <Card title="Data Management & Backup" subtitle="Export data archives or reset workspace to original deterministic seed data">
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-slate-900">Export All Feedback</h4>
                  <p className="text-slate-600 text-[11px]">
                    Download a comprehensive CSV archive of all verified customer reviews, aspect classifications, and urgency tags.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('/api/feedback/export', '_blank')}
                  >
                    Download Full CSV Backup
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2">
                  <h4 className="font-bold text-rose-900">Reset Demo Dataset</h4>
                  <p className="text-slate-600 text-[11px]">
                    Reinitializes the database with 524 realistic MSME reviews across bakery and cafe operations, restoring baseline correlations.
                  </p>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleResetDemoData}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Restore 524-Record Demo Dataset
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member"
        subtitle="Grant your team access with specific operational privileges."
        maxWidth="sm"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Meera Swaminathan"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="meera@artisancafe.com"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Role & Permissions</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="admin">Admin (Manage settings, sources & team)</option>
              <option value="analyst">Analyst (View analytics, triage & export)</option>
              <option value="viewer">Viewer (Read-only dashboard access)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
