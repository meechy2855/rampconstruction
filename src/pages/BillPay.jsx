import { useState, useMemo, useCallback } from 'react';
import { Search, Download, Table2, LayoutGrid, Plus, FileWarning, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import TabNav from '../components/TabNav';
import StatusBadge from '../components/StatusBadge';
import InvoiceDrawer from '../components/InvoiceDrawer';
import Toast from '../components/Toast';
import { bills, projects } from '../data/mockData';

const TABS = ['Overview', 'Drafts', 'For Approval', 'For Payment', 'History', 'Compliance'];

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ─── Infer drawer tab from page context ─── */
function inferDrawerTab(activePageTab, bill) {
  if (activePageTab === 'Compliance' || (bill.lienWaiverRequired && !bill.lienWaiverAttached)) return 'compliance';
  if (activePageTab === 'For Approval' || bill.status === 'For Approval' || bill.status === 'Pending') return 'approvals';
  if (activePageTab === 'For Payment' || bill.status === 'Scheduled') return 'payment';
  return 'overview';
}

/* ─── KPI Widgets (now clickable) ─── */
function OverviewWidgets({ filteredBills, onKpiClick, activeKpi }) {
  const awaitingApproval = filteredBills.filter(b => b.status === 'Pending' || b.status === 'For Approval');
  const blockedByLien = filteredBills.filter(b => b.lienWaiverRequired && !b.lienWaiverAttached);
  const totalRetainage = filteredBills.reduce((sum, b) => sum + b.retainageWithheld, 0);
  const upcoming7 = filteredBills.filter(b => {
    const due = new Date(b.dueDate);
    const now = new Date();
    const diff = (due - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7 && b.status !== 'Paid';
  });

  const widgets = [
    {
      key: 'awaiting_approval',
      title: 'Awaiting PM Approval',
      value: awaitingApproval.length,
      subtitle: formatCurrency(awaitingApproval.reduce((s, b) => s + b.amount, 0)),
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      key: 'blocked_lien',
      title: 'Blocked — Missing Lien Waivers',
      value: blockedByLien.length,
      subtitle: 'Invoices cannot be paid',
      icon: FileWarning,
      color: 'text-red-600 bg-red-50',
    },
    {
      key: 'retainage',
      title: 'Retainage Held',
      value: formatCurrency(totalRetainage),
      subtitle: 'Across all active projects',
      icon: AlertTriangle,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      key: 'due_7_days',
      title: 'Due Within 7 Days',
      value: upcoming7.length,
      subtitle: formatCurrency(upcoming7.reduce((s, b) => s + b.amount, 0)),
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-3">
      {widgets.map((w) => {
        const Icon = w.icon;
        const isActive = activeKpi === w.key;
        return (
          <div
            key={w.key}
            onClick={() => onKpiClick(isActive ? null : w.key)}
            className={`border rounded-xl px-4 py-3 cursor-pointer transition-all ${
              isActive
                ? 'border-ramp-gray-900 ring-1 ring-ramp-gray-900 bg-ramp-gray-50'
                : 'border-ramp-gray-200 hover:border-ramp-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`p-1 rounded-md ${w.color}`}>
                <Icon size={14} />
              </div>
              <span className="text-[11px] font-medium text-ramp-gray-500 uppercase tracking-wide leading-tight">{w.title}</span>
            </div>
            <div className="text-xl font-semibold text-ramp-gray-900">{w.value}</div>
            <div className="text-[11px] text-ramp-gray-500 mt-0.5">{w.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Lien Waiver Panel (now with Request wired to drawer) ─── */
function LienWaiverPanel({ onRequestWaiver }) {
  const needsWaiver = bills.filter(b => b.lienWaiverRequired && !b.lienWaiverAttached);
  return (
    <div className="border border-ramp-gray-200 rounded-xl p-4 mb-6 bg-ramp-gray-50">
      <h3 className="font-semibold text-sm text-ramp-gray-900 mb-1">Lien Waiver Management</h3>
      <p className="text-xs text-ramp-gray-500 mb-3">Track and collect waivers to unblock payments</p>
      <ul className="space-y-3">
        {needsWaiver.slice(0, 3).map((b) => (
          <li key={b.id} className="bg-white border border-ramp-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-ramp-gray-900 truncate">{b.vendor}</span>
              <span className="text-sm font-medium text-ramp-gray-900 shrink-0 ml-2">{formatCurrency(b.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ramp-gray-500 truncate">{b.project}</span>
              <button
                onClick={() => onRequestWaiver(b)}
                className="text-xs bg-ramp-gray-900 text-white px-2.5 py-1 rounded-md hover:bg-ramp-gray-800 shrink-0 ml-2"
              >
                Request
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Helper: extract persistable field overrides from drawer edits ─── */
function buildEditOverrides(data, bill) {
  const o = {};
  if (data.amount) o.amount = parseFloat(data.amount) || bill.amount;
  if (data.project) o.project = data.project;
  if (data.costCode) o.costCode = data.costCode.split(' · ')[0] || data.costCode;
  if (data.owner) o.owner = data.owner.replace(/\s*\(.*\)$/, '');
  if (data.paymentMethod) o.paymentMethod = data.paymentMethod;
  if (data.invoiceDate) o.invoiceDate = data.invoiceDate;
  if (data.dueDate) o.dueDate = data.dueDate;
  if (data.retainageWithheld) o.retainageWithheld = parseFloat(data.retainageWithheld) || bill.retainageWithheld;
  return o;
}

/* ═══════ Main Component ═══════ */
export default function BillPay({ selectedProject }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [search, setSearch] = useState('');

  // Drawer state
  const [selectedBill, setSelectedBill] = useState(null);
  const [drawerTab, setDrawerTab] = useState('overview');

  // KPI filter state
  const [activeKpi, setActiveKpi] = useState(null);

  // Local status overrides — tracks status changes from drawer actions
  const [statusOverrides, setStatusOverrides] = useState({});

  // Toast state
  const [toast, setToast] = useState(null);

  const handleDismissToast = useCallback((id) => {
    setToast((prev) => (prev?.id === id ? null : prev));
  }, []);

  // Drawer action handler → shows toast + updates status + closes drawer
  const handleDrawerAction = useCallback((actionType, message, extraData) => {
    setToast({ id: Date.now(), message, type: actionType, visible: true });
    if (selectedBill) {
      const id = selectedBill.id;
      if (actionType === 'approve') {
        setStatusOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: 'Approved' } }));
      } else if (actionType === 'reject') {
        setStatusOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: 'Rejected' } }));
      } else if (actionType === 'pay') {
        setStatusOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: 'Paid' } }));
      } else if (actionType === 'flag') {
        return; // toast-only, don't close drawer
      } else if (actionType === 'lien-waiver-uploaded') {
        setStatusOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), lienWaiverAttached: true } }));
        // falls through to close drawer
      } else if (actionType === 'lien-waiver-requested' || actionType === 'download-receipt') {
        return; // toast-only, don't close drawer
      } else if (actionType === 'request-changes') {
        const comments = extraData?.comments || message;
        setStatusOverrides(prev => ({
          ...prev,
          [id]: { ...(prev[id] || {}), status: 'Changes Requested', changeRequestComments: comments },
        }));
      } else if (actionType === 'save-changes') {
        const eo = extraData ? buildEditOverrides(extraData, selectedBill) : {};
        setStatusOverrides(prev => ({
          ...prev,
          [id]: { ...(prev[id] || {}), ...eo, status: 'For Approval', changeRequestComments: null },
        }));
      } else if (actionType === 'save-draft') {
        const eo = extraData ? buildEditOverrides(extraData, selectedBill) : {};
        setStatusOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...eo } }));
        return; // don't close drawer — user is still editing
      } else if (actionType === 'submit-for-approval') {
        const eo = extraData ? buildEditOverrides(extraData, selectedBill) : {};
        setStatusOverrides(prev => ({
          ...prev,
          [id]: { ...(prev[id] || {}), ...eo, status: 'For Approval' },
        }));
      } else if (actionType === 'submit-payment') {
        setStatusOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: 'Paid' } }));
      } else if (actionType === 'schedule-payment') {
        setStatusOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: 'Scheduled' } }));
      } else if (actionType === 'reopen') {
        setStatusOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: 'For Approval' } }));
      }
    }
    setSelectedBill(null);
  }, [selectedBill]);

  // Open invoice drawer
  const openDrawer = useCallback((bill, opts) => {
    setSelectedBill(bill);
    setDrawerTab(opts?.focusTab ?? inferDrawerTab(activeTab, bill));
  }, [activeTab]);

  const closeDrawer = useCallback(() => {
    setSelectedBill(null);
  }, []);

  // Lien waiver widget "Request" → opens drawer on compliance tab
  const handleRequestWaiver = useCallback((bill) => {
    openDrawer(bill, { focusTab: 'compliance' });
  }, [openDrawer]);

  // KPI tile click → sets filter
  const handleKpiClick = useCallback((kpiKey) => {
    setActiveKpi(kpiKey);
  }, []);

  // Apply status overrides to bills
  const billsWithOverrides = useMemo(() => {
    return bills.map(b => {
      const override = statusOverrides[b.id];
      return override ? { ...b, ...override } : b;
    });
  }, [statusOverrides]);

  // Base filtered bills (project + search + tab)
  const baseFilteredBills = useMemo(() => {
    let result = billsWithOverrides;
    if (selectedProject) {
      result = result.filter(b => b.projectId === selectedProject.id);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.vendor.toLowerCase().includes(q) ||
        b.project.toLowerCase().includes(q) ||
        b.invoiceNumber.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'Drafts') result = result.filter(b => b.status === 'Draft');
    if (activeTab === 'For Approval') result = result.filter(b => b.status === 'Pending' || b.status === 'For Approval' || b.status === 'Changes Requested');
    if (activeTab === 'For Payment') result = result.filter(b => b.status === 'Scheduled');
    if (activeTab === 'History') result = result.filter(b => b.status === 'Paid');
    if (activeTab === 'Compliance') result = result.filter(b => b.lienWaiverRequired);
    return result;
  }, [billsWithOverrides, selectedProject, search, activeTab]);

  // Apply KPI filter on top of base filter
  const filteredBills = useMemo(() => {
    if (!activeKpi) return baseFilteredBills;

    switch (activeKpi) {
      case 'awaiting_approval':
        return baseFilteredBills.filter(b => b.status === 'Pending' || b.status === 'For Approval');
      case 'blocked_lien':
        return baseFilteredBills.filter(b => b.lienWaiverRequired && !b.lienWaiverAttached);
      case 'retainage':
        return baseFilteredBills.filter(b => b.retainageWithheld > 0);
      case 'due_7_days':
        return baseFilteredBills.filter(b => {
          const due = new Date(b.dueDate);
          const now = new Date();
          const diff = (due - now) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 7 && b.status !== 'Paid';
        });
      default:
        return baseFilteredBills;
    }
  }, [baseFilteredBills, activeKpi]);

  // Unfiltered bills for KPI widget calculations (don't include KPI filter in counts)
  const allBillsForWidgets = useMemo(() => {
    let result = billsWithOverrides;
    if (selectedProject) {
      result = result.filter(b => b.projectId === selectedProject.id);
    }
    return result;
  }, [billsWithOverrides, selectedProject]);

  const tabCounts = {
    'Drafts': billsWithOverrides.filter(b => b.status === 'Draft').length,
    'For Approval': billsWithOverrides.filter(b => b.status === 'Pending' || b.status === 'For Approval' || b.status === 'Changes Requested').length,
    'For Payment': billsWithOverrides.filter(b => b.status === 'Scheduled').length,
  };

  // Clear KPI filter when changing tabs
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setActiveKpi(null);
  }, []);

  return (
    <div>
      <PageHeader
        breadcrumb="Bill Pay / AP Automation"
        title="Construction Cost Central"
        description="Automated invoice management for construction spend matched to projects and cost codes"
        bullets={[
          'Automated invoice intake, coding, and approval routing',
          'Project-specific approval workflows before payment by ACH, check, or virtual card',
          'Tight oversight, compliance checks, and predictable payment timing',
        ]}
        actions={
          <>
            <button className="text-sm px-3 py-2 border border-ramp-gray-200 rounded-lg hover:bg-ramp-gray-50 text-ramp-gray-700 font-medium">
              Recurring bills
            </button>
            <button className="text-sm px-3 py-2 bg-ramp-gray-900 text-white rounded-lg hover:bg-ramp-gray-800 font-medium flex items-center gap-1.5">
              <Plus size={14} />
              New bill
            </button>
          </>
        }
      />

      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} counts={tabCounts} />

      <div className="mt-4">
        {activeTab === 'Overview' && (
          <OverviewWidgets
            filteredBills={allBillsForWidgets}
            onKpiClick={handleKpiClick}
            activeKpi={activeKpi}
          />
        )}

        {/* Active KPI filter indicator */}
        {activeKpi && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-ramp-gray-500">Filtered by:</span>
            <span className="inline-flex items-center gap-1.5 bg-ramp-gray-100 text-ramp-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
              {activeKpi === 'awaiting_approval' && 'Awaiting PM Approval'}
              {activeKpi === 'blocked_lien' && 'Missing Lien Waivers'}
              {activeKpi === 'retainage' && 'Retainage Held'}
              {activeKpi === 'due_7_days' && 'Due Within 7 Days'}
              <button
                onClick={() => setActiveKpi(null)}
                className="ml-1 text-ramp-gray-400 hover:text-ramp-gray-600"
              >
                ×
              </button>
            </span>
          </div>
        )}

        {/* Search & filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ramp-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm border border-ramp-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-ramp-gray-300"
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-ramp-gray-50 text-ramp-gray-500"><Table2 size={16} /></button>
            <button className="p-2 rounded-lg hover:bg-ramp-gray-50 text-ramp-gray-500"><LayoutGrid size={16} /></button>
            <button className="p-2 rounded-lg hover:bg-ramp-gray-50 text-ramp-gray-500"><Download size={16} /></button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-ramp-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ramp-gray-50 border-b border-ramp-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Vendor / Subcontractor</th>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Project</th>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Cost Code</th>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Invoice #</th>
                <th className="text-right px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Amount</th>
                <th className="text-right px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Retainage</th>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Due Date</th>
                <th className="text-center px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Lien Waiver</th>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ramp-gray-100">
              {filteredBills.map((bill) => (
                <tr
                  key={bill.id}
                  className={`hover:bg-ramp-gray-50 transition-colors cursor-pointer ${
                    selectedBill?.id === bill.id ? 'bg-ramp-gray-100' : ''
                  }`}
                  onClick={() => openDrawer(bill)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-ramp-gray-900">{bill.vendor}</div>
                    <div className="text-xs text-ramp-gray-500">{bill.paymentMethod}</div>
                  </td>
                  <td className="px-4 py-3 text-ramp-gray-700">{bill.project}</td>
                  <td className="px-4 py-3 text-ramp-gray-600 font-mono text-xs">{bill.costCode}</td>
                  <td className="px-4 py-3"><StatusBadge status={bill.status} /></td>
                  <td className="px-4 py-3 text-ramp-gray-600">{bill.invoiceNumber}</td>
                  <td className="px-4 py-3 text-right font-medium text-ramp-gray-900">{formatCurrency(bill.amount)}</td>
                  <td className="px-4 py-3 text-right text-ramp-gray-600">{formatCurrency(bill.retainageWithheld)}</td>
                  <td className="px-4 py-3">
                    <span className={new Date(bill.dueDate) < new Date() && bill.status !== 'Paid' ? 'text-red-600 font-medium' : 'text-ramp-gray-700'}>
                      {formatDate(bill.dueDate)}
                    </span>
                    {new Date(bill.dueDate) < new Date() && bill.status !== 'Paid' && (
                      <div className="text-xs text-red-500">Overdue</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {bill.lienWaiverRequired ? (
                      bill.lienWaiverAttached ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs"><CheckCircle2 size={12} /> Yes</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-orange-600 text-xs"><FileWarning size={12} /> Missing</span>
                      )
                    ) : (
                      <span className="text-ramp-gray-400 text-xs">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ramp-gray-900 text-xs">{bill.owner}</div>
                    <div className="text-ramp-gray-500 text-xs">{bill.ownerRole}</div>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => openDrawer(bill)}
                      className="text-xs border border-ramp-gray-200 rounded-md px-3 py-1.5 hover:bg-ramp-gray-50 text-ramp-gray-700 font-medium"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-ramp-gray-50 border-t border-ramp-gray-200 text-xs text-ramp-gray-500 flex justify-between">
            <span>1–{filteredBills.length} of {filteredBills.length} bills</span>
            <span>
              Total: {formatCurrency(filteredBills.reduce((s, b) => s + b.amount, 0))}
              {' · '}
              Retainage: {formatCurrency(filteredBills.reduce((s, b) => s + b.retainageWithheld, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Invoice Drawer ─── */}
      <InvoiceDrawer
        bill={selectedBill}
        onClose={closeDrawer}
        onAction={handleDrawerAction}
        initialTab={drawerTab}
        pageTab={activeTab}
      />

      {/* ─── Toast Notification ─── */}
      <Toast toast={toast} onDismiss={handleDismissToast} />
    </div>
  );
}
