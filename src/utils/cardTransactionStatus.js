/**
 * Shared Card Transaction Status Derivation
 *
 * Priority rules (most important first):
 * 1. If exportedAt != null => "Exported"
 * 2. If approvalStatus === 'PENDING' => "For Approval"
 * 3. If missing receipt => "Missing Receipt"
 * 4. If missing project/cost code => "Missing Project Code"
 * 5. If approvalStatus === 'APPROVED' or 'Approved' => "Approved"
 * 6. Else => "For Approval" (default — needs review)
 */

export function deriveCardTransactionStatus(transaction) {
  if (!transaction) return 'For Approval';

  // 1. Exported takes highest priority
  if (transaction.exportedAt) {
    return 'Exported';
  }

  // 2. Explicit pending / for-approval
  if (transaction.approvalStatus === 'PENDING') {
    return 'For Approval';
  }

  // 3. Missing receipt
  const hasReceipt = transaction.receiptStatus === 'Attached';
  if (!hasReceipt) {
    return 'Missing Receipt';
  }

  // 4. Missing project / cost code
  const hasProject = transaction.projectId || transaction.projectCode;
  const hasCostCode = transaction.costCode;
  if (!hasProject || !hasCostCode) {
    return 'Missing Project Code';
  }

  // 5. Approved
  if (transaction.approvalStatus === 'APPROVED' || transaction.approvalStatus === 'Approved') {
    return 'Approved';
  }

  // 6. Default: all required fields present but not yet approved
  return 'For Approval';
}

/**
 * Determine what's missing from a transaction.
 * Used to guide the user in the detail drawer.
 */
export function getTransactionBlockers(transaction) {
  const blockers = [];

  const hasReceipt = transaction.receiptStatus === 'Attached';
  if (!hasReceipt) {
    blockers.push({
      type: 'receipt',
      message: 'Receipt is required',
      section: 'Overview',
      action: 'Upload receipt',
    });
  }

  const hasProject = transaction.projectId || transaction.projectCode;
  const hasCostCode = transaction.costCode;
  if (!hasProject || !hasCostCode) {
    blockers.push({
      type: 'coding',
      message: 'Project and cost code are required',
      section: 'Job Context',
      action: 'Add project coding',
    });
  }

  return blockers;
}

/**
 * Check if a transaction is ready for review (all blockers resolved)
 */
export function isReadyForReview(transaction) {
  return getTransactionBlockers(transaction).length === 0;
}
