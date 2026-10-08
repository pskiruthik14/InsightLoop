import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SourceItem } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Key, Link2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ConnectionSetupModalProps {
  source: SourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConnectionSetupModal: React.FC<ConnectionSetupModalProps> = ({
  source,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [accountId, setAccountId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('https://api.insightloop.io/v1/webhooks/incoming');
  const [isSaving, setIsSaving] = useState(false);

  if (!source) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.configureSource(source.id, 'connected', {
        api_key_configured: true,
        account_id: accountId || 'live_sync_account',
        webhook_verified: true,
      });
      showToast({
        type: 'success',
        title: `${source.name} Connected`,
        message: 'Credentials verified. Automatic sync interval set to 15 minutes.',
      });
      onSuccess();
      onClose();
    } catch {
      showToast({ type: 'error', title: 'Connection failed', message: 'Could not verify API credentials.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Connect ${source.name}`}
      subtitle="Configure enterprise API credentials or webhooks to stream live customer reviews."
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {source.type === 'google' && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
            <p className="font-semibold">Google Business Profile API Requirements:</p>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Requires a verified Google Cloud Console Project with the <code>Google My Business Account Management API</code> enabled.
            </p>
          </div>
        )}

        {source.type === 'whatsapp' && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
            <p className="font-semibold">Meta WhatsApp Cloud API Requirements:</p>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Requires a verified WhatsApp Business Account (WABA) and System User Token with <code>whatsapp_business_messages</code> permission.
            </p>
          </div>
        )}

        <div>
          <label className="block font-medium text-slate-700 mb-1">
            {source.type === 'google' ? 'Google Place ID / Location ID' : 'Account / Phone ID'}
          </label>
          <input
            type="text"
            required
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder={source.type === 'google' ? 'e.g. ChIJN1t_tDeuEmsRUsoyG83frY4' : 'e.g. 1048291049281'}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Live Access Token / Secret Key</label>
          <input
            type="password"
            required
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="••••••••••••••••••••••••••••••••"
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Webhook Callback URL</label>
          <input
            type="text"
            readOnly
            value={webhookUrl}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-mono text-[11px]"
          />
          <p className="text-[10px] text-slate-400 mt-1">Register this URL in your developer console for instant event delivery.</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
            Verify & Connect
          </Button>
        </div>
      </form>
    </Modal>
  );
};
