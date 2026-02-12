import { useState } from 'react';
import {
  X, ArrowLeft, AlertTriangle, Check, Clock,
  Edit3, Ban, Lock, Flag, MessageSquare,
  DollarSign, FileText, Send, ArrowUpRight,
  Receipt, Shield, ExternalLink, Download, Eye,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { projects, costCodes, bills } from '../data/mockData';
import { getDisplayName, derivePOStatus } from '../utils/procurementTypeGuards';

/* ─── Helpers ─── */
function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}
function fmtDate(d) {
  if (!d) return '—';
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

const roleColors = {
  'Project Manager': 'bg-blue-600',
  'Project Executive': 'bg-indigo-600',
  'Site Supervisor': 'bg-amber-600',
  'Accounting Lead': 'bg-emerald-600',
  Controller: 'bg-purple-600',
  'Purchasing Manager': 'bg-orange-600',
  Foreman: 'bg-amber-700',
  Supervisor: 'bg-teal-600',
};

function getAvatarColor(role) {
  return roleColors[role] || 'bg-stone-500';
}

/* ═══════════════════════════════════════════════
   TAB 1: Overview (PO Summary)
   ═══════════════════════════════════════════════ */
function OverviewTab({ po }) {
  const invoicedAmount = po.billedAmount || 0;
  const remaining = po.totalAmount - invoicedAmount;
  const pctInvoiced = po.totalAmount ? (invoicedAmount / po.totalAmount) * 100 : 0;

  return (
    <div>
      {/* Supplier */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-sm font-semibold text-stone-600`}>
          {po.supplier ? initials(po.supplier) : '?'}
        </div>
        <div>
          <div className="text-sm font-medium text-stone-900">{po.supplier || 'No supplier'}</div>
          <div className="text-xs text-stone-500 uppercase tracking-wide">Supplier</div>
        </div>
      </div>

      <FieldCard label="Trade / Category" value={po.category} verified sub={po.trade} />
      <FieldCard label="Total PO Amount" value={fmt(po.totalAmount)} verified />
      <FieldCard label="Term" value={po.term || 'One-time'} verified />

      {(po.startDate || po.endDate) && (
        <FieldCard
          label="Start / End Date"
          value={`${po.startDate ? fmtDate(po.startDate) : '—'} → ${po.endDate ? fmtDate(po.endDate) : '—'}`}
          verified={!!(po.startDate && po.endDate)}
        />
      )}

      <FieldCard label="Payment Method" value={po.paymentMethod || '—'} verified={!!po.paymentMethod} />

      <Divider />

      {/* Indicators */}
      <SectionTitle>Spend Tracking</SectionTitle>

      <div className="bg-stone-50 rounded-lg px-4 py-3 border border-stone-200">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-xs text-stone-500">Invoiced to date</div>
          <div className="text-xs text-stone-500">{pctInvoiced.toFixed(0)}%</div>
        </div>
        <div className="w-full bg-stone-200 rounded-full h-2.5 mb-2">
          <div
            className={`h-2.5 rounded-full transition-all ${pctInvoiced > 100 ? 'bg-red-500' : pctInvoiced > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(pctInvoiced, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-stone-600">{fmt(invoicedAmount)} invoiced</span>
          <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-stone-800'}`}>
            {fmt(remaining)} remaining
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 2: Commitments (Construction-Native)
   ═══════════════════════════════════════════════ */
function CommitmentsTab({ po }) {
  const lineItems = po.lineItems || [];
  const totalCommitted = lineItems.reduce((s, li) => s + li.committed, 0);
  const totalInvoiced = lineItems.reduce((s, li) => s + li.invoiced, 0);

  return (
    <div>
      <SectionTitle right={
        <span className="text-xs text-stone-500">{lineItems.length} line item{lineItems.length !== 1 ? 's' : ''}</span>
      }>
        Commitments
      </SectionTitle>

      {lineItems.length > 0 ? (
        <div className="border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-stone-500 text-xs uppercase tracking-wide">Line Item</th>
                <th className="text-right px-4 py-2.5 font-medium text-stone-500 text-xs uppercase tracking-wide">Committed</th>
                <th className="text-right px-4 py-2.5 font-medium text-stone-500 text-xs uppercase tracking-wide">Invoiced</th>
                <th className="text-right px-4 py-2.5 font-medium text-stone-500 text-xs uppercase tracking-wide">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {lineItems.map(li => {
                const rem = li.committed - li.invoiced;
                const costCode = costCodes.find(c => c.code === li.costCode);
                return (
                  <tr key={li.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <div className="text-stone-900 font-medium">{li.name}</div>
                      <div className="text-xs text-stone-500">{costCode ? `${costCode.code} — ${costCode.name}` : li.costCode}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-stone-700">{fmt(li.committed)}</td>
                    <td className="px-4 py-3 text-right text-stone-700">{fmt(li.invoiced)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${rem < 0 ? 'text-red-600' : 'text-stone-900'}`}>{fmt(rem)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-stone-50 border-t border-stone-200">
              <tr>
                <td className="px-4 py-2.5 font-semibold text-stone-900 text-xs uppercase">Total</td>
                <td className="px-4 py-2.5 text-right font-semibold text-stone-900">{fmt(totalCommitted)}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-stone-900">{fmt(totalInvoiced)}</td>
                <td className={`px-4 py-2.5 text-right font-semibold ${totalCommitted - totalInvoiced < 0 ? 'text-red-600' : 'text-stone-900'}`}>
                  {fmt(totalCommitted - totalInvoiced)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center">
          <div className="text-sm text-stone-500">No line items committed yet</div>
          <div className="text-xs text-stone-400 mt-1">Commitments will appear after PO conversion</div>
        </div>
      )}

      <div className="text-xs text-stone-500 flex items-start gap-1.5 mt-3">
        <Shield size={11} className="shrink-0 mt-0.5" />
        Critical for cash forecasting and preventing over-billing.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   View Invoices Modal (for closed POs)
   ═══════════════════════════════════════════════ */
function ViewInvoicesModal({ po, onClose }) {
  const linkedInvoices = (po.invoices || []).filter(inv => inv.poId === String(po.id));
  const totalInvoiced = linkedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalRetainage = linkedInvoices.reduce((sum, inv) => sum + (inv.retainage || 0), 0);

  const lienWaiverColor = (status) => {
    if (status === 'Received') return 'text-emerald-600';
    if (status === 'Pending') return 'text-amber-600';
    return 'text-stone-400';
  };

  const getBillPayStatusColor = (status) => {
    if (status === 'PAID') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'SCHEDULED') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (status === 'FOR_APPROVAL') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-stone-50 text-stone-700 border-stone-200';
  };

  const getBillPayStatusLabel = (status) => {
    if (status === 'PAID') return 'Paid';
    if (status === 'SCHEDULED') return 'Scheduled';
    if (status === 'FOR_APPROVAL') return 'For Approval';
    return 'Draft';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-stone-200 z-50 w-[600px] max-h-[700px] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Linked Invoices</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
              <X size={18} />
            </button>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            {linkedInvoices.length} invoice{linkedInvoices.length !== 1 ? 's' : ''} linked to {po.name}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {linkedInvoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt size={32} className="mx-auto text-stone-300 mb-2" />
              <p className="text-sm text-stone-500">No invoices linked to this PO</p>
            </div>
          ) : (
            <div className="space-y-3">
              {linkedInvoices.map(inv => (
                <div key={inv.id} className="border border-stone-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Receipt size={14} className="text-stone-500" />
                      <span className="text-sm font-semibold text-stone-900">{inv.number}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {inv.exception && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle size={10} className="mr-1" />
                          Over-billing
                        </span>
                      )}
                      {inv.billPay && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBillPayStatusColor(inv.billPay.status)}`}>
                          {getBillPayStatusLabel(inv.billPay.status)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                    <div>
                      <div className="text-stone-500">Invoice Amount</div>
                      <div className="text-stone-900 font-semibold">{fmt(inv.amount)}</div>
                    </div>
                    <div>
                      <div className="text-stone-500">Retainage</div>
                      <div className="text-stone-900 font-medium">{fmt(inv.retainage || 0)}</div>
                    </div>
                    <div>
                      <div className="text-stone-500">Invoice Date</div>
                      <div className="text-stone-900">{fmtShort(inv.date)}</div>
                    </div>
                  </div>

                  {/* Lien waiver */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-stone-100">
                    <Shield size={12} className={lienWaiverColor(inv.lienWaiver)} />
                    <span className={`text-xs font-medium ${lienWaiverColor(inv.lienWaiver)}`}>
                      Lien waiver: {inv.lienWaiver || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {linkedInvoices.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-stone-700">Total Invoiced:</span>
                <span className="font-semibold text-stone-900">{fmt(totalInvoiced)}</span>
              </div>
              {totalRetainage > 0 && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="font-medium text-stone-700">Total Retainage:</span>
                  <span className="font-semibold text-stone-900">{fmt(totalRetainage)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="font-medium text-stone-700">PO Amount:</span>
                <span className="font-semibold text-stone-900">{fmt(po.totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1 pt-2 border-t border-stone-100">
                <span className="font-medium text-stone-700">Remaining:</span>
                <span className={`font-semibold ${po.totalAmount - totalInvoiced < 0 ? 'text-red-600' : 'text-stone-900'}`}>
                  {fmt(po.totalAmount - totalInvoiced)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 px-6 py-3 flex items-center justify-end">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   Match Invoice Modal (Link Invoice to PO)
   ═══════════════════════════════════════════════ */
function MatchInvoiceModal({ po, onClose, onMatch }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [flagOverbilling, setFlagOverbilling] = useState(false);

  // Get IDs of invoices already linked to this PO
  const linkedInvoiceIds = (po.invoices || [])
    .filter(inv => inv.poId === String(po.id))
    .map(inv => inv.id);

  // Find unlinked invoices for the same supplier, excluding already-linked ones
  const unmatchedInvoices = bills.filter(
    bill => bill.vendor === po.supplier &&
            !bill.poId &&
            !linkedInvoiceIds.includes(bill.id)
  );

  const remaining = po.totalAmount - (po.billedAmount || 0);
  const wouldExceed = selectedInvoice && selectedInvoice.amount > remaining;
  const excess = wouldExceed ? selectedInvoice.amount - remaining : 0;

  const handleSelect = (invoice) => {
    setSelectedInvoice(invoice);
    setFlagOverbilling(false);
  };

  const handleMatch = () => {
    if (!selectedInvoice) return;

    // If over-billing but not flagged, prevent match
    if (wouldExceed && !flagOverbilling) return;

    onMatch(selectedInvoice, flagOverbilling);
    onClose();
  };

  const canMatch = selectedInvoice && (!wouldExceed || flagOverbilling);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-stone-200 z-50 w-[500px] max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Link Invoice to PO</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
              <X size={18} />
            </button>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Select an unlinked invoice for {po.supplier}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {unmatchedInvoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt size={32} className="mx-auto text-stone-300 mb-2" />
              <p className="text-sm text-stone-500">No unmatched invoices found for {po.supplier}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {unmatchedInvoices.map((invoice) => {
                const isSelected = selectedInvoice?.id === invoice.id;
                const thisWouldExceed = invoice.amount > remaining;
                return (
                  <button
                    key={invoice.id}
                    onClick={() => handleSelect(invoice)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-stone-900">{invoice.invoiceNumber}</span>
                      <span className="text-sm font-semibold text-stone-900">{fmt(invoice.amount)}</span>
                    </div>
                    <div className="text-xs text-stone-500">
                      {fmtShort(invoice.invoiceDate)} · {invoice.project}
                    </div>
                    {thisWouldExceed && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-red-600">
                        <AlertTriangle size={12} />
                        Exceeds remaining by {fmt(invoice.amount - remaining)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* PO Summary */}
          <div className="mt-4 pt-4 border-t border-stone-200">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-stone-500">PO Committed</div>
                <div className="text-stone-900 font-medium">{fmt(po.totalAmount)}</div>
              </div>
              <div>
                <div className="text-stone-500">Remaining</div>
                <div className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-stone-900'}`}>
                  {fmt(remaining)}
                </div>
              </div>
            </div>
          </div>

          {/* Over-billing Warning & Override */}
          {wouldExceed && (
            <div className="mt-3 space-y-2">
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-red-700 font-medium block">Invoice exceeds remaining PO by {fmt(excess)}</span>
                  <span className="text-xs text-red-600 block mt-0.5">Linking will flag this invoice for over-billing review.</span>
                </div>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagOverbilling}
                  onChange={(e) => setFlagOverbilling(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-xs text-stone-700">Flag over-billing and link anyway</span>
              </label>
            </div>
          )}
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
            onClick={handleMatch}
            disabled={!canMatch}
            className="text-sm px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Check size={14} />
            Link Invoice
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   TAB 3: Invoices (PO → AP Bridge)
   ═══════════════════════════════════════════════ */
function InvoicesTab({ po, onOpenMatchModal, onFlagInvoice, onSendToBillPay, onRemoveInvoice }) {
  const [showUnlinked, setShowUnlinked] = useState(false);

  // Linked invoices: invoices with poId matching this PO
  const linkedInvoices = (po.invoices || []).filter(inv => inv.poId === String(po.id));

  // Unlinked invoices: bills from same vendor (and project) with no poId
  const unlinkedInvoices = bills.filter(
    bill => bill.vendor === po.supplier && !bill.poId && bill.projectId === po.projectId
  );

  const lienWaiverColor = (status) => {
    if (status === 'Received') return 'text-emerald-600';
    if (status === 'Pending') return 'text-amber-600';
    return 'text-stone-400';
  };

  const getBillPayStatusColor = (status) => {
    if (status === 'PAID') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'SCHEDULED') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (status === 'FOR_APPROVAL') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-stone-50 text-stone-700 border-stone-200';
  };

  const getBillPayStatusLabel = (status) => {
    if (status === 'PAID') return 'Paid';
    if (status === 'SCHEDULED') return 'Scheduled';
    if (status === 'FOR_APPROVAL') return 'For Approval';
    return 'Draft';
  };

  const canSendToBillPay = (inv) => {
    // Must be linked, matched, no exception, and lien waiver received if required
    return inv.poId === String(po.id) &&
           inv.matchStatus === 'MATCHED' &&
           !inv.exception &&
           (inv.lienWaiver === 'Received' || inv.lienWaiver !== 'Pending');
  };

  return (
    <div>
      {/* Linked Invoices */}
      <SectionTitle right={
        <span className="text-xs text-stone-500">{linkedInvoices.length} linked</span>
      }>
        Linked Invoices
      </SectionTitle>

      {linkedInvoices.length > 0 ? (
        <div className="space-y-3">
          {linkedInvoices.map(inv => (
            <div key={inv.id} className="border border-stone-200 rounded-xl p-4 hover:bg-stone-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Receipt size={14} className="text-stone-500" />
                  <span className="text-sm font-medium text-stone-900">{inv.number}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {inv.exception && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      <AlertTriangle size={10} className="mr-1" />
                      Over-billing flagged
                    </span>
                  )}
                  {inv.billPay && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBillPayStatusColor(inv.billPay.status)}`}>
                      Bill Pay: {getBillPayStatusLabel(inv.billPay.status)}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-stone-500">Amount</div>
                  <div className="text-stone-900 font-medium">{fmt(inv.amount)}</div>
                </div>
                <div>
                  <div className="text-stone-500">Retainage</div>
                  <div className="text-stone-900 font-medium">{fmt(inv.retainage || 0)}</div>
                </div>
                <div>
                  <div className="text-stone-500">Date</div>
                  <div className="text-stone-900">{fmtShort(inv.date)}</div>
                </div>
              </div>

              {/* Lien waiver */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className={lienWaiverColor(inv.lienWaiver)} />
                  <span className={`text-xs font-medium ${lienWaiverColor(inv.lienWaiver)}`}>
                    Lien waiver: {inv.lienWaiver || 'N/A'}
                  </span>
                </div>

                {/* Invoice Actions */}
                <div className="flex items-center gap-1">
                  {inv.exception && (
                    <button
                      onClick={() => onFlagInvoice(inv, false)}
                      className="text-xs px-2 py-1 border border-stone-200 rounded hover:bg-stone-100 text-stone-600"
                      title="Clear exception"
                    >
                      Clear flag
                    </button>
                  )}
                  {!inv.billPay && (
                    <button
                      onClick={() => onSendToBillPay(inv)}
                      disabled={!canSendToBillPay(inv)}
                      className="text-xs px-2 py-1 border border-stone-200 rounded hover:bg-stone-100 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      title={!canSendToBillPay(inv) ? 'Invoice must be matched and exception-free' : 'Send to Bill Pay'}
                    >
                      <Send size={10} /> Send to Bill Pay
                    </button>
                  )}
                  <button
                    onClick={() => onRemoveInvoice(inv)}
                    className="text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50 text-red-600 flex items-center gap-1"
                    title="Remove invoice from PO"
                  >
                    <X size={10} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center">
          <div className="text-sm text-stone-500">No invoices linked yet</div>
          <div className="text-xs text-stone-400 mt-1">Link invoices from the Unlinked section below</div>
        </div>
      )}

      <Divider />

      {/* Unlinked Invoices (Collapsible) */}
      <div>
        <button
          onClick={() => setShowUnlinked(!showUnlinked)}
          className="w-full flex items-center justify-between group mb-3"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Unlinked Invoices</h2>
            <span className="text-xs text-stone-500">{unlinkedInvoices.length} available</span>
          </div>
          <div className="flex items-center gap-2">
            {unlinkedInvoices.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onOpenMatchModal(); }}
                className="text-xs border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-1"
              >
                <DollarSign size={12} /> Link invoice
              </button>
            )}
            <span className={`text-xs text-stone-400 transition-transform ${showUnlinked ? 'rotate-180' : ''}`}>▼</span>
          </div>
        </button>

        {showUnlinked && (
          <div className="space-y-2">
            {unlinkedInvoices.length > 0 ? (
              unlinkedInvoices.map(inv => (
                <div key={inv.id} className="border border-stone-200 rounded-lg p-3 bg-stone-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-stone-900">{inv.invoiceNumber}</div>
                      <div className="text-xs text-stone-500">{fmtShort(inv.invoiceDate)} · {inv.project}</div>
                    </div>
                    <div className="text-sm font-semibold text-stone-900">{fmt(inv.amount)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-stone-500">
                No unlinked invoices for {po.supplier}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 4: Accounting
   ═══════════════════════════════════════════════ */
function AccountingTab({ po }) {
  const costCode = costCodes.find(c => c.code === po.costCode);
  const isOverInvoiced = po.billedAmount > po.totalAmount;
  const isExportReady = po.exportStatus === 'Exported';

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
          ? <><Check size={14} className="text-emerald-600" /><span className="text-xs font-medium text-emerald-700">Exported to accounting system</span></>
          : <><AlertTriangle size={14} className="text-amber-600" /><span className="text-xs font-medium text-amber-700">Export: {po.exportStatus || 'Not exported'}</span></>
        }
      </div>

      <FieldCard label="Project" value={po.project} verified />
      <FieldCard label="Cost Code(s)" value={costCode ? `${costCode.code} — ${costCode.name}` : po.costCode || '—'} verified={!!po.costCode} />
      <FieldCard
        label="Category"
        value={po.category}
        verified
        rightLabel="Accounting Category"
        rightValue={po.accountingCategory || '—'}
        rightVerified={!!po.accountingCategory}
      />
      <FieldCard
        label="Supplier"
        value={po.supplier || '—'}
        verified={!!po.supplier}
        rightLabel="Vendor Mapping"
        rightValue={po.vendorMapping || '—'}
        rightVerified={!!po.vendorMapping}
      />
      <FieldCard label="Export Status" value={po.exportStatus || 'Not exported'} verified={po.exportStatus === 'Exported'} />

      <Divider />

      <SectionTitle>Enforcement</SectionTitle>
      <div className="space-y-2">
        {[
          { label: 'Cost code assigned', ok: !!po.costCode, okText: 'Complete', failText: 'Missing' },
          { label: 'Vendor mapping', ok: !!po.vendorMapping, okText: 'Mapped', failText: 'Not mapped' },
          { label: 'Over-invoicing check', ok: !isOverInvoiced, okText: 'Within limit', failText: `Over by ${fmt(po.billedAmount - po.totalAmount)}` },
          { label: 'Cost code match', ok: true, okText: 'Consistent', failText: 'Mismatch detected' },
        ].map((rule, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-stone-50 border border-stone-200">
            {rule.ok ? <Check size={14} className="text-emerald-600" /> : <AlertTriangle size={14} className="text-amber-600" />}
            <span className="text-sm text-stone-700">{rule.label}</span>
            <span className={`ml-auto text-xs font-medium ${rule.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
              {rule.ok ? rule.okText : rule.failText}
            </span>
          </div>
        ))}
      </div>

      <div className="text-xs text-stone-500 flex items-start gap-1.5 mt-4">
        <Lock size={11} className="shrink-0 mt-0.5" />
        Invoicing beyond PO value is blocked. Cost code mismatches trigger warnings.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 5: Activity (Audit Trail)
   ═══════════════════════════════════════════════ */
function ActivityTab({ po }) {
  const activities = po.activity || [];
  const iconMap = {
    'created': FileText,
    'Approved': Check,
    'Converted': Send,
    'matched': DollarSign,
    'sent': Clock,
    'Draft': Edit3,
    'Closed': Lock,
    'Invoice': Receipt,
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
   Main Purchase Order Drawer
   ═══════════════════════════════════════════════ */
const TABS = ['Overview', 'Commitments', 'Invoices', 'Accounting', 'Activity'];

/* ─── Editable Field ─── */
function EditableFieldCard({ label, value, onChange, type = 'text', options = null }) {
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

export default function PurchaseOrderDrawer({ po, onClose, onAction }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showViewInvoicesModal, setShowViewInvoicesModal] = useState(false);

  // Editable fields - ALL PO fields
  const [edits, setEdits] = useState({
    name: po?.name || '',
    project: po?.project || '',
    projectId: po?.projectId || '',
    supplier: po?.supplier || '',
    totalAmount: po?.totalAmount?.toString() || '',
    costCode: po?.costCode || '',
    category: po?.category || '',
    paymentMethod: po?.paymentMethod || '',
    term: po?.term || '',
    description: po?.description || '',
    jobPhase: po?.jobPhase || '',
    trade: po?.trade || '',
  });
  const [savedEdits, setSavedEdits] = useState({ ...edits });

  const isDirty = JSON.stringify(edits) !== JSON.stringify(savedEdits);

  const handleEditField = (key, value) => {
    setEdits(prev => ({ ...prev, [key]: value }));
  };

  // Prepare edits for saving - convert types as needed
  const prepareEditsForSave = () => {
    return {
      ...edits,
      totalAmount: edits.totalAmount ? parseFloat(edits.totalAmount) : 0,
      projectId: edits.projectId ? parseInt(edits.projectId) : undefined,
    };
  };

  const handleSave = () => {
    setSavedEdits({ ...edits });
    setIsEditing(false);
    onAction?.('save-po', `Saved changes to ${po.name}`, { edits: prepareEditsForSave() });
  };

  const handleDiscard = () => {
    setEdits({ ...savedEdits });
    setIsEditing(false);
  };

  const handleAction = (type, message) => {
    onAction?.(type, message);
  };

  const handleMatchInvoice = (invoice, flagOverbilling) => {
    // Link invoice to PO and update totals
    const message = flagOverbilling
      ? `Linked invoice ${invoice.invoiceNumber} with over-billing flag`
      : `Linked invoice ${invoice.invoiceNumber} to PO-${String(po.id).padStart(4, '0')}`;

    // Pass invoice data to update the master table
    onAction?.('match-invoice', message, {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceAmount: invoice.amount,
      flagOverbilling,
    });
  };

  const handleFlagInvoice = (invoice, flag) => {
    const message = flag
      ? `Flagged invoice ${invoice.number} for over-billing`
      : `Cleared over-billing flag on invoice ${invoice.number}`;
    onAction?.('flag-invoice', message);
  };

  const handleSendToBillPay = (invoice) => {
    onAction?.('send-to-billpay', `Sent invoice ${invoice.number} to Bill Pay`);
  };

  const handleRemoveInvoice = (invoice) => {
    onAction?.('remove-invoice', `Removed invoice ${invoice.number} from PO`, {
      invoiceId: invoice.id,
      invoiceAmount: invoice.amount,
    });
    setShowMatchModal(false);
  };

  if (!po) return null;

  const remaining = po.totalAmount - (po.billedAmount || 0);
  const derivedStatus = derivePOStatus(po);

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
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs border border-stone-200 rounded-md px-2.5 py-1 hover:bg-stone-50 text-stone-600 font-medium flex items-center gap-1"
                >
                  <Edit3 size={12} /> Edit
                </button>
              )}
              <button
                onClick={() => handleAction('close-po', `Closed PO — ${po.name}`)}
                className="text-xs border border-stone-200 rounded-md px-2.5 py-1 hover:bg-stone-50 text-red-600 font-medium flex items-center gap-1"
              >
                <Lock size={12} /> Close PO
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* PO number + status */}
          <div className="text-lg font-semibold text-stone-900 tracking-tight">
            PO-{String(po.id).padStart(4, '0')} — {po.supplier || getDisplayName(po)}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <StatusBadge status={derivedStatus} />
            <span className="text-sm text-stone-500">·</span>
            <span className="text-sm text-stone-900 font-medium">{fmt(po.totalAmount)}</span>
            <span className="text-sm text-stone-500">committed</span>
          </div>

          {/* Remaining + project */}
          <div className="flex items-center gap-3 mt-2">
            <div className={`text-sm font-medium ${remaining < 0 ? 'text-red-600' : 'text-stone-600'}`}>
              {fmt(remaining)} remaining
            </div>
            <span className="text-stone-300">·</span>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">{po.project}</button>
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
              <SectionTitle>Edit Purchase Order</SectionTitle>

              {/* Basic Info */}
              <EditableFieldCard label="PO Name" value={edits.name} onChange={v => handleEditField('name', v)} />
              <EditableFieldCard label="Supplier" value={edits.supplier} onChange={v => handleEditField('supplier', v)} />
              <EditableFieldCard label="PO Amount" value={edits.totalAmount} onChange={v => handleEditField('totalAmount', v)} type="number" />
              <EditableFieldCard label="Category / Trade" value={edits.category} onChange={v => handleEditField('category', v)} />
              <EditableFieldCard label="Payment Method" value={edits.paymentMethod} onChange={v => handleEditField('paymentMethod', v)} />
              <EditableFieldCard label="Term" value={edits.term} onChange={v => handleEditField('term', v)} />

              <Divider />

              {/* Project Context */}
              <SectionTitle>Project Context</SectionTitle>
              <EditableFieldCard
                label="Project"
                value={edits.projectId}
                onChange={v => {
                  handleEditField('projectId', v);
                  const proj = projects.find(p => p.id === parseInt(v));
                  if (proj) handleEditField('project', proj.name);
                }}
                options={projects.map(p => ({ value: String(p.id), label: `${p.name} (${p.code})` }))}
              />
              <EditableFieldCard
                label="Cost Code"
                value={edits.costCode}
                onChange={v => handleEditField('costCode', v)}
                options={costCodes.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
              />
              <EditableFieldCard label="Job Phase" value={edits.jobPhase} onChange={v => handleEditField('jobPhase', v)} />
              <EditableFieldCard label="Trade" value={edits.trade} onChange={v => handleEditField('trade', v)} />

              <Divider />

              {/* Description */}
              <SectionTitle>Description</SectionTitle>
              <textarea
                value={edits.description}
                onChange={e => handleEditField('description', e.target.value)}
                rows={4}
                placeholder="Enter PO description..."
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
              />
            </div>
          ) : (
            <>
              {activeTab === 'Overview' && <OverviewTab po={po} />}
              {activeTab === 'Commitments' && <CommitmentsTab po={po} />}
              {activeTab === 'Invoices' && (
                <InvoicesTab
                  po={po}
                  onOpenMatchModal={() => setShowMatchModal(true)}
                  onFlagInvoice={handleFlagInvoice}
                  onSendToBillPay={handleSendToBillPay}
                  onRemoveInvoice={handleRemoveInvoice}
                />
              )}
              {activeTab === 'Accounting' && <AccountingTab po={po} />}
              {activeTab === 'Activity' && <ActivityTab po={po} />}
            </>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="border-t border-stone-200 px-6 py-3 bg-white shrink-0">
          {(isEditing || isDirty) ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-stone-500">You have unsaved changes</span>
              <div className="flex items-center gap-2">
                <button onClick={handleDiscard} className="text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 font-medium">
                  Discard
                </button>
                <button onClick={handleSave} className="flex items-center gap-1.5 text-sm bg-stone-900 text-white rounded-lg px-5 py-2 hover:bg-stone-800 font-medium">
                  <Check size={13} /> Save changes
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* DRAFT */}
              {derivedStatus === 'Draft' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleAction('issue-po', `Issued ${po.name}`)}
                      className="flex items-center gap-2 text-sm bg-stone-900 text-white rounded-lg px-5 py-2.5 hover:bg-stone-800 font-medium"
                    >
                      <Send size={14} /> Issue PO
                    </button>
                    <button
                      onClick={() => handleAction('edit-po', `Editing ${po.name}`)}
                      className="flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2.5 hover:bg-stone-50 font-medium"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleAction('cancel-po', `Cancelled ${po.name}`)}
                      className="flex items-center gap-2 text-sm text-red-600 border border-red-200 rounded-lg px-4 py-2.5 hover:bg-red-50 font-medium"
                    >
                      <Ban size={14} /> Cancel
                    </button>
                  </div>
                  <div className="text-xs text-stone-500 text-center">
                    💡 Issue this PO to formally commit spend with the vendor.
                  </div>
                </div>
              )}

              {/* ISSUED */}
              {derivedStatus === 'Issued' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setShowMatchModal(true)}
                      className="flex items-center gap-2 text-sm bg-stone-900 text-white rounded-lg px-5 py-2.5 hover:bg-stone-800 font-medium"
                    >
                      <Receipt size={14} /> Link invoice
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2.5 hover:bg-stone-50 font-medium"
                    >
                      <Edit3 size={14} /> Amend PO
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleAction('cancel-po', `Cancelled ${po.name}`)}
                      className="flex items-center gap-1.5 text-xs text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50"
                    >
                      <Ban size={12} /> Cancel PO
                    </button>
                    <button
                      onClick={() => handleAction('download-po-pdf', `Downloaded PO PDF for ${po.name}`)}
                      className="flex items-center gap-1.5 text-xs text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50"
                    >
                      <Download size={12} /> Download PO PDF
                    </button>
                  </div>
                  <div className="text-xs text-stone-500 text-center">
                    💡 Awaiting invoice from vendor. Link invoices as they are received.
                  </div>
                </div>
              )}

              {/* PARTIALLY INVOICED */}
              {derivedStatus === 'Partially invoiced' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setShowMatchModal(true)}
                      className="flex items-center gap-2 text-sm bg-stone-900 text-white rounded-lg px-5 py-2.5 hover:bg-stone-800 font-medium"
                    >
                      <Receipt size={14} /> Link invoice
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2.5 hover:bg-stone-50 font-medium"
                    >
                      <Edit3 size={14} /> Amend PO
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleAction('close-po', `Closed ${po.name}`)}
                      className="flex items-center gap-1.5 text-xs text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50"
                    >
                      <Lock size={12} /> Close PO
                    </button>
                    <button
                      onClick={() => handleAction('download-po-pdf', `Downloaded PO PDF for ${po.name}`)}
                      className="flex items-center gap-1.5 text-xs text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50"
                    >
                      <Download size={12} /> Download PO PDF
                    </button>
                  </div>
                  <div className="text-xs text-stone-500 text-center">
                    💡 Additional invoices can be linked until the PO is fully invoiced.
                  </div>
                </div>
              )}

              {/* FULLY INVOICED */}
              {derivedStatus === 'Fully invoiced' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleAction('close-po', `Closed ${po.name}`)}
                      className="flex items-center gap-2 text-sm bg-stone-900 text-white rounded-lg px-5 py-2.5 hover:bg-stone-800 font-medium"
                    >
                      <Lock size={14} /> Close PO
                    </button>
                    <button
                      onClick={() => setShowViewInvoicesModal(true)}
                      className="flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2.5 hover:bg-stone-50 font-medium"
                    >
                      <Eye size={14} /> View linked invoices
                    </button>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => handleAction('download-po-pdf', `Downloaded PO PDF for ${po.name}`)}
                      className="flex items-center gap-1.5 text-xs text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50"
                    >
                      <Download size={12} /> Download PO PDF
                    </button>
                  </div>
                  <div className="text-xs text-stone-500 text-center">
                    💡 This PO has been fully invoiced. Close it when no further changes are expected.
                  </div>
                </div>
              )}

              {/* CLOSED */}
              {derivedStatus === 'Closed' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setShowViewInvoicesModal(true)}
                      className="flex items-center gap-2 text-sm bg-stone-900 text-white rounded-lg px-5 py-2.5 hover:bg-stone-800 font-medium"
                    >
                      <Eye size={14} /> View invoices
                    </button>
                    <button
                      onClick={() => handleAction('download-po-pdf', `Downloaded PO PDF for ${po.name}`)}
                      className="flex items-center gap-2 text-sm text-stone-600 border border-stone-200 rounded-lg px-4 py-2.5 hover:bg-stone-50 font-medium"
                    >
                      <Download size={14} /> Download PO PDF
                    </button>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => handleAction('reopen-po', `Reopened ${po.name}`)}
                      className="flex items-center gap-1.5 text-xs text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50"
                    >
                      <ArrowUpRight size={12} /> Reopen (admin only)
                    </button>
                  </div>
                  <div className="text-xs text-stone-500 text-center">
                    💡 This PO is closed and no further spend is allowed.
                  </div>
                </div>
              )}

              {/* CANCELLED */}
              {derivedStatus === 'Cancelled' && (
                <div className="flex flex-col gap-3">
                  <div className="text-sm text-stone-600 text-center py-2">
                    This PO has been cancelled. No actions available.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Match Invoice Modal */}
      {showMatchModal && (
        <MatchInvoiceModal
          po={po}
          onClose={() => setShowMatchModal(false)}
          onMatch={handleMatchInvoice}
        />
      )}

      {/* View Invoices Modal */}
      {showViewInvoicesModal && (
        <ViewInvoicesModal
          po={po}
          onClose={() => setShowViewInvoicesModal(false)}
        />
      )}

      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
