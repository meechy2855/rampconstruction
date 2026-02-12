import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Download, Settings, Plus, ShoppingCart } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import TabNav from '../components/TabNav';
import StatusBadge from '../components/StatusBadge';
import RequestDrawer from '../components/RequestDrawer';
import PurchaseOrderDrawer from '../components/PurchaseOrderDrawer';
import Toast from '../components/Toast';
import { procurementRequests, costCodes } from '../data/mockData';
import { isPurchaseRequest, isPurchaseOrder, derivePOStatus } from '../utils/procurementTypeGuards';

const REQUEST_TABS = ['All requests', 'Drafts', 'Pending', 'Needs action', 'Approved'];
const PO_TABS = ['All POs', 'Active', 'Closed'];

/* ─── PR statuses: items that belong in the Requests section ─── */
const PR_STATUSES = ['Draft', 'For approval', 'Changes Requested', 'Rejected', 'Approved'];

/* ─── PO statuses: items that belong in the Purchase Orders section ─── */
const PO_STATUSES = ['Approved', 'Converted', 'Card Issued', 'Cancelled'];

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function RequestsView({ selectedProject, onRowClick, requests }) {
  const [activeTab, setActiveTab] = useState('All requests');
  const [search, setSearch] = useState('');

  // Only show PR items (Draft, For approval, Changes Requested, Rejected)
  const prItems = useMemo(() => {
    return requests.filter(r => PR_STATUSES.includes(r.status));
  }, [requests]);

  const filtered = useMemo(() => {
    let result = prItems;
    if (selectedProject) {
      result = result.filter(r => r.projectId === selectedProject.id);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q) ||
        r.requester.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'Drafts') result = result.filter(r => r.status === 'Draft');
    if (activeTab === 'Pending') result = result.filter(r => r.status === 'For approval');
    if (activeTab === 'Needs action') result = result.filter(r => r.status === 'Changes Requested');
    if (activeTab === 'Approved') result = result.filter(r => r.status === 'Approved');
    return result;
  }, [prItems, selectedProject, search, activeTab]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    'All requests': prItems.length,
    'Drafts': prItems.filter(r => r.status === 'Draft').length,
    'Pending': prItems.filter(r => r.status === 'For approval').length,
    'Needs action': prItems.filter(r => r.status === 'Changes Requested').length,
    'Approved': prItems.filter(r => r.status === 'Approved').length,
  }), [prItems]);

  return (
    <div>
      <TabNav tabs={REQUEST_TABS} activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />

      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ramp-gray-400" />
            <input
              type="text"
              placeholder="Filter by..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-ramp-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-ramp-gray-300"
            />
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-ramp-gray-50 text-ramp-gray-500"><Download size={16} /></button>
          </div>
        </div>

        <div className="border border-ramp-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ramp-gray-50 border-b border-ramp-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Project</th>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Next approver</th>
                <th className="text-right px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Amount / Frequency</th>
                <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Spend program</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ramp-gray-100">
              {filtered.map((r) => {
                const nextApprover = r.approverChain?.find(a => a.status === 'Pending' || a.status === 'For approval');
                return (
                  <tr
                    key={r.id}
                    onClick={() => onRowClick(r)}
                    className="hover:bg-ramp-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-ramp-gray-900">{r.name}</div>
                      <div className="text-xs text-ramp-gray-500">{r.requester}</div>
                    </td>
                    <td className="px-4 py-3 text-ramp-gray-700">{r.project}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.category} />
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-ramp-gray-500 text-sm">
                      {nextApprover ? nextApprover.name : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-medium text-ramp-gray-900">{formatCurrency(r.estimatedAmount)}</div>
                      <div className="text-xs text-ramp-gray-500">{r.frequency || 'Annual'}</div>
                    </td>
                    <td className="px-4 py-3 text-ramp-gray-600">{r.spendProgram}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ramp-gray-400 text-sm">
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-ramp-gray-50 border-t border-ramp-gray-200 text-xs text-ramp-gray-500">
            1–{filtered.length} of {filtered.length} items
          </div>
        </div>
      </div>
    </div>
  );
}

function PurchaseOrdersView({ selectedProject, onRowClick, orders }) {
  const [activeTab, setActiveTab] = useState('All POs');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = orders;
    if (selectedProject) {
      result = result.filter(r => r.projectId === selectedProject.id);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q) ||
        (r.supplier && r.supplier.toLowerCase().includes(q))
      );
    }
    if (activeTab === 'Active') {
      result = result.filter(r => {
        const s = derivePOStatus(r);
        return s !== 'Closed' && s !== 'Cancelled';
      });
    }
    if (activeTab === 'Closed') {
      result = result.filter(r => {
        const s = derivePOStatus(r);
        return s === 'Closed' || s === 'Cancelled';
      });
    }
    return result;
  }, [orders, selectedProject, search, activeTab]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    'All POs': orders.length,
    'Active': orders.filter(r => { const s = derivePOStatus(r); return s !== 'Closed' && s !== 'Cancelled'; }).length,
    'Closed': orders.filter(r => { const s = derivePOStatus(r); return s === 'Closed' || s === 'Cancelled'; }).length,
  }), [orders]);

  return (
    <div>
      <TabNav tabs={PO_TABS} activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />

      <div className="flex items-center justify-between mb-4 mt-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ramp-gray-400" />
          <input
            type="text"
            placeholder="Filter by..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-ramp-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-ramp-gray-300"
          />
        </div>
        <button className="text-sm border border-ramp-gray-200 rounded-lg px-3 py-2 hover:bg-ramp-gray-50 text-ramp-gray-700 font-medium flex items-center gap-1.5">
          <Settings size={14} />
          Settings
        </button>
      </div>

      <div className="border border-ramp-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ramp-gray-50 border-b border-ramp-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">PO #</th>
              <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Supplier</th>
              <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">PO Status</th>
              <th className="text-right px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Committed</th>
              <th className="text-right px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Invoiced</th>
              <th className="text-right px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Remaining</th>
              <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Project</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ramp-gray-100">
            {filtered.map((o) => {
              const remaining = o.totalAmount - (o.billedAmount || 0);
              const poStatus = derivePOStatus(o);
              return (
                <tr
                  key={o.id}
                  onClick={() => onRowClick(o)}
                  className="hover:bg-ramp-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-ramp-gray-700 font-medium">PO-{String(o.id).padStart(4, '0')}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ramp-gray-900">{o.supplier || '—'}</div>
                    <div className="text-xs text-ramp-gray-500">{o.category}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={poStatus} /></td>
                  <td className="px-4 py-3 text-right text-ramp-gray-900 font-medium">{formatCurrency(o.totalAmount)}</td>
                  <td className="px-4 py-3 text-right text-ramp-gray-700">{formatCurrency(o.billedAmount || 0)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${remaining < 0 ? 'text-red-600' : 'text-ramp-gray-900'}`}>
                    {formatCurrency(remaining)}
                  </td>
                  <td className="px-4 py-3 text-ramp-gray-600">{o.project}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ramp-gray-400 text-sm">
                  No purchase orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-ramp-gray-50 border-t border-ramp-gray-200 text-xs text-ramp-gray-500">
          1–{filtered.length} of {filtered.length} items
        </div>
      </div>
    </div>
  );
}

export default function Procurement({ selectedProject }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive view from URL — re-derived on every URL change
  const view = location.pathname.includes('purchase-orders') ? 'purchase-orders' : 'requests';

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);

  // Local status overrides — tracks status changes AND field edits from drawer actions
  const [statusOverrides, setStatusOverrides] = useState({});

  // Apply status overrides to all procurement items
  const allItemsWithOverrides = useMemo(() => {
    return procurementRequests.map(r => {
      const override = statusOverrides[r.id];
      return override ? { ...r, ...override } : r;
    });
  }, [statusOverrides]);

  // Split into PR items and PO items
  const prItems = useMemo(() => {
    return allItemsWithOverrides.filter(r => PR_STATUSES.includes(r.status));
  }, [allItemsWithOverrides]);

  const poItems = useMemo(() => {
    return allItemsWithOverrides.filter(r => PO_STATUSES.includes(r.status));
  }, [allItemsWithOverrides]);

  // Toast state
  const [toast, setToast] = useState(null);
  const handleDismissToast = useCallback((id) => {
    setToast(prev => (prev?.id === id ? null : prev));
  }, []);

  /* ─── Build edit overrides from drawer data ─── */
  function buildEditOverrides(data, item) {
    const o = {};
    if (data.name) o.name = data.name;
    if (data.project) o.project = data.project;
    if (data.projectId) o.projectId = parseInt(data.projectId) || item.projectId;
    if (data.costCode) o.costCode = data.costCode;
    if (data.jobPhase) o.jobPhase = data.jobPhase;
    if (data.category) o.category = data.category;
    if (data.estimatedAmount) o.estimatedAmount = parseFloat(data.estimatedAmount) || item.estimatedAmount;
    if (data.totalAmount) o.totalAmount = parseFloat(data.totalAmount) || item.totalAmount;
    if (data.frequency) o.frequency = data.frequency;
    if (data.type) o.type = data.type;
    if (data.supplier) o.supplier = data.supplier;
    if (data.description) o.description = data.description;
    if (data.neededBy) o.neededBy = data.neededBy;
    if (data.paymentMethod) o.paymentMethod = data.paymentMethod;
    if (data.spendProgram) o.spendProgram = data.spendProgram;
    if (data.trade) o.trade = data.trade;
    if (data.term) o.term = data.term;
    return o;
  }

  const handleDrawerAction = useCallback((actionType, message, extraData) => {
    // Silent actions don't show toast
    if (actionType !== 'update-approvers') {
      setToast({ id: Date.now(), message, type: actionType, visible: true });
    }
    const item = selectedRequest || selectedPO;
    if (!item) {
      setSelectedRequest(null);
      setSelectedPO(null);
      return;
    }
    const id = item.id;

    // ─── Request actions ───
    if (actionType === 'approve') {
      setStatusOverrides(prev => ({ ...prev, [id]: { ...prev[id], status: 'Approved', approvals: 'Approved' } }));
    } else if (actionType === 'reject') {
      setStatusOverrides(prev => ({ ...prev, [id]: { ...prev[id], status: 'Rejected', approvals: 'Rejected' } }));
    } else if (actionType === 'request-changes') {
      const note = extraData?.note || '';
      setStatusOverrides(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          status: 'Changes Requested',
          approvals: 'Changes Requested',
          requestedChanges: { note, by: 'You', timestamp: new Date().toISOString() },
        },
      }));
    } else if (actionType === 'update-approvers') {
      // Persist approver chain changes without closing drawer
      const chain = extraData?.approverChain || [];
      setStatusOverrides(prev => ({
        ...prev,
        [id]: { ...prev[id], approverChain: chain },
      }));
      return; // don't close drawer
    } else if (actionType === 'submit') {
      // Submit for approval — persist any edits + approvers and set status to 'For approval'
      const editOverrides = extraData?.edits ? buildEditOverrides(extraData.edits, item) : {};
      const chain = extraData?.approverChain;
      setStatusOverrides(prev => ({
        ...prev,
        [id]: { ...prev[id], ...editOverrides, status: 'For approval', approvals: 'For approval', ...(chain ? { approverChain: chain } : {}) },
      }));
    } else if (actionType === 'save' || actionType === 'save-as-draft') {
      // Save edits + approvers, keep or change to Draft
      const editOverrides = extraData?.edits ? buildEditOverrides(extraData.edits, item) : {};
      const chain = extraData?.approverChain;
      const newStatus = actionType === 'save-as-draft' ? 'Draft' : item.status;
      const newApprovals = actionType === 'save-as-draft' ? 'Draft' : item.approvals;
      setStatusOverrides(prev => ({
        ...prev,
        [id]: { ...prev[id], ...editOverrides, status: newStatus, approvals: newApprovals, ...(chain ? { approverChain: chain } : {}) },
      }));
    } else if (actionType === 'save-po') {
      // Save PO edits
      const editOverrides = extraData?.edits ? buildEditOverrides(extraData.edits, item) : {};
      setStatusOverrides(prev => ({
        ...prev,
        [id]: { ...prev[id], ...editOverrides },
      }));
    } else if (actionType === 'reopen') {
      // Reopen rejected item → 'For approval'
      setStatusOverrides(prev => ({
        ...prev,
        [id]: { ...prev[id], status: 'For approval', approvals: 'For approval' },
      }));
    } else if (actionType === 'flag') {
      // Toast only, don't close
      setToast({ id: Date.now(), message, type: actionType, visible: true });
      return;
    } else if (actionType === 'convert-to-po') {
      setStatusOverrides(prev => ({ ...prev, [id]: { ...prev[id], status: 'Approved', approvals: 'Approved' } }));
    } else if (actionType === 'issue-card') {
      setStatusOverrides(prev => ({ ...prev, [id]: { ...prev[id], status: 'Card Issued', approvals: 'Card Issued' } }));
    }
    // ─── PO-specific actions ───
    else if (actionType === 'close-po') {
      setStatusOverrides(prev => ({ ...prev, [id]: { ...prev[id], closed: true } }));
    } else if (actionType === 'cancel-po') {
      setStatusOverrides(prev => ({ ...prev, [id]: { ...prev[id], cancelled: true, status: 'Cancelled', approvals: 'Cancelled' } }));
    } else if (actionType === 'reopen-po') {
      setStatusOverrides(prev => ({ ...prev, [id]: { ...prev[id], closed: false } }));
    } else if (actionType === 'issue-po') {
      setStatusOverrides(prev => ({ ...prev, [id]: { ...prev[id], draft: false, status: 'Approved' } }));
    } else if (actionType === 'match-invoice') {
      // Link invoice to PO — update billed amount
      const invoiceAmount = extraData?.invoiceAmount || 0;
      setStatusOverrides(prev => {
        const current = prev[id] || {};
        const currentBilled = current.billedAmount ?? item.billedAmount ?? 0;
        return { ...prev, [id]: { ...current, billedAmount: currentBilled + invoiceAmount } };
      });
    }

    setSelectedRequest(null);
    setSelectedPO(null);
  }, [selectedRequest, selectedPO]);

  function handleRequestClick(request) {
    setSelectedRequest(request);
    setSelectedPO(null);
  }

  function handlePOClick(po) {
    setSelectedPO(po);
    setSelectedRequest(null);
  }

  // Navigate when clicking the sub-nav toggle
  function switchView(newView) {
    if (newView === 'purchase-orders') {
      navigate('/procurement/purchase-orders');
    } else {
      navigate('/procurement/requests');
    }
  }

  return (
    <div>
      <PageHeader
        breadcrumb="Procurement"
        title={view === 'requests' ? 'Requests' : 'Purchase orders'}
        actions={
          view === 'requests' ? (
            <>
              <button className="text-sm border border-ramp-gray-200 rounded-lg px-3 py-2 hover:bg-ramp-gray-50 text-ramp-gray-700 font-medium">
                New procurement program
              </button>
              <button className="text-sm px-3 py-2 bg-ramp-gray-900 text-white rounded-lg hover:bg-ramp-gray-800 font-medium flex items-center gap-1.5">
                <Plus size={14} />
                Request spend
              </button>
            </>
          ) : (
            <button className="text-sm border border-ramp-gray-200 rounded-lg px-3 py-2 hover:bg-ramp-gray-50 text-ramp-gray-700 font-medium flex items-center gap-1.5">
              <Settings size={14} />
              Settings
            </button>
          )
        }
      />

      {/* Sub-nav toggle */}
      <div className="flex gap-1 mb-4 bg-ramp-gray-100 rounded-lg p-0.5 w-fit">
        <button
          onClick={() => switchView('requests')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === 'requests' ? 'bg-white text-ramp-gray-900 shadow-sm' : 'text-ramp-gray-500 hover:text-ramp-gray-700'
          }`}
        >
          Requests
        </button>
        <button
          onClick={() => switchView('purchase-orders')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === 'purchase-orders' ? 'bg-white text-ramp-gray-900 shadow-sm' : 'text-ramp-gray-500 hover:text-ramp-gray-700'
          }`}
        >
          Purchase orders
        </button>
      </div>

      {view === 'requests' ? (
        <RequestsView selectedProject={selectedProject} onRowClick={handleRequestClick} requests={allItemsWithOverrides} />
      ) : (
        <PurchaseOrdersView selectedProject={selectedProject} onRowClick={handlePOClick} orders={poItems} />
      )}

      {/* Request Drawer */}
      {selectedRequest && (
        <RequestDrawer
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAction={handleDrawerAction}
        />
      )}

      {/* Purchase Order Drawer */}
      {selectedPO && (
        <PurchaseOrderDrawer
          po={selectedPO}
          onClose={() => setSelectedPO(null)}
          onAction={handleDrawerAction}
        />
      )}

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={handleDismissToast} />
    </div>
  );
}
