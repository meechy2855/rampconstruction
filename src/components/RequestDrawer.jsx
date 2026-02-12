import { useState, useMemo, useRef, useEffect } from 'react';
import {
  X, ArrowLeft, AlertTriangle, Check, Clock,
  Calendar, Shield, Edit3, ChevronRight, Ban,
  HardHat, Lock, Flag, MessageSquare,
  Zap, Trash2, GripVertical, Plus, Search,
  Users, Briefcase, DollarSign, ShieldCheck, Settings,
  User, FileText, CreditCard, Send, Download,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { projects, costCodes, approverDirectory } from '../data/mockData';
import { isPurchaseRequest, isPurchaseOrder, getDisplayId, getDisplayName } from '../utils/procurementTypeGuards';

/* ─── Helpers ─── */
function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function fmtShort(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function fmtTime(d) {
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase();
}

/* ─── Shared UI atoms ─── */
function FieldCard({ label, value, verified, sub }) {
  return (
    <div className="bg-stone-50 rounded-lg px-4 py-3 mb-2">
      <div className="text-xs text-stone-500 mb-0.5">{label}</div>
      <div className="flex items-center gap-1.5">
        {verified && <Check size={14} className="text-stone-500" />}
        <span className="text-sm text-stone-800">{value}</span>
      </div>
      {sub && <div className="text-xs text-stone-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mt-7 mb-3">
      <h2 className="text-xl font-semibold text-stone-900 tracking-tight">{children}</h2>
      {right}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-stone-200 my-5" />;
}

/* ─── Avatar colors by role ─── */
const roleColors = {
  PM: 'bg-blue-600',
  'Project Manager': 'bg-blue-600',
  'Project Executive': 'bg-indigo-600',
  'Site Supervisor': 'bg-amber-600',
  Accounting: 'bg-emerald-600',
  'Accounting Lead': 'bg-emerald-600',
  Controller: 'bg-purple-600',
  Finance: 'bg-purple-600',
  'Purchasing Manager': 'bg-orange-600',
  Admin: 'bg-stone-600',
  Foreman: 'bg-amber-700',
  Supervisor: 'bg-teal-600',
};

function getAvatarColor(role) {
  return roleColors[role] || 'bg-stone-500';
}

/* ─── Group icons ─── */
const groupIcons = {
  'project-owner': User,
  'project-managers': Users,
  'accounting': Briefcase,
  'finance': DollarSign,
  'purchasing': ShieldCheck,
  'admin': Settings,
};

/* ═══════════════════════════════════════════════
   Request Changes Modal (with note)
   ═══════════════════════════════════════════════ */
function RequestChangesModal({ onClose, onSubmit }) {
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!note.trim()) return;
    onSubmit(note);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-stone-200 z-50 w-[480px] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Request Changes</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
              <X size={18} />
            </button>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Provide specific feedback for the requester
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            What changes are needed?
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Please update the cost code to 03-000 and reduce the amount to $15,000..."
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-300"
            rows={6}
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 px-6 py-3 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-700 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!note.trim()}
            className="text-sm px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Edit3 size={14} />
            Request Changes
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   Approver Selector Dropdown
   ═══════════════════════════════════════════════ */
function ApproverSelectorDropdown({ request, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const ref = useRef(null);

  const projectIndividuals = useMemo(() => {
    return approverDirectory.individuals.filter(p =>
      p.projects.includes(request.projectId) &&
      !request.approverChain?.some(a => a.name === p.name)
    );
  }, [request]);

  const filteredIndividuals = useMemo(() => {
    if (!search) return projectIndividuals;
    const q = search.toLowerCase();
    return projectIndividuals.filter(p =>
      p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)
    );
  }, [projectIndividuals, search]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  function togglePerson(person) {
    setSelectedIds(prev =>
      prev.includes(person.id) ? prev.filter(id => id !== person.id) : [...prev, person.id]
    );
  }

  function handleAdd() {
    const people = projectIndividuals.filter(p => selectedIds.includes(p.id));
    onSelect(people);
    onClose();
  }

  function handleGroupSelect(groupId) {
    const groupPeople = projectIndividuals.filter(p => p.group === groupId);
    onSelect(groupPeople);
    onClose();
  }

  return (
    <div ref={ref} className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <div className="px-3 pt-3 pb-2">
        <div className="text-xs font-semibold text-stone-700 mb-2">Select approvers</div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} autoFocus className="w-full pl-8 pr-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300" />
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {!search && (
          <div className="px-3 pb-2">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Groups</div>
            {approverDirectory.groups.map(g => {
              const Icon = groupIcons[g.id] || Users;
              const count = projectIndividuals.filter(p => p.group === g.id).length;
              if (count === 0) return null;
              return (
                <button key={g.id} onClick={() => handleGroupSelect(g.id)} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-stone-50 transition-colors text-left">
                  <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center"><Icon size={14} className="text-stone-500" /></div>
                  <div className="flex-1">
                    <div className="text-sm text-stone-800">{g.name}</div>
                    <div className="text-[11px] text-stone-500">{g.description}</div>
                  </div>
                  <span className="text-xs text-stone-400">{count}</span>
                </button>
              );
            })}
          </div>
        )}
        <div className="px-3 pb-3">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">{search ? 'Results' : 'Individuals'}</div>
          {filteredIndividuals.length === 0 && <div className="text-xs text-stone-400 py-3 text-center">No matching approvers</div>}
          {filteredIndividuals.map(p => (
            <button key={p.id} onClick={() => togglePerson(p)} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-stone-50 transition-colors text-left">
              <div className={`w-6 h-6 rounded-full ${getAvatarColor(p.role)} text-white flex items-center justify-center text-[10px] font-semibold`}>{initials(p.name)}</div>
              <div className="flex-1">
                <div className="text-sm text-stone-800">{p.name}</div>
                <div className="text-[11px] text-stone-500">{p.role}</div>
              </div>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selectedIds.includes(p.id) ? 'bg-stone-800 border-stone-800' : 'border-stone-300'}`}>
                {selectedIds.includes(p.id) && <Check size={10} className="text-white" />}
              </div>
            </button>
          ))}
        </div>
      </div>
      {selectedIds.length > 0 && (
        <div className="border-t border-stone-200 px-3 py-2.5 bg-stone-50">
          <button onClick={handleAdd} className="w-full bg-stone-900 text-white text-sm font-medium rounded-lg py-2 hover:bg-stone-800 transition-colors">
            Add {selectedIds.length} approver{selectedIds.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Approval Flow Stepper
   ═══════════════════════════════════════════════ */
function ApprovalStepper({ approvers, onRemove }) {
  const statusIcon = (status) => {
    if (status === 'Approved') return <Check size={12} className="text-emerald-600" />;
    if (status === 'For approval') return <Clock size={12} className="text-amber-600" />;
    return <Clock size={12} className="text-stone-400" />;
  };
  const statusLabel = (status) => {
    if (status === 'Approved') return 'text-emerald-600';
    if (status === 'For approval') return 'text-amber-600';
    return 'text-stone-400';
  };

  return (
    <div className="space-y-0">
      {approvers.map((a, i) => (
        <div key={a.id} className="relative">
          {i < approvers.length - 1 && <div className="absolute left-[19px] top-[44px] bottom-0 w-px bg-stone-200" />}
          <div className="flex items-start gap-3 py-2.5">
            <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
              a.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
              a.status === 'For approval' ? 'bg-amber-100 text-amber-700' :
              'bg-stone-100 text-stone-500'
            }`}>{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full ${getAvatarColor(a.role)} text-white flex items-center justify-center text-[10px] font-semibold`}>{initials(a.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stone-900 truncate">{a.name}</div>
                  <div className="text-[11px] text-stone-500">{a.role} · {a.group}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-1 ml-9">
                {statusIcon(a.status)}
                <span className={`text-xs font-medium ${statusLabel(a.status)}`}>{a.status}</span>
                {a.timestamp && <span className="text-[11px] text-stone-400 ml-1">· {fmtShort(a.timestamp)} {fmtTime(a.timestamp)}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 pt-1.5 shrink-0">
              {a.status !== 'Approved' && (
                <button onClick={() => onRemove(a.id)} className="text-stone-300 hover:text-red-500 transition-colors p-0.5" title="Remove approver"><Trash2 size={13} /></button>
              )}
              <button className="text-stone-300 hover:text-stone-500 transition-colors p-0.5 cursor-grab" title="Reorder"><GripVertical size={13} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 1: Overview (Request Summary)
   ═══════════════════════════════════════════════ */
function OverviewTab({ request }) {
  const proj = projects.find(p => p.id === request.projectId);
  const budgetRemaining = proj ? proj.budget - proj.spent : 0;
  const exceedsBudget = request.estimatedAmount > budgetRemaining;
  const missingCostCode = !request.costCode;

  return (
    <div>
      {/* Inline warnings */}
      {exceedsBudget && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border border-red-200 bg-red-50 text-xs text-red-800 mb-3">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" /> Exceeds remaining project budget by {fmt(request.estimatedAmount - budgetRemaining)}
        </div>
      )}
      {missingCostCode && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border border-orange-200 bg-orange-50 text-xs text-orange-800 mb-3">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" /> Missing cost code — required before approval
        </div>
      )}

      {/* Spend category / trade */}
      <FieldCard label="Spend Category / Trade" value={request.category} verified />
      <FieldCard label="Estimated Amount" value={fmt(request.estimatedAmount)} verified />
      <FieldCard label="Frequency" value={request.frequency || 'One-time'} verified />
      <FieldCard label="Requested Supplier" value={request.supplier || '—'} verified={!!request.supplier} sub={request.supplier ? request.trade : undefined} />
      <FieldCard label="Needed-by Date" value={request.neededBy ? fmtDate(request.neededBy) : '—'} verified={!!request.neededBy} />

      <Divider />

      {/* Description / Job Note */}
      <SectionTitle>Description / Job Note</SectionTitle>
      <div className="bg-stone-50 rounded-lg px-4 py-3 text-sm text-stone-700 border border-stone-200">
        {request.description || 'No description provided'}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 2: Job Context (Construction-Specific)
   ═══════════════════════════════════════════════ */
function JobContextTab({ request }) {
  const proj = projects.find(p => p.id === request.projectId);
  const pctUsed = proj ? (proj.spent / proj.budget) * 100 : 0;
  const budgetRemaining = proj ? proj.budget - proj.spent : 0;
  const costCode = costCodes.find(c => c.code === request.costCode);

  return (
    <div>
      <SectionTitle>Project</SectionTitle>
      <FieldCard label="Project" value={request.project} verified sub={proj?.code} />
      <FieldCard label="Cost Code" value={costCode ? `${costCode.code} — ${costCode.name}` : request.costCode || '—'} verified={!!request.costCode} />
      <FieldCard label="Job Phase / Trade" value={request.jobPhase || '—'} verified={!!request.jobPhase} sub={request.trade} />

      {/* Budget progress */}
      {proj && (
        <>
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

          {/* Mini bar: Requested vs Remaining */}
          <div className="bg-stone-50 rounded-lg px-4 py-3 mt-2 border border-stone-200">
            <div className="text-xs text-stone-500 mb-2">Requested vs. Remaining Budget</div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="w-full bg-stone-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${request.estimatedAmount > budgetRemaining ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((request.estimatedAmount / budgetRemaining) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-stone-600 whitespace-nowrap">{fmt(request.estimatedAmount)} / {fmt(budgetRemaining)}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 3: Approvals
   ═══════════════════════════════════════════════ */
function ApprovalsTab({ request, approvers, setApprovers, onApproversChange }) {
  const [showSelector, setShowSelector] = useState(false);
  const allApproved = approvers.length > 0 && approvers.every(a => a.status === 'Approved');

  function handleAddApprovers(people) {
    const newApprovers = people.map((p, i) => ({
      id: `new-${Date.now()}-${i}`,
      name: p.name,
      role: p.role,
      group: p.group || 'Added manually',
      status: 'Waiting',
      timestamp: null,
    }));
    setApprovers(prev => {
      const updated = [...prev, ...newApprovers];
      onApproversChange?.(updated);
      return updated;
    });
  }

  function handleRemoveApprover(id) {
    setApprovers(prev => {
      const updated = prev.filter(a => a.id !== id);
      onApproversChange?.(updated);
      return updated;
    });
  }

  // Smart defaults
  const smartNotes = [];
  const proj = projects.find(p => p.id === request.projectId);
  if (proj && request.estimatedAmount > (proj.budget - proj.spent)) smartNotes.push('Finance auto-added — exceeds remaining budget');
  if (request.estimatedAmount > 50000) smartNotes.push('Finance auto-added — above $50,000 threshold');
  if (request.type === 'material' || request.type === 'rental') smartNotes.push('Purchasing auto-added — materials / equipment request');

  return (
    <div>
      <SectionTitle>Approval Chain</SectionTitle>

      {/* Status banner */}
      <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border mb-4 ${
        allApproved ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
      }`}>
        {allApproved ? (
          <><Check size={14} className="text-emerald-600" /><span className="text-xs font-medium text-emerald-700">All approvals complete</span></>
        ) : approvers.length === 0 ? (
          <><AlertTriangle size={14} className="text-amber-600" /><span className="text-xs font-medium text-amber-700">No approvers assigned</span></>
        ) : (
          <><Clock size={14} className="text-amber-600" /><span className="text-xs font-medium text-amber-700">Approval in progress</span></>
        )}
      </div>

      {/* Smart defaults note */}
      {smartNotes.length > 0 && request.status !== 'Approved' && (
        <div className="mb-3 space-y-1">
          {smartNotes.map((note, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-stone-500">
              <Zap size={10} className="text-amber-500 shrink-0" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stepper */}
      {approvers.length > 0 ? (
        <div className="border border-stone-200 rounded-xl p-4 relative">
          <ApprovalStepper approvers={approvers} onRemove={handleRemoveApprover} />
          <div className="mt-3 pt-3 border-t border-stone-100 relative">
            <button onClick={() => setShowSelector(true)} className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 transition-colors">
              <Plus size={14} /> <span className="underline">Add approver</span>
            </button>
            {showSelector && (
              <ApproverSelectorDropdown request={request} onSelect={handleAddApprovers} onClose={() => setShowSelector(false)} />
            )}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center relative">
          <div className="text-sm text-stone-500 mb-3">No approvers assigned yet</div>
          <button onClick={() => setShowSelector(true)} className="inline-flex items-center gap-1.5 text-sm bg-stone-900 text-white rounded-lg px-4 py-2 hover:bg-stone-800 font-medium">
            <Plus size={14} /> Add approver
          </button>
          {showSelector && (
            <ApproverSelectorDropdown request={request} onSelect={handleAddApprovers} onClose={() => setShowSelector(false)} />
          )}
        </div>
      )}

      <div className="text-xs text-stone-500 flex items-start gap-1.5 mt-2.5">
        <Shield size={11} className="shrink-0 mt-0.5" />
        Default approver: Project Manager. Finance auto-added for budget overages or threshold breaches.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 4: Activity (Audit Trail)
   ═══════════════════════════════════════════════ */
function ActivityTab({ request }) {
  const activities = request.activity || [];
  const iconMap = {
    'created': FileText,
    'Approved': Check,
    'Converted': Send,
    'matched': DollarSign,
    'sent': Clock,
    'Draft': Edit3,
  };

  function getIcon(action) {
    for (const [key, Icon] of Object.entries(iconMap)) {
      if (action.includes(key)) return Icon;
    }
    return MessageSquare;
  }

  return (
    <div>
      <SectionTitle>Activity Log</SectionTitle>
      <div className="relative">
        {activities.map((a, i) => {
          const Icon = getIcon(a.action);
          return (
            <div key={i} className="flex gap-3 pb-5 last:pb-0 relative">
              {i < activities.length - 1 && <div className="absolute left-[15px] top-9 bottom-0 w-px bg-stone-200" />}
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 z-10">
                <Icon size={14} className="text-stone-500" />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="text-sm text-stone-900">{a.action}</div>
                <div className="text-xs text-stone-500">{a.who} · {fmtShort(a.time)} {fmtTime(a.time)}</div>
              </div>
            </div>
          );
        })}
        {activities.length === 0 && (
          <div className="text-sm text-stone-400 text-center py-8">No activity yet</div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Request Drawer
   ═══════════════════════════════════════════════ */
const TABS = ['Overview', 'Job Context', 'Approvals', 'Activity'];

/* ─── Editable Field for Draft mode ─── */
function EditableField({ label, value, onChange, type = 'text', options = null }) {
  if (options) {
    return (
      <div className="bg-stone-50 rounded-lg px-4 py-3 mb-2 border border-stone-200">
        <div className="text-xs text-stone-500 mb-1">{label}</div>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full text-sm text-stone-800 bg-transparent border-none outline-none focus:ring-0 p-0"
        >
          <option value="">Select...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 rounded-lg px-4 py-3 mb-2 border border-stone-200">
      <div className="text-xs text-stone-500 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm text-stone-800 bg-transparent border-none outline-none focus:ring-0 p-0"
      />
    </div>
  );
}

export default function RequestDrawer({ request, onClose, onAction }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [approvers, setApprovers] = useState(request?.approverChain || []);
  // Auto-enable editing when status is "Changes Requested"
  const [isEditing, setIsEditing] = useState(request?.status === 'Changes Requested');
  const [showChangesModal, setShowChangesModal] = useState(false);

  // Update editing state when request status changes (for reopened requests)
  useEffect(() => {
    if (request?.status === 'Changes Requested') {
      setIsEditing(true);
    }
  }, [request?.status]);

  // Editable draft fields - ALL fields
  const [edits, setEdits] = useState({
    name: request?.name || '',
    project: request?.project || '',
    projectId: request?.projectId || '',
    costCode: request?.costCode || '',
    jobPhase: request?.jobPhase || '',
    category: request?.category || '',
    estimatedAmount: request?.estimatedAmount?.toString() || '',
    frequency: request?.frequency || '',
    type: request?.type || '',
    trade: request?.trade || '',
    supplier: request?.supplier || '',
    description: request?.description || '',
    neededBy: request?.neededBy || '',
    paymentMethod: request?.paymentMethod || '',
    spendProgram: request?.spendProgram || '',
  });
  const [savedEdits, setSavedEdits] = useState({ ...edits });

  const isDirty = JSON.stringify(edits) !== JSON.stringify(savedEdits);

  const handleEdit = (key, value) => {
    setEdits(prev => ({ ...prev, [key]: value }));
  };

  // Prepare edits for saving - convert types as needed
  const prepareEditsForSave = () => {
    return {
      ...edits,
      estimatedAmount: edits.estimatedAmount ? parseFloat(edits.estimatedAmount) : 0,
      projectId: edits.projectId ? parseInt(edits.projectId) : undefined,
    };
  };

  const handleSave = () => {
    setSavedEdits({ ...edits });
    setIsEditing(false);
    // When saving from "Changes Requested", set to Draft
    if (request.status === 'Changes Requested') {
      onAction?.('save-as-draft', `Saved changes to ${request.name}`, { edits: prepareEditsForSave(), approverChain: approvers });
    } else {
      onAction?.('save', `Saved changes to ${request.name}`, { edits: prepareEditsForSave(), approverChain: approvers });
    }
  };

  const handleSubmitForApproval = () => {
    setSavedEdits({ ...edits });
    setIsEditing(false);
    onAction?.('submit', `Submitted ${request.name} for approval`, { edits: prepareEditsForSave(), approverChain: approvers });
  };

  const handleDiscard = () => {
    setEdits({ ...savedEdits });
    setIsEditing(false);
  };

  const handleAction = (type, message) => {
    onAction?.(type, message);
  };

  const handleRequestChanges = (note) => {
    onAction?.('request-changes', `Requested changes on ${request.name}`, { note });
  };

  if (!request) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/10 z-40 transition-opacity" onClick={onClose} />
      {/* Drawer panel */}
      <div className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-2xl border-l border-stone-200 z-50 flex flex-col" style={{ animation: 'drawerSlideIn 0.2s ease-out' }}>

        {/* ─── Header ─── */}
        <div className="px-6 pt-5 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900">
              <ArrowLeft size={15} /> Back
            </button>
            <div className="flex items-center gap-2">
              {(request.status === 'Draft' || request.status === 'Changes Requested') && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs border border-stone-200 rounded-md px-2.5 py-1 hover:bg-stone-50 text-stone-600 font-medium flex items-center gap-1"
                >
                  <Edit3 size={12} /> Edit
                </button>
              )}
              <button
                onClick={() => handleAction('reject', `Cancelled request — ${request.name}`)}
                className="text-xs border border-stone-200 rounded-md px-2.5 py-1 hover:bg-stone-50 text-red-600 font-medium flex items-center gap-1"
              >
                <Ban size={12} /> Cancel
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Request name + status */}
          <div className="text-lg font-semibold text-stone-900 tracking-tight">
            {getDisplayId(request)} — {getDisplayName(request)}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <StatusBadge status={request.status} />
            <span className="text-sm text-stone-500">·</span>
            <span className="text-sm text-stone-900 font-medium">{fmt(request.estimatedAmount)}</span>
          </div>

          {/* Requested Changes Banner */}
          {request.requestedChanges && (
            <div className="mt-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-amber-900 mb-1">Changes Requested</div>
                  <div className="text-sm text-amber-800 mb-2">{request.requestedChanges.note}</div>
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <span>{request.requestedChanges.by}</span>
                    <span>·</span>
                    <span>{fmtShort(request.requestedChanges.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Requester + project */}
          <div className="flex items-center gap-3 mt-3">
            <div className={`w-8 h-8 rounded-full ${getAvatarColor(request.requesterRole || 'PM')} flex items-center justify-center text-xs font-semibold text-white`}>
              {initials(request.requester)}
            </div>
            <div>
              <div className="text-sm font-medium text-stone-900">{request.requester}</div>
              <div className="text-xs text-stone-500">{request.requesterRole || 'Field Owner'}</div>
            </div>
            <span className="text-stone-300 mx-1">·</span>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">{request.project}</button>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="border-b border-stone-200 px-6 shrink-0">
          <nav className="flex gap-0 -mb-px">
            {TABS.map(tab => (
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
          {isEditing ? (
            <div>
              <SectionTitle>Edit Request</SectionTitle>

              {/* Basic Info */}
              <EditableField
                label="Request Name"
                value={edits.name}
                onChange={v => handleEdit('name', v)}
              />
              <EditableField
                label="Spend Category / Trade"
                value={edits.category}
                onChange={v => handleEdit('category', v)}
              />
              <EditableField
                label="Estimated Amount"
                value={edits.estimatedAmount}
                onChange={v => handleEdit('estimatedAmount', v)}
                type="number"
              />
              <EditableField
                label="Frequency"
                value={edits.frequency}
                onChange={v => handleEdit('frequency', v)}
                options={[
                  { value: 'One-time', label: 'One-time' },
                  { value: 'Monthly', label: 'Monthly' },
                  { value: 'Quarterly', label: 'Quarterly' },
                  { value: 'Annual', label: 'Annual' },
                ]}
              />
              <EditableField
                label="Type"
                value={edits.type}
                onChange={v => handleEdit('type', v)}
                options={[
                  { value: 'material', label: 'Material' },
                  { value: 'labor', label: 'Labor' },
                  { value: 'rental', label: 'Rental' },
                  { value: 'subcontractor', label: 'Subcontractor' },
                  { value: 'service', label: 'Service' },
                ]}
              />
              <EditableField
                label="Supplier"
                value={edits.supplier}
                onChange={v => handleEdit('supplier', v)}
              />
              <EditableField
                label="Trade"
                value={edits.trade}
                onChange={v => handleEdit('trade', v)}
              />
              <EditableField
                label="Needed-by Date"
                value={edits.neededBy}
                onChange={v => handleEdit('neededBy', v)}
                type="date"
              />

              <Divider />

              {/* Job Context */}
              <SectionTitle>Job Context</SectionTitle>
              <EditableField
                label="Project"
                value={edits.projectId}
                onChange={v => {
                  handleEdit('projectId', v);
                  const proj = projects.find(p => p.id === parseInt(v));
                  if (proj) handleEdit('project', proj.name);
                }}
                options={projects.map(p => ({ value: String(p.id), label: `${p.name} (${p.code})` }))}
              />
              <EditableField
                label="Cost Code"
                value={edits.costCode}
                onChange={v => handleEdit('costCode', v)}
                options={costCodes.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
              />
              <EditableField
                label="Job Phase"
                value={edits.jobPhase}
                onChange={v => handleEdit('jobPhase', v)}
              />

              <Divider />

              {/* Financial Details */}
              <SectionTitle>Financial Details</SectionTitle>
              <EditableField
                label="Payment Method"
                value={edits.paymentMethod}
                onChange={v => handleEdit('paymentMethod', v)}
                options={[
                  { value: 'Purchase Order', label: 'Purchase Order' },
                  { value: 'Virtual Card', label: 'Virtual Card' },
                  { value: 'Physical Card', label: 'Physical Card' },
                  { value: 'ACH', label: 'ACH' },
                  { value: 'Check', label: 'Check' },
                ]}
              />
              <EditableField
                label="Spend Program"
                value={edits.spendProgram}
                onChange={v => handleEdit('spendProgram', v)}
              />

              <Divider />

              {/* Description */}
              <SectionTitle>Description / Job Note</SectionTitle>
              <textarea
                value={edits.description}
                onChange={e => handleEdit('description', e.target.value)}
                rows={4}
                placeholder="Enter description or job note..."
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
              />
            </div>
          ) : (
            <>
              {activeTab === 'Overview' && <OverviewTab request={request} />}
              {activeTab === 'Job Context' && <JobContextTab request={request} />}
              {activeTab === 'Approvals' && <ApprovalsTab request={request} approvers={approvers} setApprovers={setApprovers} onApproversChange={(updated) => onAction?.('update-approvers', `Updated approvers for ${request.name}`, { approverChain: updated })} />}
              {activeTab === 'Activity' && <ActivityTab request={request} />}
            </>
          )}
        </div>

        {/* ─── Footer — contextual actions ─── */}
        <div className="border-t border-stone-200 px-6 py-3 bg-white flex items-center justify-center gap-3 shrink-0">
          {/* Save / Discard bar when editing or dirty */}
          {(isEditing || isDirty) ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-stone-500">You have unsaved changes</span>
              <div className="flex items-center gap-2">
                <button onClick={handleDiscard} className="text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium">
                  Discard
                </button>
                {/* Show both Save and Submit when editing from Changes Requested */}
                {request.status === 'Changes Requested' ? (
                  <>
                    <button onClick={handleSave} className="flex items-center gap-1.5 text-sm border border-stone-200 text-stone-700 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium">
                      <Check size={13} /> Save as draft
                    </button>
                    <button onClick={handleSubmitForApproval} className="flex items-center gap-1.5 text-sm bg-stone-900 text-white rounded-lg px-5 py-2 hover:bg-stone-800 font-medium">
                      <Send size={13} /> Submit for approval
                    </button>
                  </>
                ) : (
                  <button onClick={handleSave} className="flex items-center gap-1.5 text-sm bg-stone-900 text-white rounded-lg px-5 py-2 hover:bg-stone-800 font-medium">
                    <Check size={13} /> Save changes
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {request.status === 'Draft' && (
                <button
                  onClick={() => handleAction('submit', `Submitted ${request.name} for approval`)}
                  className="flex items-center gap-2 text-sm bg-stone-900 text-white rounded-lg px-5 py-2.5 hover:bg-stone-800 font-medium"
                >
                  <Send size={14} /> Submit for approval
                </button>
              )}
              {request.status === 'For approval' && (
                <>
                  <button
                    onClick={() => handleAction('approve', `Approved request — ${request.name}`)}
                    className="flex items-center gap-2 text-sm bg-emerald-600 text-white rounded-lg px-5 py-2.5 hover:bg-emerald-700 font-medium"
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    onClick={() => setShowChangesModal(true)}
                    className="flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2.5 hover:bg-stone-50 font-medium"
                  >
                    <Edit3 size={14} /> Request changes
                  </button>
                  <button
                    onClick={() => handleAction('reject', `Rejected request — ${request.name}`)}
                    className="flex items-center gap-2 text-sm text-red-600 border border-red-200 rounded-lg px-4 py-2.5 hover:bg-red-50 font-medium"
                  >
                    <Ban size={14} /> Reject
                  </button>
                </>
              )}
              {request.status === 'Approved' && isPurchaseRequest(request) && (
                <div className="w-full flex flex-col gap-3">
                  {/* Primary actions */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleAction('convert-to-po', `Converted ${request.name} to Purchase Order`)}
                      className="flex items-center gap-2 text-sm bg-stone-900 text-white rounded-lg px-5 py-2.5 hover:bg-stone-800 font-medium"
                    >
                      <FileText size={14} /> Convert to PO
                    </button>
                    <button
                      onClick={() => handleAction('issue-card', `Issued virtual card for ${request.name}`)}
                      className="flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2.5 hover:bg-stone-50 font-medium"
                    >
                      <CreditCard size={14} /> Issue virtual card
                    </button>
                  </div>
                  {/* Download approval summary - secondary action */}
                  <div className="border-t border-stone-100 pt-3">
                    <button
                      onClick={() => handleAction('download-approval-summary', `Downloaded approval summary for ${request.name}`)}
                      className="w-full flex items-center justify-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium"
                    >
                      <Download size={14} /> Download approval summary
                    </button>
                  </div>
                </div>
              )}
              {request.status === 'Converted' && isPurchaseRequest(request) && (
                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={() => handleAction('view-po', `Viewing Purchase Order for ${request.name}`)}
                    className="flex items-center justify-center gap-2 text-sm bg-stone-900 text-white rounded-lg px-5 py-2.5 hover:bg-stone-800 font-medium"
                  >
                    <FileText size={14} /> View Purchase Order
                  </button>
                  <button
                    onClick={() => handleAction('download-po', `Downloaded PO PDF for ${request.name}`)}
                    className="flex items-center justify-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium"
                  >
                    <Download size={14} /> Download PO PDF
                  </button>
                </div>
              )}
              {request.status === 'Card Issued' && isPurchaseRequest(request) && (
                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={() => handleAction('view-card', `Viewing card details for ${request.name}`)}
                    className="flex items-center justify-center gap-2 text-sm bg-stone-900 text-white rounded-lg px-5 py-2.5 hover:bg-stone-800 font-medium"
                  >
                    <CreditCard size={14} /> View card details
                  </button>
                  <button
                    onClick={() => handleAction('download-receipt', `Downloaded receipt for ${request.name}`)}
                    className="flex items-center justify-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium"
                  >
                    <Download size={14} /> Download receipt & transaction record
                  </button>
                </div>
              )}
              {request.status === 'Rejected' && (
                <button
                  onClick={() => handleAction('reopen', `Reopened ${request.name} for approval`)}
                  className="flex items-center gap-2 text-sm bg-stone-900 text-white rounded-lg px-5 py-2.5 hover:bg-stone-800 font-medium"
                >
                  <Edit3 size={14} /> Reopen request
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Request Changes Modal */}
      {showChangesModal && (
        <RequestChangesModal
          onClose={() => setShowChangesModal(false)}
          onSubmit={handleRequestChanges}
        />
      )}

      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
