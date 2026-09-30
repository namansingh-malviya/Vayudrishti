import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  ChevronRight, 
  Camera, 
  Flame, 
  Factory, 
  Filter,
  Plus
} from 'lucide-react';
import { Case, CaseStatus } from '@shared/types';
import { fetchCases } from '../api/client';
import { CaseDetailModal } from '../components/CaseDetailModal';
import { formatRemainingTime, formatDateTime, formatSourceLabel } from '../lib/formatters';
import { SimulationBadge } from '../components/SimulationBadge';

export const CaseBoardPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const loadCases = () => {
    setLoading(true);
    fetchCases()
      .then((res) => {
        setCases(res.cases || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load cases:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCases();
    // Live ticking countdown refresher every 30s
    const timer = setInterval(loadCases, 30000);
    return () => clearInterval(timer);
  }, []);

  const filteredCases = statusFilter === 'all' 
    ? cases 
    : cases.filter((c) => c.status === statusFilter);

  const columns: { status: CaseStatus; title: string; desc: string; count: number }[] = [
    { 
      status: 'open', 
      title: 'Open Cases', 
      desc: 'Anomaly flagged; awaiting dispatch',
      count: cases.filter((c) => c.status === 'open').length 
    },
    { 
      status: 'assigned', 
      title: 'Assigned', 
      desc: 'Flying squad designated',
      count: cases.filter((c) => c.status === 'assigned').length 
    },
    { 
      status: 'in_progress', 
      title: 'In Progress', 
      desc: 'Active suppression / inspection',
      count: cases.filter((c) => c.status === 'in_progress').length 
    },
    { 
      status: 'closed', 
      title: 'Verified Closed', 
      desc: 'Resolved with on-ground photo proof',
      count: cases.filter((c) => c.status === 'closed').length 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-ink">
              Enforcement Case Board
            </h1>
            <SimulationBadge label="Statutory Workflow" />
          </div>
          <p className="text-xs text-slate font-sans mt-0.5">
            Transforming detected pollution blindspots into legally routed, verified remediations under CPCB Section 31A.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto bg-white p-1 rounded-card border border-hairline text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-button font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-signal text-white font-semibold'
                : 'text-slate hover:text-ink'
            }`}
          >
            All ({cases.length})
          </button>
          {columns.map((col) => (
            <button
              key={col.status}
              onClick={() => setStatusFilter(col.status)}
              className={`px-3 py-1 rounded-button font-medium transition-colors ${
                statusFilter === col.status
                  ? 'bg-signal text-white font-semibold'
                  : 'text-slate hover:text-ink'
              }`}
            >
              {col.title} ({col.count})
            </button>
          ))}
        </div>
      </div>

      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colCases = cases.filter((c) => c.status === col.status);
          return (
            <div key={col.status} className="flex flex-col space-y-3">
              {/* Column Header */}
              <div className="p-3 bg-white rounded-card border border-hairline shadow-subtle flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-semibold text-ink text-sm">
                      {col.title}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-paper text-slate text-xs font-mono flex items-center justify-center font-bold">
                      {col.count}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate block leading-tight mt-0.5">
                    {col.desc}
                  </span>
                </div>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1">
                {colCases.map((caseItem) => {
                  const countdown = formatRemainingTime(caseItem.due_at);
                  const isClosed = caseItem.status === 'closed';

                  return (
                    <div
                      key={caseItem.id}
                      onClick={() => setSelectedCase(caseItem)}
                      className="card-frame p-3.5 space-y-2.5 cursor-pointer hover:border-signal/50 hover:shadow transition-all group relative"
                    >
                      {/* Top row: Case ID & Countdown */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-signal px-1.5 py-0.5 rounded bg-signal-light">
                          {caseItem.id}
                        </span>
                        
                        <div
                          className={`flex items-center gap-1 text-[11px] font-mono font-medium ${
                            isClosed
                              ? 'text-emerald-700'
                              : countdown.isUrgent
                              ? 'text-alert font-bold animate-pulse'
                              : 'text-slate'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{isClosed ? 'Remediated' : countdown.text}</span>
                        </div>
                      </div>

                      {/* Escalation Warning Ribbon */}
                      {countdown.isUrgent && !isClosed && (
                        <div className="p-1 rounded bg-alert-light border border-alert/20 text-alert text-[10px] font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <span>Statutory Escalation (&lt;4h remaining)</span>
                        </div>
                      )}

                      {/* Hotspot details & Gap */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                          {caseItem.hotspot?.likely_source === 'industrial' ? (
                            <Factory className="w-3.5 h-3.5 text-signal" />
                          ) : (
                            <Flame className="w-3.5 h-3.5 text-alert" />
                          )}
                          <span>{formatSourceLabel(caseItem.hotspot?.likely_source || '')}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate">Unmonitored Gap:</span>
                          <span className="font-mono font-bold text-alert">
                            +{caseItem.hotspot?.gap} µg/m³
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate">Fused Peak:</span>
                          <span className="font-mono text-ink">
                            {caseItem.hotspot?.fused_pm25} µg/m³
                          </span>
                        </div>
                      </div>

                      {/* Authority & Assigned Officer */}
                      <div className="pt-2 border-t border-hairline space-y-0.5 text-[11px]">
                        <div className="text-slate truncate" title={caseItem.authority}>
                          <span className="text-[10px] text-slate/70">Auth:</span> {caseItem.authority}
                        </div>
                        <div className="text-ink font-medium truncate" title={caseItem.owner}>
                          <span className="text-[10px] text-slate/70">Lead:</span> {caseItem.owner}
                        </div>
                      </div>

                      {/* Closure Photo Thumbnail */}
                      {isClosed && caseItem.closure_photo && (
                        <div className="pt-1.5 flex items-center gap-2">
                          <img
                            src={caseItem.closure_photo}
                            alt="Closure verified"
                            className="w-12 h-9 rounded object-cover border border-emerald-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="text-[10px] text-emerald-800 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Photo Verified</span>
                          </span>
                        </div>
                      )}

                      {/* Hover Arrow */}
                      <div className="flex justify-end pt-1">
                        <span className="text-[10px] text-signal font-medium flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                          <span>Inspect Action</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}

                {colCases.length === 0 && (
                  <div className="p-6 text-center border border-dashed border-hairline rounded-card text-slate text-xs">
                    No cases in this stage.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Case Details / Close Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseItem={selectedCase}
          onClose={() => setSelectedCase(null)}
          onCaseUpdated={() => {
            loadCases();
            setSelectedCase(null);
          }}
        />
      )}
    </div>
  );
};
