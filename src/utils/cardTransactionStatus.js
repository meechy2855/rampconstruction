/**
 * Derive card transaction status based on business rules
 *
 * Priority rules (most important first):
 * 1. If exportedAt != null => "Exported"
 * 2. Else if approvalStatus === "Approved" => "Approved"
 * 3. Else if missing receipt => "Missing receipt"
 * 4. Else if missing project/cost code => "Missing project coding"
 * 5. Else => "Needs review"
 */

export function deriveCardTransactionStatus(transaction) {
  if (!transaction) return 'Needs review';

  // 1. Exported takes highest priority
  if (transaction.exportedAt) {
    return 'Exported';
  }

  // 2. Approved status
  if (transaction.approvalStatus === 'Approved') {
    return 'Approved';
  }

  // 3. Missing receipt check
  const receiptRequired = true; // In real app, might depend on amount threshold
  const hasReceipt = transaction.receiptStatus === 'Attached';
  if (receiptRequired && !hasReceipt) {
    return 'Missing receipt';
  }

  // 4. Missing project coding check
  const codingRequired = true; // In real app, might depend on policies
  const hasProject = transaction.projectId || transaction.projectCode;
  const hasCostCode = transaction.costCode;
  if (codingRequired && (!hasProject || !hasCostCode)) {
    return 'Missing project coding';
  }

  // 5. Default: all required fields complete, ready for review
  return 'Needs review';
}

/**
 * Determine what's missing from a transaction
 * Used to guide the user in the detail drawer
 */
export function getTransactionBlockers(transaction) {
  const blockers = [];

  const receiptRequired = true;
  const hasReceipt = transaction.receiptStatus === 'Attached';
  if (receiptRequired && !hasReceipt) {
    blockers.push({
      type: 'receipt',
      message: 'Receipt is required',
      section: 'Receipts',
      action: 'Upload receipt',
    });
  }

  const codingRequired = true;
  const hasProject = transaction.projectId || transaction.projectCode;
  const hasCostCode = transaction.costCode;
  if (codingRequired && (!hasProject || !hasCostCode)) {
    blockers.push({
      type: 'coding',
      message: 'Project and cost code are required',
      section: 'Project Coding',
      action: 'Add project coding',
    });
  }

  return blockers;
}

/**
 * Check if a transaction is ready for review (all blockers resolved)
 */
export function isReadyForReview(transaction) {
  const status = deriveCardTransactionStatus(transaction);
  return status === 'Needs review' || status === 'Approved' || status === 'Exported';
}
