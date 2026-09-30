import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  Upload, 
  UserCheck, 
  History, 
  FileCheck2, 
  AlertTriangle 
} from 'lucide-react';
import { Case } from '@shared/types';
import { updateCase, closeCaseWithPhoto } from '../api/client';
import { formatRemainingTime, formatDateTime, formatSourceLabel } from '../lib/formatters';
import { SimulationBadge } from './SimulationBadge';

interface CaseDetailModalProps {
  caseItem: Case | null;
  onClose: () => void;
  onCaseUpdated: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem,
  onClose,
  onCaseUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'close'>('details');
  const [officerName, setOfficerName] = useState(caseItem?.owner || '');
  const [authorityName, setAuthorityName] = useState(caseItem?.authority || '');
  const [statusVal, setStatusVal] = useState(caseItem?.status || 'open');
  const [updating, setUpdating] = useState(false);

  // Closure Form State
  const [closureFile, setClosureFile] = useState<File | null>(null);
  const [closurePreview, setClosurePreview] = useState<string | null>(null);
  const [closureNote, setClosureNote] = useState('');
  const [closing, setClosing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!caseItem) return null;

  const countdown = formatRemainingTime(caseItem.due_at);

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setErrorMsg(null);
      await updateCase(caseItem.id, {
        owner: officerName,
        authority: authorityName,
        status: statusVal
      });
      onCaseUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update case');
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setClosureFile(file);
      setClosurePreview(URL.createObjectURL(file));
    }
  };

  const handleCloseCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureFile && !caseItem.closure_photo) {
      setErrorMsg('Mandatory on-ground verification photo required to resolve case.');
      return;
    }

    try {
      setClosing(true);
      setErrorMsg(null);

      const formData = new FormData();
      if (closureFile) formData.append('closure_photo', closureFile);
      formData.append('note', closureNote || 'On-site verification completed. Water misting deployed and fire extinguished.');

      await closeCaseWithPhoto(caseItem.id, formData);
      onCaseUpdated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to close case');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-card shadow-modal border border-hairline overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-hairline bg-paper/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-signal px-2 py-0.5 rounded bg-signal-light border border-signal/20">
              {caseItem.id}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-badge font-semibold uppercase tracking-wider ${
                caseItem.status === 'closed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : caseItem.status === 'in_progress'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-signal-light text-signal'
              }`}
            >
              {caseItem.status.replace('_', ' ')}
            </span>
            <SimulationBadge label="Enforcement Flow" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-button text-slate hover:text-ink hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Statutory Countdown Header Banner */}
        <div
          className={`px-4 py-2 border-b border-hairline flex items-center justify-between text-xs ${
            caseItem.status === 'closed'
              ? 'bg-emerald-50 text-emerald-900'
              : countdown.isUrgent
              ? 'bg-alert-light text-alert animate-pulse'
              : 'bg-paper text-slate'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">
              {caseItem.status === 'closed'
                ? 'Case Closed & Remediated'
                : `Statutory 24-hr Deadline: ${countdown.text}`}
            </span>
          </div>
          {countdown.isUrgent && caseItem.status !== 'closed' && (
            <span className="font-bold flex items-center gap-1 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Escalated to District Magistrate</span>
            </span>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-hairline px-4 bg-paper/30 text-xs">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-signal text-signal font-semibold'
                : 'border-transparent text-slate hover:text-ink'
            }`}
          >
            Assignment & Status
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'timeline'
                ? 'border-signal text-signal font-semibold'
                : 'border-transparent text-slate hover:text-ink'
            }`}
          >
            Audit Trail ({caseItem.events?.length || 0})
          </button>
          {caseItem.status !== 'closed' && (
            <button
              onClick={() => setActiveTab('close')}
              className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                activeTab === 'close'
                  ? 'border-alert text-alert font-semibold'
                  : 'border-transparent text-slate hover:text-alert'
              }`}
            >
              Verify & Close Case
            </button>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="m-4 p-3 rounded-button bg-alert-light border border-alert/30 text-alert text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'details' && (
            <>
              {/* Hotspot Origin Details */}
              <div className="card-frame p-3.5 bg-paper/30 space-y-2 text-xs">
                <span className="text-[11px] font-semibold text-slate block uppercase tracking-wider">
                  Hotspot Anomaly Origin
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-slate block text-[10px]">Location</span>
                    <span className="font-mono text-ink font-medium">
                      {caseItem.hotspot?.lat.toFixed(4)}°, {caseItem.hotspot?.lng.toFixed(4)}°
                    </span>
                  </div>
                  <div>
                    <span className="text-slate block text-[10px]">Detected Gap</span>
                    <span className="font-mono text-alert font-bold">
                      +{caseItem.hotspot?.gap} µg/m³
                    </span>
                  </div>
                  <div>
                    <span className="text-slate block text-[10px]">Fused PM2.5</span>
                    <span className="font-mono text-ink font-semibold">
                      {caseItem.hotspot?.fused_pm25} µg/m³
                    </span>
                  </div>
                  <div>
                    <span className="text-slate block text-[10px]">Likely Source</span>
                    <span className="font-medium text-ink">
                      {formatSourceLabel(caseItem.hotspot?.likely_source || '')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignment Form */}
              <form onSubmit={handleUpdateAssignment} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate mb-1">
                      Assigned Enforcement Officer
                    </label>
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-hairline bg-paper/50 focus:bg-white focus:ring-1 focus:ring-signal outline-none"
                      placeholder="e.g. Dr. K.S. Rathore (DPCC Flying Squad)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate mb-1">
                      Statutory Enforcement Authority
                    </label>
                    <input
                      type="text"
                      value={authorityName}
                      onChange={(e) => setAuthorityName(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-hairline bg-paper/50 focus:bg-white focus:ring-1 focus:ring-signal outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate mb-1">
                    Enforcement Status
                  </label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value as any)}
                    className="w-full text-xs p-2 rounded border border-hairline bg-paper/50 focus:bg-white focus:ring-1 focus:ring-signal outline-none"
                  >
                    <option value="open">Open (Awaiting Field Team Dispatch)</option>
                    <option value="assigned">Assigned (Officer Dispatched)</option>
                    <option value="in_progress">In Progress (Active Misting / Inspection)</option>
                    <option value="closed">Closed (Requires verification photo)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 rounded-button bg-signal hover:bg-signal-hover text-white text-xs font-semibold shadow-subtle transition-all disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Save Assignment & Status'}
                  </button>
                </div>
              </form>

              {/* Show Closure Photo if Closed */}
              {caseItem.status === 'closed' && (
                <div className="card-frame p-3.5 space-y-2 border-emerald-300 bg-emerald-50/40">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Remediation Closure Evidence</span>
                  </div>
                  {caseItem.closure_photo ? (
                    <div className="mt-2 rounded-card overflow-hidden border border-hairline max-h-56 flex justify-center bg-black/10">
                      <img
                        src={caseItem.closure_photo}
                        alt="On-ground remediation verification"
                        className="object-contain max-h-56 w-auto"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-slate italic">Photo archived on enforcement server.</p>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <span className="text-xs font-medium text-slate block">
                Immutable Audit Trail (Section 31A Air Act Compliance)
              </span>
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-hairline">
                {caseItem.events?.map((ev, idx) => (
                  <div key={idx} className="relative group">
                    <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-signal border-2 border-white ring-1 ring-hairline" />
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink uppercase tracking-wide text-[10px]">
                          {ev.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate font-mono">
                          {formatDateTime(ev.ts)}
                        </span>
                      </div>
                      <p className="text-slate text-xs mt-0.5 leading-relaxed bg-paper/60 p-2 rounded border border-hairline">
                        {ev.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'close' && (
            <form onSubmit={handleCloseCase} className="space-y-4">
              <div className="p-3 rounded-button bg-alert-light/60 border border-alert/20 text-xs text-alert space-y-1">
                <span className="font-semibold block">Mandatory Verification Photo</span>
                <p className="text-[11px] text-slate leading-relaxed">
                  Per statutory compliance, an enforcement case cannot be closed without geotagged photographic proof demonstrating that the plume was suppressed (e.g. water fog cannon deployed, fire doused, or site sealed).
                </p>
              </div>

              {/* Upload Field */}
              <div>
                <label className="block text-xs font-medium text-slate mb-1">
                  Upload On-Ground Verification Photo
                </label>
                <div className="border-2 border-dashed border-hairline rounded-card p-4 text-center hover:bg-paper/40 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {closurePreview ? (
                    <div className="space-y-2">
                      <img
                        src={closurePreview}
                        alt="Verification preview"
                        className="mx-auto max-h-40 rounded border border-hairline"
                      />
                      <span className="text-[11px] text-signal font-medium block">
                        Click to change photo
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate mx-auto" />
                      <span className="text-xs font-medium text-ink block">
                        Drop inspection photo here or click to browse
                      </span>
                      <span className="text-[10px] text-slate block">
                        JPEG, PNG up to 10MB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Remediation Note */}
              <div>
                <label className="block text-xs font-medium text-slate mb-1">
                  Inspection Remediation Notes
                </label>
                <textarea
                  rows={3}
                  value={closureNote}
                  onChange={(e) => setClosureNote(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-hairline bg-paper/50 focus:bg-white focus:ring-1 focus:ring-signal outline-none"
                  placeholder="Detail actions taken: e.g. SDM flying squad deployed two 5,000L water mist bowsers, doused plastic fire, and served notice."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className="px-3 py-1.5 rounded-button text-xs text-slate hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={closing || !closureFile}
                  className="px-4 py-2 rounded-button bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{closing ? 'Verifying & Closing...' : 'Submit Evidence & Close Case'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
