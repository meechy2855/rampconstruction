import { useState, useRef } from 'react';
import {
  X, ArrowLeft, AlertTriangle, Upload, Check, Clock, Send,
  MapPin, Calendar, Shield, Edit3, ChevronRight, Ban,
  CreditCard, User, HardHat, ArrowUpRight, Lock, Flag, MessageSquare,
  Camera, ExternalLink, Zap, Trash2, GripVertical, Plus, Receipt, FileText,
  RotateCcw,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { projects } from '../data/mockData';
import { deriveCardTransactionStatus, getTransactionBlockers, isReadyForReview } from '../utils/cardTransactionStatus';

/* ─── Upload Receipt Modal ─── */
function UploadReceiptModal({ onClose, onSave }) {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const newFiles = Array.from(fileList).map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ animation: 'modalFadeIn 0.15s ease-out' }}
    >
      <div
        className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ animation: 'modalSlideUp 0.2s ease-out' }}
      >
        <div className="px-6 pt-5 pb-4 border-b border-stone-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">Upload Receipt</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-stone-900 bg-stone-50' : 'border-stone-300 hover:border-stone-400'
            }`}
          >
            <Upload size={24} className="mx-auto text-stone-400 mb-2" />
            <div className="text-sm text-stone-600">Drop files here or click to browse</div>
            <div className="text-xs text-stone-400 mt-1">PDF, JPG, PNG up to 10 MB</div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map(f => (
                <div key={f.id} className="flex items-center gap-3 px-3 py-2 bg-stone-50 rounded-lg border border-stone-200">
                  <FileText size={14} className="text-stone-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-stone-800 truncate">{f.name}</div>
                    <div className="text-xs text-stone-400">{f.size}</div>
                  </div>
                  <button onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))} className="text-stone-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-stone-200 px-6 py-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium">
            Cancel
          </button>
          <button
            onClick={() => { onSave(files); onClose(); }}
            disabled={files.length === 0}
            className="text-sm bg-stone-900 text-white rounded-lg px-4 py-2 hover:bg-stone-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save receipt{files.length > 1 ? 's' : ''}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

/* ─── Request Changes Modal ─── */
function RequestChangesModal({ onClose, onSubmit }) {
  const [changeType, setChangeType] = useState('RECEIPT');
  const [reason, setReason] = useState('');

  const typeOptions = [
    { value: 'RECEIPT', label: 'Receipt issue', description: 'Receipt is missing or incorrect' },
    { value: 'PROJECT_CODE', label: 'Project / cost code', description: 'Wrong or missing project or cost code' },
    { value: 'OTHER', label: 'Other', description: 'Describe the issue below' },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ animation: 'modalFadeIn 0.15s ease-out' }}
    >
      <div
        className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ animation: 'modalSlideUp 0.2s ease-out' }}
      >
        <div className="px-6 pt-5 pb-4 border-b border-stone-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">Request Changes</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <div className="text-sm font-medium text-stone-700 mb-2">What needs to change?</div>
            <div className="space-y-2">
              {typeOptions.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                    changeType === opt.value
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="changeType"
                    value={opt.value}
                    checked={changeType === opt.value}
                    onChange={() => setChangeType(opt.value)}
                    className="mt-0.5 accent-stone-900"
                  />
                  <div>
                    <div className="text-sm font-medium text-stone-800">{opt.label}</div>
                    <div className="text-xs text-stone-500">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-stone-700 mb-1.5">Note (optional)</div>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Add context for the cardholder..."
              rows={3}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
            />
          </div>
        </div>

        <div className="border-t border-stone-200 px-6 py-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium">
            Cancel
          </button>
          <button
            onClick={() => { onSubmit(changeType, reason); onClose(); }}
            className="text-sm bg-stone-900 text-white rounded-lg px-4 py-2 hover:bg-stone-800 font-medium"
          >
            <span className="flex items-center gap-1.5"><RotateCcw size={13} /> Request changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/* ─── Initials helper ─── */
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase();
}

/* ─── Warm beige field card (matches Ramp's accounting fields) ─── */
function FieldCard({ label, value, verified, sub, rightLabel, rightValue, rightVerified }) {
  return (
    <div className="bg-stone-50 rounded-lg px-4 py-3 mb-2">
      {rightLabel ? (
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="text-xs text-stone-500 mb-0.5">{label}</div>
            <div className="flex items-center gap-1.5">
              {verified && <Check size={14} className="text-stone-500" />}
              <span className="text-sm text-stone-800">{value}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-stone-400 pt-3">⇋</div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              {rightVerified && <Check size={14} className="text-stone-500" />}
              <span className="text-sm text-stone-600">{rightValue}</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-xs text-stone-500 mb-0.5">{label}</div>
          <div className="flex items-center gap-1.5">
            {verified && <Check size={14} className="text-stone-500" />}
            <span className="text-sm text-stone-800">{value}</span>
          </div>
          {sub && <div className="text-xs text-stone-500 mt-0.5">{sub}</div>}
        </>
      )}
    </div>
  );
}

/* ─── Section heading (matches Ramp's large bold section titles) ─── */
function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mt-7 mb-3">
      <h2 className="text-xl font-semibold text-stone-900 tracking-tight">{children}</h2>
      {right}
    </div>
  );
}

/* ─── Divider ─── */
function Divider() {
  return <div className="border-t border-stone-200 my-5" />;
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1: Overview
   - Warning banners, field owner, category, supplier, transaction state,
     review status, approval chain, submission policy, receipts, job note
   ═══════════════════════════════════════════════════════════════ */
function OverviewContent({ t, onAction, edits, setEdits, isDirty, setIsDirty }) {
  const [memo, setMemo] = useState(t.memo || '');
  const [showUpload, setShowUpload] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState((edits.receiptStatus || t.receiptStatus) === 'Attached');

  // Compute blockers based on current edits
  const mergedTransaction = { ...t, ...edits };
  const blockers = getTransactionBlockers(mergedTransaction);
  const primaryBlocker = blockers[0];

  return (
    <div>
      {/* ─── Guided Fix Banner ─── */}
      {primaryBlocker && (
        <div className="mb-5 px-4 py-3.5 rounded-lg border-2 border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-amber-900 mb-1">Action required</div>
              <div className="text-sm text-amber-800 mb-2">{primaryBlocker.message}</div>
              <div className="text-xs text-amber-700">
                {primaryBlocker.type === 'receipt'
                  ? 'Upload a receipt in the Receipts section below to proceed.'
                  : 'Add project and cost code in the Job Context tab to proceed.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Field Owner (Ramp: avatar + name → arrow) ─── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-sm font-semibold text-stone-600">
          {initials(t.cardholder)}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-semibold text-stone-900">{t.cardholder}</span>
          <ChevronRight size={16} className="text-stone-400" />
        </div>
      </div>

      {/* Category chip (editable) */}
      <div className="flex items-center gap-2 mb-1">
        <div className="inline-flex items-center gap-1.5 bg-stone-100 rounded-lg px-3 py-1.5 text-sm text-stone-700">
          <CreditCard size={14} className="text-stone-500" />
          {t.spendType}
        </div>
        <button className="text-stone-400 hover:text-stone-600"><Edit3 size={14} /></button>
      </div>

      <Divider />

      {/* ─── Supplier (Ramp: circle avatar + name + sub + chips) ─── */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-xs font-semibold text-stone-600 shrink-0 mt-0.5">
          {t.supplier.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold text-stone-900">{t.supplier}</span>
            <ChevronRight size={14} className="text-stone-400" />
          </div>
          <div className="text-xs text-stone-500 uppercase tracking-wide">{t.supplier.toUpperCase()}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-stone-100 rounded-lg px-2.5 py-1 text-xs text-stone-600">
              <HardHat size={12} /> {t.trade}
            </span>
            <span className="inline-flex items-center gap-1 bg-stone-100 rounded-lg px-2.5 py-1 text-xs text-stone-600">
              <MapPin size={12} /> Near jobsite
            </span>
            <button className="text-stone-400 hover:text-stone-600"><Edit3 size={14} /></button>
          </div>
        </div>
      </div>

      <Divider />

      {/* ─── Transaction state + Review status ─── */}
      <div className="mb-2">
        <div className="text-xs text-stone-500 mb-1">Transaction state</div>
        <div className="flex items-center gap-1.5">
          {blockers.length === 0 ? (
            <><Check size={15} className="text-emerald-600" /><span className="text-sm font-medium text-emerald-700">Requirements complete</span></>
          ) : (
            <><Clock size={15} className="text-amber-600" /><span className="text-sm font-medium text-amber-700">Requirements incomplete</span></>
          )}
        </div>
      </div>
      <div className="mb-1">
        <div className="text-xs text-stone-500 mb-1">Review status</div>
        <div className="flex items-center gap-1.5">
          {deriveCardTransactionStatus(mergedTransaction) === 'Approved' || deriveCardTransactionStatus(mergedTransaction) === 'Exported' ? (
            <><Check size={15} className="text-emerald-600" /><span className="text-sm font-medium text-emerald-700">Approved</span></>
          ) : deriveCardTransactionStatus(mergedTransaction) === 'For Approval' ? (
            <><Clock size={15} className="text-blue-600" /><span className="text-sm font-medium text-blue-700">Pending approval</span></>
          ) : (
            <><Clock size={15} className="text-stone-600" /><span className="text-sm font-medium text-stone-800">Pending review</span></>
          )}
        </div>
      </div>

      {/* Approval chain */}
      <div className="border border-stone-200 rounded-lg p-3 mt-3 mb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-stone-700 text-white flex items-center justify-center text-xs font-semibold">1</div>
            <div className="flex items-center -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-stone-400 text-white flex items-center justify-center text-[10px] font-semibold border-2 border-white">O</div>
              <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-semibold border-2 border-white">M</div>
              <div className="w-6 h-6 rounded-full bg-stone-300 text-stone-600 flex items-center justify-center text-[10px] font-semibold border-2 border-white">+3</div>
            </div>
            <span className="text-sm text-stone-700">Manager</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="text-stone-400 hover:text-stone-600"><Trash2 size={14} /></button>
            <button className="text-stone-400 hover:text-stone-600"><GripVertical size={14} /></button>
          </div>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-stone-100">
          <button className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900">
            <Plus size={14} /> <span className="underline">Add approver</span>
          </button>
        </div>
      </div>

      <Divider />

      {/* ─── Submission policy ─── */}
      <div className="mb-1">
        <div className="text-xs text-stone-500 mb-0.5">Submission policy</div>
        <div className="text-sm font-medium text-stone-900">Field Spend</div>
      </div>

      <Divider />

      {/* ─── Receipts section (Ramp: large heading + dashed area) ─── */}
      <SectionTitle right={
        <button className="text-xs text-stone-600 underline hover:text-stone-900 flex items-center gap-1">
          Search for this transaction in Gmail <ExternalLink size={11} />
        </button>
      }>
        Receipts
      </SectionTitle>

      {!receiptUploaded ? (
        <div
          onClick={() => setShowUpload(true)}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            primaryBlocker?.type === 'receipt'
              ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
              : 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
            <Upload size={16} className="text-stone-500" />
            Add receipts
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Receipt size={16} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-emerald-800">receipt_{t.id}.jpg</div>
            <div className="text-xs text-emerald-600">Uploaded May 29, 2024</div>
          </div>
          <button className="text-xs text-emerald-700 underline">View</button>
        </div>
      )}

      {showUpload && (
        <UploadReceiptModal
          onClose={() => setShowUpload(false)}
          onSave={(files) => {
            if (files.length > 0) {
              setReceiptUploaded(true);
              setEdits(prev => ({ ...prev, receiptStatus: 'Attached' }));
              setIsDirty(true);
              // Persist receipt immediately via silent save
              onAction?.('save-silent', '', { receiptStatus: 'Attached' });
            }
          }}
        />
      )}

      <Divider />

      {/* ─── Job Note / Memo (Ramp: large heading + beige textarea) ─── */}
      <SectionTitle>Job Note</SectionTitle>
      <textarea
        value={memo}
        onChange={e => setMemo(e.target.value)}
        placeholder="Add a job note — e.g., emergency material pickup, equipment replacement..."
        rows={3}
        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
      />
      {memo && (
        <div className="border border-stone-200 rounded-lg px-4 py-2.5 mt-2 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <MessageSquare size={14} className="text-stone-500" />
            <span><strong>Recurring?</strong> Add this note to future transactions</span>
          </div>
          <button className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 font-medium">
            Make recurring <Zap size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2: Job Context
   - Project info, cost code, budget progress, merchant location,
     weekend flag, emergency toggle
   ═══════════════════════════════════════════════════════════════ */
function JobContextContent({ t, edits, setEdits, isDirty, setIsDirty }) {
  const [isEmergency, setIsEmergency] = useState(false);
  const proj = projects.find(p => p.id === (edits.projectId || t.projectId));
  const pctUsed = proj ? (proj.spent / proj.budget) * 100 : 0;
  const budgetRemaining = proj ? proj.budget - proj.spent : 0;
  const isWeekend = [0, 6].includes(new Date(t.date).getDay());

  // Check if there's a coding blocker
  const mergedTransaction = { ...t, ...edits };
  const blockers = getTransactionBlockers(mergedTransaction);
  const hasCodingBlocker = blockers.some(b => b.type === 'coding');

  function handleProjectChange(e) {
    const selectedProject = projects.find(p => p.name === e.target.value);
    if (selectedProject) {
      setEdits(prev => ({ ...prev, projectId: selectedProject.id, project: selectedProject.name, projectCode: selectedProject.code }));
      setIsDirty(true);
    }
  }

  function handleCostCodeChange(e) {
    setEdits(prev => ({ ...prev, costCode: e.target.value }));
    setIsDirty(true);
  }

  return (
    <div>
      {/* Project Coding Section - highlighted if missing */}
      <div className={hasCodingBlocker ? 'p-4 -m-4 rounded-lg border-2 border-amber-300 bg-amber-50/30 mb-4' : ''}>
        <SectionTitle>Project</SectionTitle>

      {/* Editable Project Dropdown */}
      <div className="bg-stone-50 rounded-lg px-4 py-3 mb-2">
        <div className="text-xs text-stone-500 mb-1">Project</div>
        <select
          value={edits.project || t.project || ''}
          onChange={handleProjectChange}
          className="w-full bg-transparent border-none text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 rounded"
        >
          <option value="">Select project...</option>
          {projects.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
        {proj?.code && <div className="text-xs text-stone-500 mt-0.5">{proj.code}</div>}
      </div>

      <FieldCard label="Project Code" value={edits.projectCode || t.projectCode || '—'} verified={!!(edits.projectCode || t.projectCode)} />

      {/* Editable Cost Code Input */}
      <div className="bg-stone-50 rounded-lg px-4 py-3 mb-2">
        <div className="text-xs text-stone-500 mb-1">Cost Code</div>
        <input
          type="text"
          value={edits.costCode || t.costCode || ''}
          onChange={handleCostCodeChange}
          placeholder="Enter cost code..."
          className="w-full bg-transparent border-none text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 rounded px-0"
        />
      </div>

      <FieldCard label="Job Phase / Trade" value={t.trade} verified />
      </div>

      {/* Budget mini progress */}
      {proj && (
        <div className="bg-stone-50 rounded-lg px-4 py-3 mt-2 border border-stone-200">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-xs text-stone-500">Project budget</div>
            <div className="text-xs text-stone-500">{pctUsed.toFixed(0)}% used</div>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all ${pctUsed > 90 ? 'bg-red-500' : pctUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(pctUsed, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-600">{fmt(proj.spent)} spent</span>
            <span className={`font-medium ${budgetRemaining < 0 ? 'text-red-600' : 'text-stone-800'}`}>
              {fmt(budgetRemaining)} remaining
            </span>
          </div>
        </div>
      )}

      <Divider />

      {/* Merchant location */}
      <SectionTitle>Merchant Location</SectionTitle>
      <div className="bg-stone-50 rounded-lg p-4 border border-stone-200 flex items-center gap-3">
        <div className="w-10 h-10 bg-stone-200 rounded-lg flex items-center justify-center">
          <MapPin size={18} className="text-stone-500" />
        </div>
        <div>
          <div className="text-sm font-medium text-stone-800">{t.supplier}</div>
          <div className="text-xs text-stone-500">Estimated location near jobsite</div>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-lg px-2.5 py-1 text-xs font-medium border border-emerald-200">
            <Check size={12} /> Near jobsite
          </span>
        </div>
      </div>

      <Divider />

      {/* Contextual flags */}
      <SectionTitle>Contextual Flags</SectionTitle>
      <div className="space-y-2.5">
        {/* Weekend flag */}
        <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
          isWeekend ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <Calendar size={16} className={isWeekend ? 'text-amber-600' : 'text-stone-500'} />
            <div>
              <div className="text-sm font-medium text-stone-800">Weekend transaction</div>
              <div className="text-xs text-stone-500">
                {isWeekend ? 'This transaction occurred on a weekend' : 'Weekday transaction — no flag'}
              </div>
            </div>
          </div>
          {isWeekend && (
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Flagged</span>
          )}
        </div>

        {/* Emergency toggle */}
        <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
          isEmergency ? 'bg-red-50 border-red-200' : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <Zap size={16} className={isEmergency ? 'text-red-600' : 'text-stone-500'} />
            <div>
              <div className="text-sm font-medium text-stone-800">Emergency purchase</div>
              <div className="text-xs text-stone-500">Mark if this was an unplanned emergency spend</div>
            </div>
          </div>
          <button
            onClick={() => setIsEmergency(!isEmergency)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isEmergency ? 'bg-red-500' : 'bg-stone-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEmergency ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3: Accounting
   - Export readiness, category mapping, split transaction,
     enforcement rules, accounting date
   ═══════════════════════════════════════════════════════════════ */
function AccountingContent({ t }) {
  const isExportReady = t.policyStatus === 'OK' && t.receiptStatus === 'Attached' && t.projectCode && t.costCode;

  return (
    <div>
      <SectionTitle right={
        <button className="flex items-center gap-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50">
          <ArrowUpRight size={14} /> Split
        </button>
      }>
        Accounting
      </SectionTitle>

      {/* Export readiness */}
      <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border mb-4 ${
        isExportReady ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
      }`}>
        {isExportReady
          ? <><Check size={14} className="text-emerald-600" /><span className="text-xs font-medium text-emerald-700">Ready to export</span></>
          : <><AlertTriangle size={14} className="text-amber-600" /><span className="text-xs font-medium text-amber-700">Blocked — missing required fields</span></>
        }
      </div>

      {/* Stacked beige field cards with mapping arrows */}
      <FieldCard
        label="Trade / Spend Type"
        value={t.spendType}
        verified
        rightLabel="Accounting Category"
        rightValue="Accounting Category"
        rightVerified
      />
      <FieldCard label="Project" value={t.project} verified />
      <FieldCard label="Cost Code" value={t.costCode || 'Missing — required'} verified={!!t.costCode} />
      <FieldCard
        label="Supplier"
        value={t.supplier}
        verified
        rightLabel="Accounting Vendor"
        rightValue="Accounting Vendor"
        rightVerified
      />
      <FieldCard
        label="Accounting date"
        value={new Date(t.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
        verified
      />
      <div className="text-xs text-stone-500 mt-1 mb-2">Edit the accounting date for this specific transaction.</div>

      <Divider />

      {/* Enforcement rules */}
      <SectionTitle>Enforcement</SectionTitle>
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-stone-50 border border-stone-200">
          {t.projectCode ? (
            <Check size={14} className="text-emerald-600" />
          ) : (
            <AlertTriangle size={14} className="text-amber-600" />
          )}
          <span className="text-sm text-stone-700">Project assignment</span>
          <span className={`ml-auto text-xs font-medium ${t.projectCode ? 'text-emerald-600' : 'text-amber-600'}`}>
            {t.projectCode ? 'Complete' : 'Missing'}
          </span>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-stone-50 border border-stone-200">
          {t.costCode ? (
            <Check size={14} className="text-emerald-600" />
          ) : (
            <AlertTriangle size={14} className="text-amber-600" />
          )}
          <span className="text-sm text-stone-700">Cost code</span>
          <span className={`ml-auto text-xs font-medium ${t.costCode ? 'text-emerald-600' : 'text-amber-600'}`}>
            {t.costCode ? 'Complete' : 'Missing'}
          </span>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-stone-50 border border-stone-200">
          {t.receiptStatus === 'Attached' ? (
            <Check size={14} className="text-emerald-600" />
          ) : (
            <AlertTriangle size={14} className="text-amber-600" />
          )}
          <span className="text-sm text-stone-700">Receipt</span>
          <span className={`ml-auto text-xs font-medium ${t.receiptStatus === 'Attached' ? 'text-emerald-600' : 'text-amber-600'}`}>
            {t.receiptStatus === 'Attached' ? 'Attached' : 'Missing'}
          </span>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-stone-50 border border-stone-200">
          {t.policyStatus === 'OK' ? (
            <Check size={14} className="text-emerald-600" />
          ) : (
            <Ban size={14} className="text-red-500" />
          )}
          <span className="text-sm text-stone-700">Policy compliance</span>
          <span className={`ml-auto text-xs font-medium ${t.policyStatus === 'OK' ? 'text-emerald-600' : 'text-red-600'}`}>
            {t.policyStatus === 'OK' ? 'OK' : t.policyStatus}
          </span>
        </div>
      </div>

      <div className="text-xs text-stone-500 flex items-start gap-1.5 mt-4">
        <Lock size={11} className="shrink-0 mt-0.5" />
        Project + cost code required before export. Receipt required by policy.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4: Activity
   - Timeline of all actions on this transaction
   ═══════════════════════════════════════════════════════════════ */
function ActivityContent({ t }) {
  const activities = [
    { time: 'May 29, 2024 · 2:34 PM', who: t.cardholder, action: 'Transaction created', icon: CreditCard },
    ...(t.receiptStatus === 'Attached' ? [{ time: 'May 29, 2024 · 3:12 PM', who: t.cardholder, action: 'Receipt uploaded', icon: Upload }] : []),
    ...(t.memo ? [{ time: 'May 29, 2024 · 3:15 PM', who: t.cardholder, action: `Job note added: "${t.memo}"`, icon: MessageSquare }] : []),
    ...(t.trade ? [{ time: 'May 29, 2024 · 3:16 PM', who: 'System', action: `Job phase auto-assigned: ${t.trade}`, icon: HardHat }] : []),
    ...(t.approvalStatus === 'Approved' ? [{ time: 'May 29, 2024 · 4:00 PM', who: 'David Wallace', action: 'Approved', icon: Check }] : []),
    ...(t.policyStatus === 'Over Limit' ? [{ time: 'May 29, 2024 · 3:20 PM', who: 'System', action: 'Policy violation flagged: Over card limit', icon: Flag }] : []),
  ];

  return (
    <div>
      <SectionTitle>Activity Log</SectionTitle>
      <div className="relative">
        {activities.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="flex gap-3 pb-5 last:pb-0 relative">
              {i < activities.length - 1 && (
                <div className="absolute left-[15px] top-9 bottom-0 w-px bg-stone-200" />
              )}
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 z-10">
                <Icon size={14} className="text-stone-500" />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="text-sm text-stone-900">{a.action}</div>
                <div className="text-xs text-stone-500">{a.who} · {a.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Drawer — 4 tabs
   ═══════════════════════════════════════════════════════════════ */
const DRAWER_TABS = ['Overview', 'Job Context', 'Activity'];

export default function TransactionDrawer({ transaction, onClose, onAction }) {
  const t = transaction;
  if (!t) return null;

  // Auto-open on the right tab based on status
  const initialStatus = deriveCardTransactionStatus(t);
  const initialTab = initialStatus === 'Missing Project Code' ? 'Job Context' : 'Overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Editable state management
  const [edits, setEdits] = useState({
    projectId: t.projectId || '',
    project: t.project || '',
    projectCode: t.projectCode || '',
    costCode: t.costCode || '',
    receiptStatus: t.receiptStatus || 'Missing',
  });
  const [isDirty, setIsDirty] = useState(false);

  // Compute current status based on edits
  const mergedTransaction = { ...t, ...edits };
  const derivedStatus = deriveCardTransactionStatus(mergedTransaction);
  const blockers = getTransactionBlockers(mergedTransaction);

  // Show request-changes modal
  const [showRequestChanges, setShowRequestChanges] = useState(false);
  // Track if user just saved (for Submit for Approval CTA)
  const [justSaved, setJustSaved] = useState(false);

  function handleAction(type, message, extraData) {
    onAction?.(type, message, extraData);
  }

  function handleSave() {
    // Save changes and trigger recalculation
    const updatedFields = {
      projectId: edits.projectId,
      project: edits.project,
      projectCode: edits.projectCode,
      costCode: edits.costCode,
      receiptStatus: edits.receiptStatus,
    };

    handleAction('save', 'Changes saved successfully', updatedFields);
    setIsDirty(false);

    // Check if blockers are now resolved after save
    const savedTransaction = { ...t, ...updatedFields };
    const savedBlockers = getTransactionBlockers(savedTransaction);
    if (savedBlockers.length === 0 && savedTransaction.approvalStatus !== 'Approved' && savedTransaction.approvalStatus !== 'APPROVED') {
      // Show "Submit for approval" CTA instead of closing
      setJustSaved(true);
    } else {
      onClose();
    }
  }

  function handleSubmitForApproval() {
    handleAction('submit-for-approval', `Submitted for approval: ${t.supplier} — ${fmt(t.amount)}`, {
      approvalStatus: 'PENDING',
    });
    setJustSaved(false);
    onClose();
  }

  function handleCancel() {
    // Revert changes
    setEdits({
      projectId: t.projectId || '',
      project: t.project || '',
      projectCode: t.projectCode || '',
      costCode: t.costCode || '',
      receiptStatus: t.receiptStatus || 'Missing',
    });
    setIsDirty(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/10 z-40 transition-opacity" onClick={onClose} />
      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-2xl border-l border-stone-200 z-50 flex flex-col"
        style={{ animation: 'slideIn 0.2s ease-out' }}
      >
        {/* ─── Header ─── */}
        <div className="px-6 pt-5 pb-4 shrink-0">
          {/* Top row: Back + Close */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900">
              <ArrowLeft size={15} /> Back
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600">
              <X size={18} />
            </button>
          </div>
          {/* Amount */}
          <div className="text-4xl font-semibold text-stone-900 tracking-tight">{fmt(t.amount)} USD</div>
          {/* Status + date */}
          <div className="flex items-center gap-2 mt-1.5 text-sm text-stone-500">
            <StatusBadge status={derivedStatus} />
            <span>·</span>
            <span>{fmtDate(t.date)} at 2:34 PM</span>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="border-b border-stone-200 px-6 shrink-0">
          <nav className="flex gap-0 -mb-px">
            {DRAWER_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-1 py-2.5 mr-5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* ─── Scrollable content ─── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'Overview' && <OverviewContent t={t} onAction={handleAction} edits={edits} setEdits={setEdits} isDirty={isDirty} setIsDirty={setIsDirty} />}
          {activeTab === 'Job Context' && <JobContextContent t={t} edits={edits} setEdits={setEdits} isDirty={isDirty} setIsDirty={setIsDirty} />}
          {activeTab === 'Activity' && <ActivityContent t={t} />}
        </div>

        {/* ─── Dynamic footer ─── */}
        <div className="border-t border-stone-200 px-6 py-3 bg-white flex items-center justify-center gap-3 shrink-0">
          {isDirty ? (
            // Sticky Save / Cancel footer when edits are pending
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 text-sm bg-stone-900 text-white rounded-lg px-5 py-2.5 hover:bg-stone-800 font-medium"
              >
                <Check size={14} /> Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-5 py-2.5 hover:bg-stone-50 font-medium"
              >
                Cancel
              </button>
            </>
          ) : justSaved ? (
            // After save, if all blockers resolved → show Submit for Approval CTA
            <>
              <button
                onClick={handleSubmitForApproval}
                className="flex items-center gap-2 text-sm bg-blue-600 text-white rounded-lg px-5 py-2.5 hover:bg-blue-700 font-medium"
              >
                <Send size={14} /> Submit for approval
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-5 py-2.5 hover:bg-stone-50 font-medium"
              >
                Close
              </button>
            </>
          ) : (
            // Action buttons based on derived status
            <>
              {derivedStatus === 'For Approval' && (
                <>
                  <button
                    onClick={() => handleAction('approve', `Transaction ${t.supplier} — ${fmt(t.amount)} approved`, { approvalStatus: 'Approved' })}
                    className="flex items-center gap-2 text-sm bg-emerald-600 text-white rounded-lg px-5 py-2.5 hover:bg-emerald-700 font-medium"
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction('reject', `Transaction ${t.supplier} rejected`, { approvalStatus: 'Rejected' })}
                    className="flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-5 py-2.5 hover:bg-stone-50 font-medium"
                  >
                    <Ban size={14} /> Reject
                  </button>
                  <button
                    onClick={() => setShowRequestChanges(true)}
                    className="flex items-center gap-2 text-sm text-amber-700 border border-amber-200 rounded-lg px-5 py-2.5 hover:bg-amber-50 font-medium"
                  >
                    <RotateCcw size={14} /> Request changes
                  </button>
                </>
              )}
              {derivedStatus === 'Missing Receipt' && (
                <>
                  <button
                    onClick={() => setActiveTab('Overview')}
                    className="flex items-center gap-2 text-sm bg-amber-600 text-white rounded-lg px-5 py-2.5 hover:bg-amber-700 font-medium"
                  >
                    <Edit3 size={14} /> Edit — Upload receipt
                  </button>
                </>
              )}
              {derivedStatus === 'Missing Project Code' && (
                <>
                  <button
                    onClick={() => setActiveTab('Job Context')}
                    className="flex items-center gap-2 text-sm bg-amber-600 text-white rounded-lg px-5 py-2.5 hover:bg-amber-700 font-medium"
                  >
                    <Edit3 size={14} /> Edit — Add project code
                  </button>
                </>
              )}
              {derivedStatus === 'Approved' && (
                <>
                  <button
                    onClick={() => handleAction('export', `Transaction ${t.supplier} exported to accounting`, { exportedAt: new Date().toISOString() })}
                    className="flex items-center gap-2 text-sm bg-stone-900 text-white rounded-lg px-5 py-2.5 hover:bg-stone-800 font-medium"
                  >
                    <ArrowUpRight size={14} /> Export
                  </button>
                  <button
                    onClick={() => handleAction('flag', `Transaction ${t.supplier} flagged`)}
                    className="flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-5 py-2.5 hover:bg-stone-50 font-medium"
                  >
                    <Flag size={14} /> Flag
                  </button>
                  <button
                    onClick={() => handleAction('reject', `Transaction ${t.supplier} disputed`, { approvalStatus: 'Disputed' })}
                    className="flex items-center gap-2 text-sm text-red-600 border border-red-200 rounded-lg px-5 py-2.5 hover:bg-red-50 font-medium"
                  >
                    <AlertTriangle size={14} /> Dispute
                  </button>
                  <button
                    onClick={() => handleAction('approve', `Summary downloaded for ${t.supplier}`)}
                    className="flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-5 py-2.5 hover:bg-stone-50 font-medium"
                  >
                    <FileText size={14} /> Download
                  </button>
                </>
              )}
              {derivedStatus === 'Rejected' && (
                <div className="text-sm text-red-600 flex items-center gap-2">
                  <Ban size={14} />
                  Transaction rejected
                </div>
              )}
              {derivedStatus === 'Exported' && (
                <div className="text-sm text-stone-500 flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" />
                  Transaction exported on {new Date(t.exportedAt).toLocaleDateString()}
                </div>
              )}
            </>
          )}
        </div>

        {/* Request Changes Modal */}
        {showRequestChanges && (
          <RequestChangesModal
            onClose={() => setShowRequestChanges(false)}
            onSubmit={(changeType, reason) => {
              handleAction('request-changes', `Changes requested for ${t.supplier}: ${changeType}`, {
                changeRequestType: changeType,
                changeRequestReason: reason,
              });
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
