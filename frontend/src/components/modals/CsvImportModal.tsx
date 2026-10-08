import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsPreviewing(true);
    setPreviewData(null);
    setImportResult(null);

    try {
      const preview = await api.previewCsv(file);
      setPreviewData(preview);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Preview failed',
        message: err.message || 'Could not parse CSV file.',
      });
      setSelectedFile(null);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const res = await api.processCsv(selectedFile);
      setImportResult(res);
      showToast({
        type: 'success',
        title: 'Import completed',
        message: `${res.imported} customer reviews analyzed and added.`,
      });
      onSuccess();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Import failed',
        message: err.message || 'Could not process CSV.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={reset}
      title="Import Customer Feedback CSV"
      subtitle="Upload spreadsheets from POS, Google Takeout, or support tickets. Columns are auto-mapped."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Upload Dropzone */}
        {!selectedFile && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50 hover:bg-indigo-50/20 transition-all"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Choose a CSV file or drag and drop</p>
            <p className="text-xs text-slate-500 mt-1">Accepts standard exports with comments, ratings, and timestamps</p>
          </div>
        )}

        {/* Loading Preview */}
        {isPreviewing && (
          <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs font-medium">Inspecting CSV columns and row structure...</p>
          </div>
        )}

        {/* Preview State */}
        {previewData && !importResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">{previewData.filename}</p>
                  <p className="text-[11px] text-slate-500">
                    {previewData.rows_detected} rows detected • {previewData.valid_rows} valid reviews
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewData(null);
                }}
              >
                Change file
              </Button>
            </div>

            {/* Smart Column Mapping Card */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
              <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Intelligent Column Mapping
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(previewData.mapped_columns).map(([target, colIdx]: [string, any]) => (
                  <div key={target} className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-600 capitalize">{target.replace('_', ' ')}:</span>
                    <span className="font-mono text-[11px] text-indigo-600">
                      {colIdx !== null ? previewData.headers[colIdx] : <span className="text-slate-400">Default fallback</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Preview List */}
            {previewData.sample_preview && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-700">Sample Row Previews:</p>
                {previewData.sample_preview.map((sample: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-slate-50 text-[11px] text-slate-700 border border-slate-200 truncate">
                    • {sample.extracted_message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Import Results Card */}
        {importResult && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h4 className="font-semibold text-sm">Batch Processing Complete!</h4>
            </div>
            <p className="text-xs text-emerald-800">{importResult.message}</p>
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="bg-white p-2 rounded border border-emerald-200">
                <p className="text-lg font-bold text-emerald-600">{importResult.imported}</p>
                <p className="text-[10px] text-slate-500">Reviews Ingested</p>
              </div>
              <div className="bg-white p-2 rounded border border-emerald-200">
                <p className="text-lg font-bold text-slate-600">{importResult.duplicates_skipped}</p>
                <p className="text-[10px] text-slate-500">Duplicates Skipped</p>
              </div>
              <div className="bg-white p-2 rounded border border-emerald-200">
                <p className="text-lg font-bold text-slate-600">{importResult.invalid_rows}</p>
                <p className="text-[10px] text-slate-500">Invalid Rows</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={reset}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {previewData && !importResult && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isProcessing}
              onClick={handleImport}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Start Batch Processing
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
