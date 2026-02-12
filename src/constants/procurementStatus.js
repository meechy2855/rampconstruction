// Purchase Request Statuses
export const PurchaseRequestStatus = {
  DRAFT: 'Draft',
  FOR_APPROVAL: 'For approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CHANGES_REQUESTED: 'Changes Requested',
  CONVERTED: 'Converted',
  CARD_ISSUED: 'Card Issued',
  FLAGGED: 'Flagged',
};

// Purchase Order Statuses
export const PurchaseOrderStatus = {
  DRAFT: 'Draft',
  ISSUED: 'Issued',
  PARTIALLY_INVOICED: 'Partially invoiced',
  FULLY_BILLED: 'Fully billed',
  NOT_BILLED: 'Not billed',
  CANCELLED: 'Cancelled',
  CLOSED: 'Closed',
  COMMITTED: 'Committed',
};

// Display mapping for all statuses
export const StatusDisplayMap = {
  // Purchase Request Statuses
  'Draft': 'Draft',
  'For approval': 'For approval',
  'Approved': 'Approved',
  'Rejected': 'Rejected',
  'Changes Requested': 'Changes Requested',
  'Converted': 'Converted',
  'Card Issued': 'Card Issued',
  'Flagged': 'Flagged',

  // Purchase Order Statuses
  'Issued': 'Issued',
  'Partially invoiced': 'Partially invoiced',
  'Fully billed': 'Fully billed',
  'Not billed': 'Not billed',
  'Cancelled': 'Cancelled',
  'Closed': 'Closed',
  'Committed': 'Committed',
};

// Backward compatibility: Map "Pending" to "For approval"
export const mapLegacyStatus = (status) => {
  if (status === 'Pending') return PurchaseRequestStatus.FOR_APPROVAL;
  return status;
};
