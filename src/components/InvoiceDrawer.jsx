import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, ArrowLeft, Check, Clock, AlertTriangle, Calendar, DollarSign,
  FileText, Upload, Download, Send, Shield, Lock, Flag,
  MessageSquare, HardHat, CreditCard, Banknote, Receipt,
  ChevronRight, Edit3, Plus, Users, CheckCircle2, FileWarning,
  ExternalLink, Ban, Percent, Save,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { projects, costCodes } from '../data/mockData';

/* ─── Helpers ─── */
function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}
function fmtDate(d) {
  // Parse the date string as local date to avoid timezone issues
  const [year, month, day] = d.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function fmtShort(d) {
  // Parse the date string as local date to avoid timezone issues
  const [year, month, day] = d.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase();
}

/* ─── Shared UI Atoms ─── */
function FieldCard({ label, value, verified, sub, icon: Icon }) {
  return (
    <div className="bg-stone-50 rounded-lg px-4 py-3 mb-2">
      <div className="text-xs text-stone-500 mb-0.5">{label}</div>
      <div className="flex items-center gap-1.5">
        {verified && <Check size={14} className="text-emerald-500" />}
        {Icon && <Icon size={14} className="text-stone-500" />}
        <span className="text-sm text-stone-800">{value}</span>
      </div>
      {sub && <div className="text-xs text-stone-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function EditableFieldCard({ label, value, onChange, icon: Icon, suffix, type = 'text' }) {
  return (
    <div className="bg-stone-50 rounded-lg px-4 py-3 mb-2 border border-stone-200">
      <div className="text-xs text-stone-500 mb-1">{label}</div>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-stone-500" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 text-sm text-stone-800 bg-transparent border-none outline-none focus:ring-0 p-0"
        />
        {suffix && <span className="text-xs text-stone-500">{suffix}</span>}
      </div>
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mt-6 mb-3">
      <h3 className="text-lg font-semibold text-stone-900 tracking-tight">{children}</h3>
      {right}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-stone-200 my-5" />;
}

/* ═══════════════════════════════════════════════════════════════
   Request Changes Modal — for adding commentary when requesting changes
   ═══════════════════════════════════════════════════════════════ */
function RequestChangesModal({ open, onClose, onSubmit, billVendor }) {
  const [comments, setComments] = useState('');

  if (!open) return null;

  function handleSubmit() {
    if (comments.trim()) {
      onSubmit(comments);
      setComments('');
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalSlideUp 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-stone-200 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-semibold text-stone-900">Request Changes</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          <p className="text-sm text-stone-600 mb-4">
            Add comments explaining what changes are needed for this invoice from {billVendor}.
          </p>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="E.g., incorrect amount, missing line items, needs updated cost code..."
            rows={6}
            autoFocus
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!comments.trim()}
            className={`text-sm rounded-lg px-4 py-2 font-medium flex items-center gap-1.5 ${
              comments.trim()
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <MessageSquare size={14} /> Request Changes
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Lien Waiver Warning Modal — warns when approving without waiver
   ═══════════════════════════════════════════════════════════════ */
function LienWaiverWarningModal({ open, onClose, onProceed, billVendor }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalSlideUp 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-600" />
            <h3 className="text-lg font-semibold text-stone-900">Missing Lien Waiver</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          <p className="text-sm text-stone-800 mb-4">
            This invoice from <span className="font-semibold">{billVendor}</span> requires a lien waiver, but none has been attached yet.
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="text-sm font-semibold text-orange-900 mb-2">⚠️ Implications of approving without lien waiver:</div>
            <ul className="text-sm text-orange-800 space-y-1.5 ml-4 list-disc">
              <li>Your company may face legal liability for unpaid subcontractor claims</li>
              <li>The property could have liens placed against it by unpaid parties</li>
              <li>You may be required to pay twice if the vendor doesn't pay their subs</li>
              <li>This violates standard construction payment best practices</li>
            </ul>
          </div>

          <p className="text-sm text-stone-600">
            <span className="font-semibold">Recommended action:</span> Request the lien waiver from the vendor before approving this invoice for payment.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium">
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="text-sm bg-orange-600 text-white rounded-lg px-4 py-2 hover:bg-orange-700 font-medium flex items-center gap-1.5"
          >
            <Check size={14} /> Approve anyway
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Schedule Payment Modal — for selecting payment date
   ═══════════════════════════════════════════════════════════════ */
function SchedulePaymentModal({ open, onClose, onSubmit, billVendor }) {
  const [paymentDate, setPaymentDate] = useState('');

  // Set default to 7 days from now when modal opens
  useEffect(() => {
    if (open) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      setPaymentDate(futureDate.toISOString().split('T')[0]);
    }
  }, [open]);

  if (!open) return null;

  function handleSubmit() {
    if (paymentDate) {
      onSubmit(paymentDate);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalSlideUp 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-stone-200 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-semibold text-stone-900">Schedule Payment</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          <p className="text-sm text-stone-600 mb-4">
            Select the date you'd like to schedule payment for <span className="font-semibold">{billVendor}</span>.
          </p>
          <div className="bg-stone-50 rounded-lg px-4 py-3 border border-stone-200">
            <label className="text-xs text-stone-500 mb-2 block">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              autoFocus
              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!paymentDate}
            className={`text-sm rounded-lg px-4 py-2 font-medium flex items-center gap-1.5 ${
              paymentDate
                ? 'bg-stone-900 text-white hover:bg-stone-800'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Calendar size={14} /> Schedule Payment
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Upload Modal — used for receipts, lien waivers, attachments
   ═══════════════════════════════════════════════════════════════ */
function UploadModal({ open, onClose, title, onSubmit, uploadType }) {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  if (!open) return null;

  function handleFiles(fileList) {
    const newFiles = Array.from(fileList).map(f => ({
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      type: f.type,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit() {
    onSubmit(files, uploadType);
    setFiles([]);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[440px] max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalSlideUp 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-stone-200 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-semibold text-stone-900">{title || 'Upload File'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-stone-900 bg-stone-50' : 'border-stone-300 hover:border-stone-400'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={24} className="text-stone-400 mx-auto mb-2" />
            <div className="text-sm text-stone-700 font-medium">Drop files here or click to browse</div>
            <div className="text-xs text-stone-400 mt-1">PDF, JPG, PNG up to 25MB</div>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
          />

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5">
                  <FileText size={16} className="text-stone-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-stone-800 truncate">{f.name}</div>
                    <div className="text-xs text-stone-400">{f.size}</div>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-stone-400 hover:text-red-500 shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={files.length === 0}
            className={`text-sm rounded-lg px-4 py-2 font-medium flex items-center gap-1.5 ${
              files.length > 0
                ? 'bg-stone-900 text-white hover:bg-stone-800'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Upload size={14} /> Submit {files.length > 0 && `(${files.length})`}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1: Overview
   ═══════════════════════════════════════════════════════════════ */
function OverviewTab({ bill, onOpenUpload, edits, onEdit, onAction }) {
  const proj = projects.find(p => p.id === bill.projectId);
  const costCode = costCodes.find(c => c.code === bill.costCode);
  const isOverdue = new Date(bill.dueDate) < new Date() && bill.status !== 'Paid';
  const pctUsed = proj ? (proj.spent / proj.budget) * 100 : 0;
  const budgetRemaining = proj ? proj.budget - proj.spent : 0;

  return (
    <div>
      {/* Warning banners */}
      {bill.status === 'Changes Requested' && (
        <>
          <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border border-orange-200 bg-orange-50 text-xs text-orange-800 mb-2">
            <MessageSquare size={14} className="shrink-0 mt-0.5" /> Changes requested — please review comments and make necessary updates
          </div>
          {bill.changeRequestComments && (
            <div className="bg-white border border-orange-200 rounded-lg p-4 mb-4">
              <div className="text-xs font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
                <MessageSquare size={12} className="text-orange-600" /> Requested Changes
              </div>
              <div className="text-sm text-stone-800 whitespace-pre-wrap">{bill.changeRequestComments}</div>
            </div>
          )}
        </>
      )}
      {isOverdue && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border border-red-200 bg-red-50 text-xs text-red-800 mb-4">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" /> This invoice is overdue — payment was due {fmtShort(bill.dueDate)}
        </div>
      )}
      {bill.lienWaiverRequired && !bill.lienWaiverAttached && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border border-orange-200 bg-orange-50 text-xs text-orange-800 mb-4">
          <FileWarning size={14} className="shrink-0 mt-0.5" /> Missing lien waiver — payment blocked until waiver is received
        </div>
      )}

      {/* Vendor */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center text-sm font-semibold text-white">
          {initials(bill.vendor)}
        </div>
        <div>
          <div className="text-lg font-semibold text-stone-900">{bill.vendor}</div>
          <div className="text-xs text-stone-500">Subcontractor · {bill.paymentMethod}</div>
        </div>
      </div>

      {/* Invoice details */}
      <SectionTitle>Invoice Details</SectionTitle>
      <FieldCard label="Invoice Number" value={bill.invoiceNumber} icon={FileText} verified />
      <EditableFieldCard
        label="Invoice Date"
        value={edits.invoiceDate}
        onChange={v => onEdit('invoiceDate', v)}
        icon={Calendar}
        type="date"
      />
      <EditableFieldCard
        label="Due Date"
        value={edits.dueDate}
        onChange={v => onEdit('dueDate', v)}
        icon={Calendar}
        type="date"
      />
      <EditableFieldCard
        label="Amount"
        value={edits.amount}
        onChange={v => onEdit('amount', v)}
        icon={DollarSign}
        type="number"
        suffix="USD"
      />
      <EditableFieldCard
        label="Payment Method"
        value={edits.paymentMethod}
        onChange={v => onEdit('paymentMethod', v)}
        icon={CreditCard}
      />

      <Divider />

      {/* Project assignment */}
      <SectionTitle>Project Assignment</SectionTitle>
      <EditableFieldCard label="Project" value={edits.project} onChange={v => onEdit('project', v)} />
      <EditableFieldCard label="Cost Code" value={edits.costCode} onChange={v => onEdit('costCode', v)} />
      <EditableFieldCard label="Owner" value={edits.owner} onChange={v => onEdit('owner', v)} />

      {/* Budget progress */}
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

      {/* Invoice attachment */}
      <SectionTitle>Invoice Attachment</SectionTitle>
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-stone-200 rounded-lg flex items-center justify-center">
          <FileText size={16} className="text-stone-500" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-stone-800">{bill.invoiceNumber}.pdf</div>
          <div className="text-xs text-stone-500">Invoice document</div>
        </div>
        <button className="text-xs text-stone-600 underline hover:text-stone-900">View</button>
        <button
          onClick={() => onAction?.('flag', `Removed attachment from ${bill.invoiceNumber}`)}
          className="text-stone-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
          title="Remove attachment"
        >
          <X size={14} />
        </button>
      </div>
      <button
        onClick={() => onOpenUpload('Upload Invoice Attachment')}
        className="w-full border-2 border-dashed border-stone-300 rounded-lg p-4 text-center cursor-pointer hover:border-stone-400 transition-colors"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
          <Upload size={16} className="text-stone-500" />
          Upload additional attachment
        </div>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2: Job Coding
   ═══════════════════════════════════════════════════════════════ */
function JobCodingTab({ bill, edits, onEdit }) {
  const proj = projects.find(p => p.id === bill.projectId);
  const costCode = costCodes.find(c => c.code === bill.costCode);
  const pctUsed = proj ? (proj.spent / proj.budget) * 100 : 0;
  const budgetRemaining = proj ? proj.budget - proj.spent : 0;

  const codeBudget = 250000;
  const codeSpent = 142000 + bill.amount;
  const codeRemaining = codeBudget - codeSpent;
  const codePct = (codeSpent / codeBudget) * 100;

  return (
    <div>
      <SectionTitle>Project & Cost Code</SectionTitle>
      <EditableFieldCard label="Project" value={edits.project} onChange={v => onEdit('project', v)} />
      <EditableFieldCard label="Cost Code" value={edits.costCode} onChange={v => onEdit('costCode', v)} />

      <Divider />

      <SectionTitle>Budget Check — Cost Code {bill.costCode}</SectionTitle>
      <div className="bg-stone-50 rounded-lg px-4 py-3 border border-stone-200 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-xs text-stone-500">Cost code budget</div>
          <div className="text-xs text-stone-500">{codePct.toFixed(0)}% used</div>
        </div>
        <div className="w-full bg-stone-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all ${codePct > 90 ? 'bg-red-500' : codePct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(codePct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-stone-600">{fmt(codeSpent)} spent</span>
          <span className={`font-medium ${codeRemaining < 0 ? 'text-red-600' : 'text-stone-800'}`}>
            {fmt(codeRemaining)} remaining
          </span>
        </div>
      </div>

      <Divider />

      <SectionTitle>Overall Project Budget</SectionTitle>
      {proj && (
        <div className="bg-stone-50 rounded-lg px-4 py-3 border border-stone-200">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-xs text-stone-500">Project: {proj.name}</div>
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

      <SectionTitle>Line Items</SectionTitle>
      <div className="space-y-2">
        <div className="bg-stone-50 rounded-lg px-4 py-3 border border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-sm text-stone-800">{costCode?.name || bill.costCode} — labor & materials</div>
            <div className="text-xs text-stone-500">{bill.costCode}</div>
          </div>
          <span className="text-sm font-medium text-stone-900">{fmt(bill.amount)}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3: Compliance — inline editable retainage
   ═══════════════════════════════════════════════════════════════ */
function ComplianceTab({ bill, onOpenUpload, edits, onEdit, onAction }) {
  const retainagePctVal = edits.retainagePct;
  const retainageAmtVal = edits.retainageWithheld;
  const netPayable = bill.amount - Number(retainageAmtVal);

  return (
    <div>
      {/* Lien waiver status */}
      <SectionTitle>Lien Waiver</SectionTitle>
      {bill.lienWaiverRequired ? (
        <>
          <div className={`flex items-center justify-between px-4 py-3 rounded-lg border mb-3 ${
            bill.lienWaiverAttached ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {bill.lienWaiverAttached ? (
                <CheckCircle2 size={16} className="text-emerald-600" />
              ) : (
                <FileWarning size={16} className="text-orange-600" />
              )}
              <div>
                <div className="text-sm font-medium text-stone-800">
                  {bill.lienWaiverAttached ? 'Lien waiver received' : 'Lien waiver missing'}
                </div>
                <div className="text-xs text-stone-500">
                  {bill.lienWaiverAttached
                    ? 'Waiver on file — payment can proceed'
                    : 'Required before payment can be released'}
                </div>
              </div>
            </div>
            <StatusBadge status={bill.lienWaiverAttached ? 'Received' : 'Missing'} />
          </div>

          {/* Show attached waiver file if present */}
          {bill.lienWaiverAttached && (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-stone-800">Lien-Waiver-{bill.invoiceNumber}.pdf</div>
                <div className="text-xs text-stone-500">Uploaded lien waiver</div>
              </div>
              <button className="text-xs text-stone-600 underline hover:text-stone-900">View</button>
              <button className="text-xs text-emerald-600 underline hover:text-emerald-700">Download</button>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-stone-200 bg-stone-50 mb-3">
          <Shield size={16} className="text-stone-400" />
          <div>
            <div className="text-sm font-medium text-stone-700">Lien waiver not required</div>
            <div className="text-xs text-stone-500">No lien waiver needed for this invoice</div>
          </div>
        </div>
      )}

      {/* Waiver actions inline */}
      {bill.lienWaiverRequired && !bill.lienWaiverAttached && (
        <div className="space-y-2 mb-4">
          <button
            onClick={() => onOpenUpload('Upload Lien Waiver', 'lien-waiver')}
            className="w-full border-2 border-dashed border-orange-300 rounded-lg p-5 text-center cursor-pointer hover:border-orange-400 transition-colors bg-orange-50/30"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
              <Upload size={16} className="text-stone-500" />
              Upload lien waiver
            </div>
            <div className="text-xs text-stone-400 mt-1">PDF, JPG, PNG accepted</div>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onAction('lien-waiver-requested', `Lien waiver requested from ${bill.vendor}`)}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-stone-900 text-white rounded-lg px-3 py-2 hover:bg-stone-800 font-medium"
            >
              <Send size={13} /> Request waiver
            </button>
            <button
              onClick={() => onAction('flag', `Lien waiver reminder sent to ${bill.vendor}`)}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-2 hover:bg-stone-50 font-medium"
            >
              <Clock size={13} /> Send reminder
            </button>
          </div>
        </div>
      )}

      <Divider />

      {/* Retainage — inline editable */}
      <SectionTitle>Retainage</SectionTitle>
      <EditableFieldCard
        label="Retainage %"
        value={retainagePctVal}
        onChange={v => {
          onEdit('retainagePct', v);
          const pct = parseFloat(v) || 0;
          onEdit('retainageWithheld', ((pct / 100) * bill.amount).toFixed(2));
        }}
        icon={Percent}
        suffix="%"
        type="number"
      />
      <EditableFieldCard
        label="Retainage Withheld"
        value={retainageAmtVal}
        onChange={v => {
          onEdit('retainageWithheld', v);
          const amt = parseFloat(v) || 0;
          onEdit('retainagePct', ((amt / bill.amount) * 100).toFixed(1));
        }}
        icon={DollarSign}
        suffix="USD"
        type="number"
      />
      <FieldCard label="Net Payable" value={fmt(netPayable > 0 ? netPayable : 0)} icon={Banknote} verified />

      {Number(retainageAmtVal) > 0 && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border border-indigo-200 bg-indigo-50 text-xs text-indigo-800 mt-3">
          <Lock size={14} className="shrink-0 mt-0.5" /> Retainage will be held until project completion or milestone release
        </div>
      )}

      {Number(retainageAmtVal) > 0 && bill.status === 'Paid' && (
        <button
          onClick={() => onAction('pay', `Released ${fmt(Number(retainageAmtVal))} retainage for ${bill.vendor}`)}
          className="w-full mt-3 flex items-center justify-center gap-1.5 text-sm text-indigo-700 border border-indigo-300 rounded-lg px-3 py-2.5 hover:bg-indigo-50 font-medium"
        >
          <Lock size={13} /> Release retainage
        </button>
      )}

      <Divider />

      {/* Compliance checklist */}
      <SectionTitle>Compliance Checklist</SectionTitle>
      <div className="space-y-2">
        {[
          { label: 'Insurance certificate', ok: true, text: 'Current' },
          { label: 'W-9 on file', ok: true, text: 'Verified' },
          { label: 'Lien waiver', ok: bill.lienWaiverAttached || !bill.lienWaiverRequired, text: bill.lienWaiverRequired ? (bill.lienWaiverAttached ? 'Received' : 'Missing') : 'N/A' },
          { label: 'Prevailing wage compliance', ok: true, text: 'Compliant' },
          { label: 'Safety documentation', ok: true, text: 'Current' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-stone-50 border border-stone-200">
            {item.ok ? <Check size={14} className="text-emerald-600" /> : <AlertTriangle size={14} className="text-amber-600" />}
            <span className="text-sm text-stone-700">{item.label}</span>
            <span className={`ml-auto text-xs font-medium ${item.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4: Approvals
   ═══════════════════════════════════════════════════════════════ */
function ApprovalsTab({ bill, edits, onEdit, onAction }) {
  const [approvers, setApprovers] = useState(() => [
    {
      id: 'ap1', step: 1, name: bill.owner,
      role: bill.ownerRole === 'PM' ? 'Project Manager' : 'AP Manager',
      status: bill.status === 'Paid' ? 'Approved' : 'Pending',
      timestamp: bill.status === 'Paid' ? 'Jun 12, 2024 · 10:30 AM' : null,
    },
    {
      id: 'ap2', step: 2, name: 'Jan Levinson', role: 'Controller',
      status: bill.status === 'Paid' ? 'Approved' : 'Waiting',
      timestamp: bill.status === 'Paid' ? 'Jun 13, 2024 · 2:15 PM' : null,
    },
  ]);
  const [showAddApprover, setShowAddApprover] = useState(false);
  const [newApproverName, setNewApproverName] = useState('');
  const [newApproverRole, setNewApproverRole] = useState('');

  const handleAddApprover = () => {
    if (!newApproverName.trim()) return;
    setApprovers(prev => [...prev, {
      id: `ap-new-${Date.now()}`,
      step: prev.length + 1,
      name: newApproverName.trim(),
      role: newApproverRole.trim() || 'Approver',
      status: 'Waiting',
      timestamp: null,
    }]);
    setNewApproverName('');
    setNewApproverRole('');
    setShowAddApprover(false);
    // Just show a toast notification without changing status
    onAction?.('flag', `Added ${newApproverName.trim()} as approver on ${bill.invoiceNumber}`);
  };

  const handleRemoveApprover = (id) => {
    const removed = approvers.find(a => a.id === id);
    setApprovers(prev => prev.filter(a => a.id !== id));
    if (removed) onAction?.('flag', `Removed ${removed.name} from approval chain`);
  };

  return (
    <div>
      <SectionTitle>Approval Chain</SectionTitle>
      <div className="relative">
        {approvers.map((a, i) => (
          <div key={a.id} className="flex gap-3 pb-6 last:pb-0 relative">
            {i < approvers.length - 1 && (
              <div className="absolute left-[15px] top-9 bottom-0 w-px bg-stone-200" />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 z-10 ${
              a.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
              a.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
              'bg-stone-100 text-stone-500'
            }`}>
              {a.status === 'Approved' ? <Check size={14} /> : i + 1}
            </div>
            <div className="flex-1 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-stone-900">{a.name}</span>
                <StatusBadge status={a.status} />
              </div>
              <div className="text-xs text-stone-500">{a.role}</div>
              {a.timestamp && <div className="text-xs text-stone-400 mt-0.5">{a.timestamp}</div>}
            </div>
            {a.status !== 'Approved' && (
              <button
                onClick={() => handleRemoveApprover(a.id)}
                className="text-stone-300 hover:text-red-500 transition-colors p-0.5 shrink-0 mt-1"
                title="Remove approver"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {bill.status !== 'Paid' && !showAddApprover && (
        <button
          onClick={() => setShowAddApprover(true)}
          className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 mt-3"
        >
          <Plus size={14} /> <span className="underline">Add approver</span>
        </button>
      )}

      {showAddApprover && (
        <div className="mt-3 border border-stone-200 rounded-xl p-4 bg-stone-50" style={{ animation: 'modalSlideUp 0.15s ease-out' }}>
          <div className="text-xs font-semibold text-stone-700 mb-2">Add Approver</div>
          <input
            type="text"
            placeholder="Name"
            value={newApproverName}
            onChange={e => setNewApproverName(e.target.value)}
            autoFocus
            className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
          <input
            type="text"
            placeholder="Role (e.g. Project Manager)"
            value={newApproverRole}
            onChange={e => setNewApproverRole(e.target.value)}
            className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddApprover}
              disabled={!newApproverName.trim()}
              className={`flex-1 text-sm rounded-lg px-3 py-2 font-medium flex items-center justify-center gap-1.5 ${
                newApproverName.trim()
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Users size={13} /> Add
            </button>
            <button
              onClick={() => { setShowAddApprover(false); setNewApproverName(''); setNewApproverRole(''); }}
              className="text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-2 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Divider />

      <SectionTitle>Notes</SectionTitle>
      <textarea
        value={edits.approvalNote}
        onChange={e => onEdit('approvalNote', e.target.value)}
        placeholder="Add an approval note..."
        rows={3}
        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 5: Payment
   ═══════════════════════════════════════════════════════════════ */
function PaymentTab({ bill, edits, onEdit }) {
  const selectedMethod = edits.paymentMethod;
  const [selectedTerm, setSelectedTerm] = useState(null);
  const netPayable = bill.amount - bill.retainageWithheld;

  const methods = [
    { value: 'ACH', label: 'ACH Transfer', sub: '1-2 business days', icon: Banknote },
    { value: 'Check', label: 'Check', sub: '5-7 business days', icon: FileText },
    { value: 'Card', label: 'Virtual Card', sub: 'Instant', icon: CreditCard },
  ];

  const flexTerms = [
    { days: 30, fee: 0.9 },
    { days: 60, fee: 1.7 },
    { days: 90, fee: 2.4 },
  ];

  return (
    <div>
      <SectionTitle>Payment Summary</SectionTitle>
      <FieldCard label="Invoice Amount" value={fmt(bill.amount)} icon={DollarSign} />
      <FieldCard label="Retainage Withheld" value={`- ${fmt(bill.retainageWithheld)}`} icon={Lock} />
      <div className="bg-emerald-50 rounded-lg px-4 py-3 mb-2 border border-emerald-200">
        <div className="text-xs text-emerald-600 mb-0.5">Net Payable</div>
        <div className="text-lg font-semibold text-emerald-800">{fmt(netPayable)}</div>
      </div>

      <Divider />

      <SectionTitle>Payment Method</SectionTitle>
      <div className="space-y-2">
        {methods.map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.value}
              onClick={() => onEdit('paymentMethod', m.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left ${
                selectedMethod === m.value ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <Icon size={16} className={selectedMethod === m.value ? 'text-stone-900' : 'text-stone-400'} />
              <div className="flex-1">
                <div className="text-sm font-medium text-stone-800">{m.label}</div>
                <div className="text-xs text-stone-500">{m.sub}</div>
              </div>
              {selectedMethod === m.value && <Check size={16} className="text-stone-900" />}
            </button>
          );
        })}
      </div>

      <Divider />

      <SectionTitle right={
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Ramp Flex</span>
      }>
        Extend Payment Terms
      </SectionTitle>
      <p className="text-xs text-stone-500 mb-3">Pay your vendor now, repay Ramp later. Preserve cash flow for active projects.</p>
      <div className="space-y-2">
        {flexTerms.map(t => (
          <button
            key={t.days}
            onClick={() => setSelectedTerm(selectedTerm === t.days ? null : t.days)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
              selectedTerm === t.days ? 'border-indigo-400 bg-indigo-50' : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <div>
              <div className="text-sm font-medium text-stone-800">Flex {t.days}</div>
              <div className="text-xs text-stone-500">{t.fee}% fee · {fmt(netPayable * t.fee / 100)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-stone-800">Repay in {t.days} days</div>
              {selectedTerm === t.days && <Check size={14} className="text-indigo-600 ml-auto mt-0.5" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 6: Activity
   ═══════════════════════════════════════════════════════════════ */
function ActivityTab({ bill }) {
  const activities = [
    { time: `${fmtShort(bill.invoiceDate)} · 9:00 AM`, who: 'System', action: 'Invoice received', icon: FileText },
    { time: `${fmtShort(bill.invoiceDate)} · 9:01 AM`, who: 'System', action: `Auto-coded to ${bill.costCode} · ${bill.project}`, icon: HardHat },
    { time: `${fmtShort(bill.invoiceDate)} · 9:02 AM`, who: 'System', action: `Assigned to ${bill.owner} (${bill.ownerRole})`, icon: Users },
    ...(bill.status !== 'Draft' ? [
      { time: `${fmtShort(bill.invoiceDate)} · 10:00 AM`, who: bill.owner, action: 'Submitted for approval', icon: Send },
    ] : []),
    ...(bill.lienWaiverRequired && !bill.lienWaiverAttached ? [
      { time: `${fmtShort(bill.invoiceDate)} · 10:01 AM`, who: 'System', action: 'Lien waiver request sent to vendor', icon: FileWarning },
    ] : []),
    ...(bill.lienWaiverAttached ? [
      { time: `${fmtShort(bill.dueDate)} · 11:00 AM`, who: bill.vendor, action: 'Lien waiver received', icon: CheckCircle2 },
    ] : []),
    ...(bill.status === 'Paid' ? [
      { time: `${fmtShort(bill.dueDate)} · 2:00 PM`, who: 'System', action: `Payment sent via ${bill.paymentMethod} — ${fmt(bill.amount)}`, icon: Banknote },
    ] : []),
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
   Contextual Footer Actions — all actionable
   ═══════════════════════════════════════════════════════════════ */
function DrawerFooter({ bill, activeTab, onAction, isDirty, onSave, onOpenUpload }) {
  // If there are unsaved edits, show Save bar
  if (isDirty) {
    return (
      <div className="flex items-center justify-between w-full">
        <span className="text-xs text-stone-500">You have unsaved changes</span>
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 text-sm bg-stone-900 text-white rounded-lg px-5 py-2 hover:bg-stone-800 font-medium"
        >
          <Save size={14} /> Save changes
        </button>
      </div>
    );
  }

  // Draft
  if (bill.status === 'Draft') {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button onClick={() => onAction('submit-for-approval', `Submitted ${bill.invoiceNumber} for approval`)} className="flex items-center gap-1.5 text-sm bg-stone-900 text-white rounded-lg px-4 py-2 hover:bg-stone-800 font-medium">
          <Send size={13} /> Submit for approval
        </button>
        <button onClick={() => onAction('flag', `Saved draft — ${bill.invoiceNumber}`)} className="flex items-center gap-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium">
          <FileText size={13} /> Save draft
        </button>
      </div>
    );
  }

  // Compliance tab
  if (activeTab === 'compliance') {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {bill.lienWaiverRequired && !bill.lienWaiverAttached && (
          <>
            <button onClick={() => onAction('lien-waiver-requested', `Lien waiver requested from ${bill.vendor}`)} className="flex items-center gap-1.5 text-sm bg-stone-900 text-white rounded-lg px-3 py-2 hover:bg-stone-800 font-medium">
              <Send size={13} /> Request waiver
            </button>
            <button onClick={() => onOpenUpload('Upload Lien Waiver', 'lien-waiver')} className="flex items-center gap-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-2 hover:bg-stone-50 font-medium">
              <Upload size={13} /> Upload
            </button>
          </>
        )}
        {bill.lienWaiverAttached && (
          <button onClick={() => onAction('download-receipt', `Downloaded waiver for ${bill.vendor}`)} className="flex items-center gap-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-2 hover:bg-stone-50 font-medium">
            <Download size={13} /> Download waiver
          </button>
        )}
      </div>
    );
  }

  // For Approval
  if (bill.status === 'For Approval') {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button onClick={() => onAction('approve-check', `Approved invoice ${bill.invoiceNumber} — ${bill.vendor}`)} className="flex items-center gap-1.5 text-sm bg-emerald-600 text-white rounded-lg px-4 py-2 hover:bg-emerald-700 font-medium">
          <Check size={13} /> Approve
        </button>
        {bill.lienWaiverRequired && !bill.lienWaiverAttached && (
          <button onClick={() => onAction('lien-waiver-requested', `Lien waiver requested from ${bill.vendor}`)} className="flex items-center gap-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-2 hover:bg-stone-50 font-medium">
            <Send size={13} /> Request waiver
          </button>
        )}
        <button onClick={() => onAction('request-changes-modal', bill.vendor)} className="flex items-center gap-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-2 hover:bg-stone-50 font-medium">
          <MessageSquare size={13} /> Request changes
        </button>
        <button onClick={() => onAction('reject', `Rejected invoice ${bill.invoiceNumber} — ${bill.vendor}`)} className="flex items-center gap-1.5 text-sm text-red-600 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 font-medium">
          <Ban size={13} /> Reject
        </button>
      </div>
    );
  }

  // Approved (ready for payment)
  if (bill.status === 'Approved') {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button onClick={() => onAction('submit-payment', `Submitted payment for ${bill.invoiceNumber} — ${bill.vendor}`)} className="flex items-center gap-1.5 text-sm bg-emerald-600 text-white rounded-lg px-4 py-2 hover:bg-emerald-700 font-medium">
          <Banknote size={13} /> Submit payment
        </button>
        <button onClick={() => onAction('schedule-payment-modal', `Scheduled payment for ${bill.invoiceNumber} — ${bill.vendor}`)} className="flex items-center gap-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-2 hover:bg-stone-50 font-medium">
          <Calendar size={13} /> Schedule payment
        </button>
      </div>
    );
  }

  // Changes Requested (flagged for changes)
  if (bill.status === 'Changes Requested') {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 text-sm bg-stone-900 text-white rounded-lg px-4 py-2 hover:bg-stone-800 font-medium"
        >
          <Save size={13} /> Save Changes
        </button>
      </div>
    );
  }

  // Missing Lien Waiver
  if (bill.status === 'Missing Lien Waiver') {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button onClick={() => onAction('lien-waiver-requested', `Lien waiver requested from ${bill.vendor}`)} className="flex items-center gap-1.5 text-sm bg-stone-900 text-white rounded-lg px-3 py-2 hover:bg-stone-800 font-medium">
          <Send size={13} /> Request waiver
        </button>
        <button onClick={() => onOpenUpload('Upload Lien Waiver', 'lien-waiver')} className="flex items-center gap-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-2 hover:bg-stone-50 font-medium">
          <Upload size={13} /> Upload
        </button>
      </div>
    );
  }


  // Paid / History
  if (bill.status === 'Paid') {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button onClick={() => onAction('download-receipt', `Downloaded receipt for ${bill.invoiceNumber}`)} className="flex items-center gap-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-2 hover:bg-stone-50 font-medium">
          <Download size={13} /> Download receipt
        </button>
      </div>
    );
  }

  // Late
  if (bill.status === 'Late') {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button onClick={() => onAction('pay', `Paid ${fmt(bill.amount)} to ${bill.vendor} (overdue)`)} className="flex items-center gap-1.5 text-sm bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 font-medium">
          <Banknote size={13} /> Pay now
        </button>
      </div>
    );
  }

  // Rejected
  if (bill.status === 'Rejected') {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button onClick={() => onAction('reopen', `Re-opened ${bill.invoiceNumber} — ${bill.vendor}`)} className="flex items-center gap-1.5 text-sm bg-stone-900 text-white rounded-lg px-4 py-2 hover:bg-stone-800 font-medium">
          <FileText size={13} /> Re-open
        </button>
      </div>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   Main InvoiceDrawer
   ═══════════════════════════════════════════════════════════════ */
const DRAWER_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'jobCoding', label: 'Job Coding' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'payment', label: 'Payment' },
  { key: 'activity', label: 'Activity' },
];

export default function InvoiceDrawer({ bill, onClose, onAction, initialTab, pageTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const drawerRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Upload modal state
  const [uploadModal, setUploadModal] = useState({ open: false, title: '', uploadType: '' });

  // Request changes modal state
  const [requestChangesModal, setRequestChangesModal] = useState({ open: false });

  // Lien waiver warning modal state
  const [lienWaiverWarningModal, setLienWaiverWarningModal] = useState({ open: false });

  // Schedule payment modal state
  const [schedulePaymentModal, setSchedulePaymentModal] = useState({ open: false });

  // Editable fields — initialised from bill
  const [edits, setEdits] = useState({});
  const [savedEdits, setSavedEdits] = useState({});

  // Reset edits when bill changes
  useEffect(() => {
    if (bill) {
      const initial = {
        paymentMethod: bill.paymentMethod,
        owner: `${bill.owner} (${bill.ownerRole})`,
        project: bill.project,
        costCode: `${bill.costCode} · ${(costCodes.find(c => c.code === bill.costCode)?.name) || 'Unknown'}`,
        invoiceDate: bill.invoiceDate,
        dueDate: bill.dueDate,
        amount: bill.amount.toString(),
        retainagePct: bill.amount > 0 ? ((bill.retainageWithheld / bill.amount) * 100).toFixed(1) : '0.0',
        retainageWithheld: bill.retainageWithheld.toString(),
        approvalNote: '',
      };
      setEdits(initial);
      setSavedEdits(initial);
    }
  }, [bill?.id]);

  const handleEdit = useCallback((key, value) => {
    setEdits(prev => ({ ...prev, [key]: value }));
  }, []);

  // Detect dirty state
  const isDirty = JSON.stringify(edits) !== JSON.stringify(savedEdits);

  const handleSave = useCallback(() => {
    setSavedEdits({ ...edits });
    // Handle different save behaviors based on status
    if (bill?.status === 'Changes Requested') {
      // Changes Requested → For Approval
      onAction?.('save-changes', `Saved changes to ${bill?.invoiceNumber}`, edits);
    } else if (bill?.status === 'Draft') {
      // Draft → stays Draft, just saves edits
      onAction?.('save-draft', `Saved draft — ${bill?.invoiceNumber}`, edits);
    } else {
      // All other statuses → Approved
      onAction?.('approve', `Saved changes to ${bill?.invoiceNumber}`, edits);
    }
  }, [edits, bill, onAction]);

  // Handle action from buttons
  const handleAction = useCallback((type, message) => {
    // Special handling for request-changes-modal
    if (type === 'request-changes-modal') {
      setRequestChangesModal({ open: true });
      return;
    }
    // Special handling for approve-check - check if lien waiver is missing
    if (type === 'approve-check') {
      if (bill?.lienWaiverRequired && !bill?.lienWaiverAttached) {
        // Show warning modal
        setLienWaiverWarningModal({ open: true });
        return;
      }
      // No lien waiver issue, proceed with approval
      onAction?.('approve', message);
      return;
    }
    // Special handling for schedule-payment-modal
    if (type === 'schedule-payment-modal') {
      setSchedulePaymentModal({ open: true });
      return;
    }
    onAction?.(type, message);
  }, [onAction, bill]);

  // Upload modal
  const openUpload = useCallback((title, uploadType = '') => {
    setUploadModal({ open: true, title, uploadType });
  }, []);

  const closeUpload = useCallback(() => {
    setUploadModal({ open: false, title: '', uploadType: '' });
  }, []);

  const handleUploadSubmit = useCallback((files, uploadType) => {
    // If uploading lien waiver, mark it as attached
    if (uploadType === 'lien-waiver' && bill?.lienWaiverRequired) {
      onAction?.('lien-waiver-uploaded', `Uploaded lien waiver for ${bill?.invoiceNumber}`);
    } else {
      onAction?.('approve', `Uploaded ${files.length} file${files.length > 1 ? 's' : ''} to ${bill?.invoiceNumber}`);
    }
  }, [bill, onAction]);

  // Request changes modal handlers
  const openRequestChangesModal = useCallback(() => {
    setRequestChangesModal({ open: true });
  }, []);

  const closeRequestChangesModal = useCallback(() => {
    setRequestChangesModal({ open: false });
  }, []);

  const handleRequestChangesSubmit = useCallback((comments) => {
    onAction?.('request-changes', `Requested changes on ${bill?.invoiceNumber}: ${comments}`);
  }, [bill, onAction]);

  // Lien waiver warning modal handlers
  const closeLienWaiverWarningModal = useCallback(() => {
    setLienWaiverWarningModal({ open: false });
  }, []);

  const handleLienWaiverWarningProceed = useCallback(() => {
    // User chose to approve anyway despite missing lien waiver
    setLienWaiverWarningModal({ open: false });
    onAction?.('approve', `Approved invoice ${bill?.invoiceNumber} — ${bill?.vendor} (without lien waiver)`);
  }, [bill, onAction]);

  // Schedule payment modal handlers
  const closeSchedulePaymentModal = useCallback(() => {
    setSchedulePaymentModal({ open: false });
  }, []);

  const handleSchedulePaymentSubmit = useCallback((selectedDate) => {
    setSchedulePaymentModal({ open: false });
    onAction?.('schedule-payment', `Scheduled payment for ${bill?.invoiceNumber} — ${bill?.vendor}`, { paymentDate: selectedDate });
  }, [bill, onAction]);

  // Tab sync
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Focus management
  useEffect(() => {
    if (bill) {
      previousFocusRef.current = document.activeElement;
      if (drawerRef.current) {
        const first = drawerRef.current.querySelector('button, [tabindex]');
        if (first) first.focus();
      }
    }
    return () => {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [bill]);

  // ESC to close
  useEffect(() => {
    if (!bill) return;
    function handleKey(e) {
      if (e.key === 'Escape') {
        if (uploadModal.open) { closeUpload(); return; }
        onClose();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [bill, onClose, uploadModal.open, closeUpload]);

  // Lock body scroll
  useEffect(() => {
    if (bill) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [bill]);

  if (!bill) return null;

  const isOverdue = new Date(bill.dueDate) < new Date() && bill.status !== 'Paid';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/10 z-40 transition-opacity" onClick={onClose} />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-2xl border-l border-stone-200 z-50 flex flex-col"
        style={{ animation: 'drawerSlideIn 0.2s ease-out' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Invoice ${bill.invoiceNumber} — ${bill.vendor}`}
      >
        {/* ─── Sticky Header ─── */}
        <div className="px-6 pt-5 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <button onClick={onClose} className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900">
              <ArrowLeft size={15} /> Back
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600" aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <div className="text-xl font-semibold text-stone-900 tracking-tight">{bill.vendor}</div>
          <div className="text-3xl font-semibold text-stone-900 tracking-tight mt-1">{fmt(bill.amount)} USD</div>
          <div className="flex items-center gap-2 mt-1.5 text-sm text-stone-500 flex-wrap">
            <StatusBadge status={bill.status} />
            {isOverdue && <StatusBadge status="Late" />}
            <span>·</span>
            <span>{bill.project}</span>
            <span>·</span>
            <span className="font-mono text-xs">{bill.costCode}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
            <span>{bill.invoiceNumber}</span>
            <span>·</span>
            <span>Due {fmtShort(bill.dueDate)}</span>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="border-b border-stone-200 px-6 shrink-0">
          <nav className="flex gap-0 -mb-px overflow-x-auto">
            {DRAWER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-1 py-2.5 mr-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ─── Scrollable content ─── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'overview' && <OverviewTab bill={bill} onOpenUpload={openUpload} edits={edits} onEdit={handleEdit} onAction={handleAction} />}
          {activeTab === 'jobCoding' && <JobCodingTab bill={bill} edits={edits} onEdit={handleEdit} />}
          {activeTab === 'compliance' && <ComplianceTab bill={bill} onOpenUpload={openUpload} edits={edits} onEdit={handleEdit} onAction={handleAction} />}
          {activeTab === 'approvals' && <ApprovalsTab bill={bill} edits={edits} onEdit={handleEdit} onAction={handleAction} />}
          {activeTab === 'payment' && <PaymentTab bill={bill} edits={edits} onEdit={handleEdit} />}
          {activeTab === 'activity' && <ActivityTab bill={bill} />}
        </div>

        {/* ─── Sticky Footer ─── */}
        <div className="border-t border-stone-200 px-4 py-3 bg-white shrink-0">
          <DrawerFooter
            bill={bill}
            activeTab={activeTab}
            onAction={handleAction}
            isDirty={isDirty}
            onSave={handleSave}
            onOpenUpload={openUpload}
          />
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        open={uploadModal.open}
        onClose={closeUpload}
        title={uploadModal.title}
        uploadType={uploadModal.uploadType}
        onSubmit={handleUploadSubmit}
      />

      {/* Request Changes Modal */}
      <RequestChangesModal
        open={requestChangesModal.open}
        onClose={closeRequestChangesModal}
        onSubmit={handleRequestChangesSubmit}
        billVendor={bill?.vendor}
      />

      {/* Lien Waiver Warning Modal */}
      <LienWaiverWarningModal
        open={lienWaiverWarningModal.open}
        onClose={closeLienWaiverWarningModal}
        onProceed={handleLienWaiverWarningProceed}
        billVendor={bill?.vendor}
      />

      {/* Schedule Payment Modal */}
      <SchedulePaymentModal
        open={schedulePaymentModal.open}
        onClose={closeSchedulePaymentModal}
        onSubmit={handleSchedulePaymentSubmit}
        billVendor={bill?.vendor}
      />

      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
