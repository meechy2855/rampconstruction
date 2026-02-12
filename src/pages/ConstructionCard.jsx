import { useState, useMemo, useCallback } from 'react';
import { Search, Filter, Download, CreditCard, AlertCircle, Receipt, HardHat, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import TabNav from '../components/TabNav';
import StatusBadge from '../components/StatusBadge';
import TransactionDrawer from '../components/TransactionDrawer';
import Toast from '../components/Toast';
import { cardTransactions, projects } from '../data/mockData';
import { deriveCardTransactionStatus } from '../utils/cardTransactionStatus';

const TABS = ['Overview', 'For Approval', 'Missing Receipt', 'Missing Project Code', 'Approved', 'All Transactions'];

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ─── Uncoded Job Spend helper ─── */
function getUncodedStats(transactions) {
  const uncoded = transactions.filter(t =>
    deriveCardTransactionStatus(t) === 'Missing Project Code'
  );
  return { count: uncoded.length, total: uncoded.reduce((s, t) => s + t.amount, 0) };
}

/* ─── Overview Widgets ─── */
function OverviewCards({ transactions, onKpiClick }) {
  const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);
  const missingReceipts = transactions.filter(t => deriveCardTransactionStatus(t) === 'Missing Receipt').length;
  const forApproval = transactions.filter(t => deriveCardTransactionStatus(t) === 'For Approval').length;
  const uncoded = getUncodedStats(transactions);

  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      <div className="border border-ramp-gray-200 rounded-xl p-4">
        <div className="text-xs text-ramp-gray-500 mb-1 font-medium uppercase tracking-wide">Remaining line of credit</div>
        <div className="text-2xl font-semibold text-ramp-gray-900">$5,255.80</div>
      </div>
      <div className="border border-ramp-gray-200 rounded-xl p-4">
        <div className="text-xs text-ramp-gray-500 mb-1 font-medium uppercase tracking-wide">Total field spend</div>
        <div className="text-2xl font-semibold text-ramp-gray-900">{formatCurrency(totalSpend)}</div>
      </div>
      {/* Clickable: filters to missing receipts */}
      <button
        onClick={() => onKpiClick('missing-receipts')}
        className="border border-ramp-gray-200 rounded-xl p-4 text-left hover:bg-orange-50/50 hover:border-orange-200 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-1.5 text-xs text-orange-600 mb-1 font-medium uppercase tracking-wide">
          <Receipt size={12} /> Missing Receipts
        </div>
        <div className="text-2xl font-semibold text-orange-600">{missingReceipts}</div>
      </button>
      {/* Uncoded spend */}
      <button
        onClick={() => onKpiClick('uncoded')}
        className="border border-amber-200 rounded-xl p-4 bg-amber-50/50 text-left hover:bg-amber-50 hover:border-amber-300 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-1.5 text-xs text-amber-700 mb-1 font-medium uppercase tracking-wide">
          <AlertTriangle size={12} /> Uncoded Job Spend
        </div>
        <div className="text-2xl font-semibold text-amber-700">{uncoded.count}</div>
        <div className="text-xs text-amber-600 mt-0.5">{formatCurrency(uncoded.total)} missing project or cost code</div>
      </button>
      {/* For Approval */}
      <button
        onClick={() => onKpiClick('for-approval')}
        className="border border-ramp-gray-200 rounded-xl p-4 text-left hover:bg-blue-50/50 hover:border-blue-200 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-1 font-medium uppercase tracking-wide">
          <AlertCircle size={12} /> For Approval
        </div>
        <div className="text-2xl font-semibold text-blue-600">{forApproval}</div>
      </button>
    </div>
  );
}

/* ─── By Project Tab ─── */
function ByProjectView({ transactions, onTransactionClick }) {
  const projectGroups = useMemo(() => {
    const groups = {};
    transactions.forEach(t => {
      if (!groups[t.project]) {
        const proj = projects.find(p => p.id === t.projectId);
        groups[t.project] = {
          name: t.project,
          budget: proj?.budget || 0,
          totalSpent: proj?.spent || 0,
          cardSpend: 0,
          txCount: 0,
          transactions: [],
        };
      }
      groups[t.project].cardSpend += t.amount;
      groups[t.project].txCount += 1;
      groups[t.project].transactions.push(t);
    });
    return Object.values(groups).sort((a, b) => b.cardSpend - a.cardSpend);
  }, [transactions]);

  return (
    <div className="space-y-4 mb-6">
      {projectGroups.map((group) => {
        const pctUsed = group.budget > 0 ? (group.totalSpent / group.budget) * 100 : 0;
        const remaining = group.budget - group.totalSpent;
        return (
          <div key={group.name} className="border border-ramp-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 bg-ramp-gray-50 border-b border-ramp-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-ramp-gray-900 text-white flex items-center justify-center">
                    <HardHat size={14} />
                  </div>
                  <div>
                    <div className="font-semibold text-ramp-gray-900">{group.name}</div>
                    <div className="text-xs text-ramp-gray-500">{group.txCount} transactions · Card spend: {formatCurrency(group.cardSpend)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-ramp-gray-900">
                    {formatCurrency(group.totalSpent)} <span className="text-ramp-gray-400 font-normal">of</span> {formatCurrency(group.budget)}
                  </div>
                  <div className={`text-xs ${remaining < 0 ? 'text-red-600 font-medium' : 'text-ramp-gray-500'}`}>
                    {remaining >= 0 ? `${formatCurrency(remaining)} remaining` : `${formatCurrency(Math.abs(remaining))} over budget`}
                  </div>
                </div>
              </div>
              <div className="w-full bg-ramp-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${pctUsed > 90 ? 'bg-red-500' : pctUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(pctUsed, 100)}%` }}
                />
              </div>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ramp-gray-100">
                {group.transactions.map((t) => {
                  const status = deriveCardTransactionStatus(t);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => onTransactionClick(t)}
                      className="hover:bg-ramp-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-2.5 w-48">
                        <div className="font-medium text-ramp-gray-900 text-xs">{t.supplier}</div>
                      </td>
                      <td className="px-4 py-2.5 text-ramp-gray-500 text-xs">{formatDate(t.date)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-ramp-gray-900 text-xs">{formatCurrency(t.amount)}</td>
                      <td className="px-4 py-2.5 text-ramp-gray-600 text-xs">{t.trade}</td>
                      <td className="px-4 py-2.5 text-ramp-gray-600 text-xs">{t.spendType}</td>
                      <td className="px-4 py-2.5 text-ramp-gray-500 text-xs">{t.cardholder}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */
export default function ConstructionCard({ selectedProject }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [search, setSearch] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [kpiFilter, setKpiFilter] = useState(null);

  // Local status overrides — tracks ALL changes from drawer actions
  const [statusOverrides, setStatusOverrides] = useState({});

  // Toast state
  const [toast, setToast] = useState(null);
  const handleDismissToast = useCallback((id) => {
    setToast(prev => (prev?.id === id ? null : prev));
  }, []);

  /* ─── Handle all drawer actions ─── */
  const handleDrawerAction = useCallback((actionType, message, extraData) => {
    // Silent actions (save without close) don't show toast
    if (actionType === 'save-silent') {
      if (selectedTransaction && extraData) {
        const id = selectedTransaction.id;
        setStatusOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...extraData } }));
      }
      return; // don't close drawer
    }

    setToast({ id: Date.now(), message, type: actionType, visible: true });

    if (selectedTransaction) {
      const id = selectedTransaction.id;

      if (actionType === 'approve') {
        setStatusOverrides(prev => ({
          ...prev,
          [id]: { ...(prev[id] || {}), approvalStatus: 'Approved', ...extraData },
        }));
      } else if (actionType === 'reject') {
        setStatusOverrides(prev => ({
          ...prev,
          [id]: { ...(prev[id] || {}), approvalStatus: 'Disputed', ...extraData },
        }));
      } else if (actionType === 'request-changes') {
        // Set status based on changeRequestType
        const changeType = extraData?.changeRequestType;
        const updates = { ...(extraData || {}) };
        if (changeType === 'RECEIPT') {
          updates.receiptStatus = 'Missing';
        } else if (changeType === 'PROJECT_CODE') {
          updates.projectCode = '';
          updates.costCode = '';
        }
        updates.approvalStatus = 'CHANGES_REQUESTED';
        updates.changeRequestReason = extraData?.changeRequestReason || '';
        updates.changeRequestType = changeType || 'OTHER';
        setStatusOverrides(prev => ({
          ...prev,
          [id]: { ...(prev[id] || {}), ...updates },
        }));
      } else if (actionType === 'export') {
        setStatusOverrides(prev => ({
          ...prev,
          [id]: { ...(prev[id] || {}), exportedAt: new Date().toISOString(), ...extraData },
        }));
      } else if (actionType === 'save') {
        // Save edits to master table (receipt, project code, cost code, etc.)
        if (extraData) {
          setStatusOverrides(prev => ({
            ...prev,
            [id]: { ...(prev[id] || {}), ...extraData },
          }));
        }
      } else if (actionType === 'submit-for-approval') {
        // Submit for approval: set PENDING status
        setStatusOverrides(prev => ({
          ...prev,
          [id]: { ...(prev[id] || {}), approvalStatus: 'PENDING', ...(extraData || {}) },
        }));
      } else if (actionType === 'flag') {
        // Toast only, don't close
        return;
      }
    }
    setSelectedTransaction(null);
  }, [selectedTransaction]);

  // Apply status overrides to transactions
  const transactions = useMemo(() => {
    return cardTransactions.map(t => {
      const override = statusOverrides[t.id];
      return override ? { ...t, ...override } : t;
    });
  }, [statusOverrides]);

  const filtered = useMemo(() => {
    let result = transactions;
    if (selectedProject) {
      result = result.filter(t => t.project === selectedProject.name);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.supplier.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q) ||
        t.cardholder.toLowerCase().includes(q) ||
        t.trade.toLowerCase().includes(q)
      );
    }
    // Tab filters using derived status
    if (activeTab === 'For Approval') result = result.filter(t => deriveCardTransactionStatus(t) === 'For Approval');
    if (activeTab === 'Missing Receipt') result = result.filter(t => deriveCardTransactionStatus(t) === 'Missing Receipt');
    if (activeTab === 'Missing Project Code') result = result.filter(t => deriveCardTransactionStatus(t) === 'Missing Project Code');
    if (activeTab === 'Approved') result = result.filter(t => deriveCardTransactionStatus(t) === 'Approved');

    // KPI tile filters (only on Overview tab)
    if (activeTab === 'Overview' && kpiFilter === 'missing-receipts') {
      result = result.filter(t => deriveCardTransactionStatus(t) === 'Missing Receipt');
    }
    if (activeTab === 'Overview' && kpiFilter === 'uncoded') {
      result = result.filter(t => deriveCardTransactionStatus(t) === 'Missing Project Code');
    }
    if (activeTab === 'Overview' && kpiFilter === 'for-approval') {
      result = result.filter(t => deriveCardTransactionStatus(t) === 'For Approval');
    }

    return result;
  }, [transactions, selectedProject, search, activeTab, kpiFilter]);

  // Tab counts derived from shared status helper
  const tabCounts = useMemo(() => ({
    'For Approval': transactions.filter(t => deriveCardTransactionStatus(t) === 'For Approval').length,
    'Missing Receipt': transactions.filter(t => deriveCardTransactionStatus(t) === 'Missing Receipt').length,
    'Missing Project Code': transactions.filter(t => deriveCardTransactionStatus(t) === 'Missing Project Code').length,
    'Approved': transactions.filter(t => deriveCardTransactionStatus(t) === 'Approved').length,
  }), [transactions]);

  function handleKpiClick(filter) {
    if (kpiFilter === filter) {
      setKpiFilter(null);
    } else {
      setKpiFilter(filter);
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    setKpiFilter(null);
  }

  return (
    <div>
      <PageHeader
        breadcrumb="Gan Group Construction"
        title="Construction Card"
        description="Ramp corporate cards for fast, real-time, jobsite purchases."
        bullets={[
          'Tools, supplies, fuel, travel, rentals, and ad-hoc purchases',
          'Cards issued to field managers and supervisors',
          'Project-level controls and tracking',
        ]}
        actions={
          <button className="text-sm px-3 py-2 bg-ramp-gray-900 text-white rounded-lg hover:bg-ramp-gray-800 font-medium flex items-center gap-1.5">
            <CreditCard size={14} />
            Request card
          </button>
        }
      />

      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} counts={tabCounts} />

      <div className="mt-4">
        {activeTab === 'Overview' && (
          <OverviewCards transactions={transactions} onKpiClick={handleKpiClick} />
        )}

        {/* KPI active filter indicator */}
        {activeTab === 'Overview' && kpiFilter && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <AlertTriangle size={14} />
            <span className="font-medium">
              {kpiFilter === 'missing-receipts' ? 'Showing transactions with missing receipts'
                : kpiFilter === 'uncoded' ? 'Showing uncoded transactions'
                : 'Showing transactions for approval'}
            </span>
            <button
              onClick={() => setKpiFilter(null)}
              className="ml-auto text-xs text-amber-600 underline hover:text-amber-800"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Search & main table */}
        <>
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
              <button className="p-2 rounded-lg hover:bg-ramp-gray-50 text-ramp-gray-500"><Download size={16} /></button>
            </div>
          </div>

          <div className="border border-ramp-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ramp-gray-50 border-b border-ramp-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Supplier</th>
                  <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Field Owner</th>
                  <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Trade / Spend Type</th>
                  <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Project</th>
                  <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Project code</th>
                  <th className="text-left px-4 py-3 font-medium text-ramp-gray-500 text-xs uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ramp-gray-100">
                {filtered.map((t) => {
                  const status = deriveCardTransactionStatus(t);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTransaction(t)}
                      className="hover:bg-ramp-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                            status === 'Approved' || status === 'Exported' ? 'bg-ramp-gray-100 text-ramp-gray-600' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {t.supplier.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-ramp-gray-900">{t.supplier}</div>
                            <div className="text-xs text-ramp-gray-500">{t.spendType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ramp-gray-600">{formatDate(t.date)}</td>
                      <td className="px-4 py-3 text-right font-medium text-ramp-gray-900">{formatCurrency(t.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="text-ramp-gray-900">{t.cardholder}</div>
                        <div className="text-xs text-ramp-gray-500">{t.role}</div>
                      </td>
                      <td className="px-4 py-3 text-ramp-gray-600">{t.spendType}</td>
                      <td className="px-4 py-3 text-ramp-gray-700">{t.project}</td>
                      <td className="px-4 py-3 text-ramp-gray-600 font-mono text-xs">{t.projectCode}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-ramp-gray-400 text-sm">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-ramp-gray-50 border-t border-ramp-gray-200 text-xs text-ramp-gray-500 flex justify-between">
              <span>{filtered.length} transactions · Total: {formatCurrency(filtered.reduce((s, t) => s + t.amount, 0))}</span>
              {(() => {
                const uncoded = getUncodedStats(filtered);
                return uncoded.count > 0 ? (
                  <span className="text-amber-600 font-medium">
                    {uncoded.count} uncoded · {formatCurrency(uncoded.total)} missing project/cost code
                  </span>
                ) : (
                  <span className="text-emerald-600">All transactions coded</span>
                );
              })()}
            </div>
          </div>
        </>
      </div>

      {/* Transaction Detail Drawer */}
      {selectedTransaction && (
        <TransactionDrawer
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onAction={handleDrawerAction}
        />
      )}

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={handleDismissToast} />
    </div>
  );
}
