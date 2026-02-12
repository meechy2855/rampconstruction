/**
 * Type guards for procurement entities
 */

/**
 * Determines if a procurement item is a Purchase Request or Purchase Order
 * based on its status and conversion state
 */
export function isPurchaseRequest(item) {
  if (!item) return false;

  // If explicitly marked as entityType
  if (item.entityType) {
    return item.entityType === 'request';
  }

  // Otherwise infer from status - requests have request-specific statuses
  const requestStatuses = ['Draft', 'For approval', 'Changes Requested', 'Rejected'];
  return requestStatuses.includes(item.status);
}

export function isPurchaseOrder(item) {
  if (!item) return false;

  // If explicitly marked as entityType
  if (item.entityType) {
    return item.entityType === 'purchase-order';
  }

  // Otherwise infer - if approved/converted, it's a PO
  const poStatuses = ['Approved', 'Converted', 'Card Issued'];
  return poStatuses.includes(item.status);
}

/**
 * Get the display ID for the item
 */
export function getDisplayId(item) {
  if (!item) return '';

  if (isPurchaseRequest(item)) {
    return `Request #${item.id}`;
  }

  if (isPurchaseOrder(item)) {
    return `PO-${String(item.id).padStart(4, '0')}`;
  }

  return `#${item.id}`;
}

/**
 * Get the display name (without the PR#/PO# prefix)
 */
export function getDisplayName(item) {
  if (!item || !item.name) return '';

  // Remove PR# or PO# prefix from name
  return item.name.replace(/^(PR#|PO#)\s*\d+\s*[–-]\s*/, '');
}

/**
 * Derive Purchase Order status from invoicing state
 * Status is derived ONLY from invoicing, not matching or other factors
 */
export function derivePOStatus(po) {
  if (!po) return 'Draft';

  // Check if PO is cancelled
  if (po.cancelled === true) {
    return 'Cancelled';
  }

  // Check if PO is closed
  if (po.closed === true) {
    return 'Closed';
  }

  // Check if PO is in draft state (not yet issued)
  if (po.draft === true || po.status === 'Draft') {
    return 'Draft';
  }

  const committedAmount = po.totalAmount || 0;
  const invoicedAmount = po.billedAmount || 0;

  // If nothing invoiced, PO is issued/open
  if (invoicedAmount === 0) {
    return 'Issued';
  }

  // If invoiced amount is less than committed, partially invoiced
  if (invoicedAmount < committedAmount) {
    return 'Partially invoiced';
  }

  // If invoiced amount equals or exceeds committed, fully invoiced
  return 'Fully invoiced';
}
