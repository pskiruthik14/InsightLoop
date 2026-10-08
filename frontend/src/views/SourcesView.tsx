import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ConnectionSetupModal } from '../components/modals/ConnectionSetupModal';
import { SourceItem } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Share2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  FileSpreadsheet,
  Globe,
  Mail,
  Smartphone,
  Edit3,
} from 'lucide-react';

interface SourcesViewProps {
  onOpenImportModal: () => void;
  onOpenAddModal: () => void;
}

export const SourcesView: React.FC<SourcesViewProps> = ({
  onOpenImportModal,
  onOpenAddModal,
}) => {
  const { showToast } = useToast();
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedSourceForSetup, setSelectedSourceForSetup] = useState<SourceItem | null>(null);

  const loadSources = async () => {
    try {
      const res = await api.getSources();
      setSources(res.sources);
    } catch {
      // Handled
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleSync = async (source: SourceItem) => {
    setSyncingId(source.id);
    try {
      await api.syncSource(source.id);
      showToast({ type: 'success', title: `${source.name} synchronized successfully` });
      loadSources();
    } catch {
      showToast({ type: 'error', title: 'Sync failed' });
    } finally {
      setSyncingId(null);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'google':
        return <Globe className="w-5 h-5 text-blue-600" />;
      case 'whatsapp':
        return <Smartphone className="w-5 h-5 text-emerald-600" />;
      case 'email':
        return <Mail className="w-5 h-5 text-indigo-600" />;
      case 'website':
        return <Globe className="w-5 h-5 text-cyan-600" />;
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-amber-600" />;
      default:
        return <Edit3 className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Feedback Sources & Ingestion Channels</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time health, synchronization frequency, and connector credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenImportModal}>
            Upload CSV File
          </Button>
          <Button variant="primary" size="sm" onClick={onOpenAddModal}>
            + Manual Review Entry
          </Button>
        </div>
      </div>

      {/* Sources Grid (Section 23) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((src) => {
          const isConnected = src.status === 'connected';
          const isSyncing = syncingId === src.id;

          return (
            <Card key={src.id} className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100">{getSourceIcon(src.type)}</div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{src.name}</h3>
                      <p className="text-[11px] text-slate-400 capitalize">{src.type} Stream</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Feedback Ingested</span>
                    <span className="font-bold text-slate-900 text-sm">{src.feedback_count}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Health Status</span>
                    <span className="font-semibold text-emerald-600 capitalize text-xs">
                      {src.health_status}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  Last Synchronization:{' '}
                  <strong>{src.last_sync_at ? src.last_sync_at : 'Never synced'}</strong>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                {src.type === 'csv' ? (
                  <Button size="sm" variant="outline" onClick={onOpenImportModal} className="w-full">
                    Import File
                  </Button>
                ) : src.type === 'manual' ? (
                  <Button size="sm" variant="outline" onClick={onOpenAddModal} className="w-full">
                    Add POS Entry
                  </Button>
                ) : isConnected ? (
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(src)}
                      isLoading={isSyncing}
                      leftIcon={<RefreshCw className="w-3 h-3" />}
                      className="flex-1"
                    >
                      Sync Now
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedSourceForSetup(src)}
                    >
                      Configure
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setSelectedSourceForSetup(src)}
                    className="w-full"
                  >
                    Set Up Connection
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Realistic Connection Setup Modal (Section 23) */}
      <ConnectionSetupModal
        source={selectedSourceForSetup}
        isOpen={Boolean(selectedSourceForSetup)}
        onClose={() => setSelectedSourceForSetup(null)}
        onSuccess={loadSources}
      />
    </div>
  );
};
