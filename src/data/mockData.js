export const projects = [
  { id: 1, name: 'Oakwood Apartments', code: 'OAK-2024', status: 'Active', budget: 4500000, spent: 2850000 },
  { id: 2, name: 'Trust Hill Development', code: 'THD-2024', status: 'Active', budget: 8200000, spent: 3100000 },
  { id: 3, name: 'Metro Center Renovation', code: 'MCR-2024', status: 'Active', budget: 2100000, spent: 1750000 },
  { id: 4, name: 'Harbor Bridge Repair', code: 'HBR-2024', status: 'Active', budget: 6800000, spent: 1200000 },
  { id: 5, name: 'Sunset Plaza Mall', code: 'SPM-2023', status: 'Completed', budget: 12000000, spent: 11800000 },
];

export const costCodes = [
  { code: '01-000', name: 'General Requirements' },
  { code: '02-000', name: 'Site Work' },
  { code: '03-000', name: 'Concrete' },
  { code: '04-000', name: 'Masonry' },
  { code: '05-000', name: 'Metals / Structural Steel' },
  { code: '06-000', name: 'Wood & Plastics' },
  { code: '07-000', name: 'Thermal & Moisture' },
  { code: '08-000', name: 'Doors & Windows' },
  { code: '09-000', name: 'Finishes' },
  { code: '10-000', name: 'Specialties' },
  { code: '15-000', name: 'Mechanical / Plumbing' },
  { code: '16-000', name: 'Electrical' },
  { code: '31-000', name: 'Earthwork' },
  { code: '32-000', name: 'Exterior Improvements' },
];

export const bills = [
  {
    id: 1, vendor: 'KMG Concrete Services', project: 'Oakwood Apartments', projectId: 1,
    costCode: '03-000', invoiceNumber: 'INV-4421', invoiceDate: '2024-06-10',
    dueDate: '2024-06-21', amount: 25000, retainageWithheld: 2500,
    paymentMethod: 'ACH', status: 'For Approval', lienWaiverRequired: true,
    lienWaiverAttached: false, owner: 'David Wallace', ownerRole: 'PM',
    paymentDate: null,
  },
  {
    id: 2, vendor: "John's Electric Inc", project: 'Oakwood Apartments', projectId: 1,
    costCode: '16-000', invoiceNumber: 'JE-8872', invoiceDate: '2024-06-17',
    dueDate: '2024-06-14', amount: 18750, retainageWithheld: 937.50,
    paymentMethod: 'Check', status: 'Late', lienWaiverRequired: true,
    lienWaiverAttached: true, owner: 'David Wallace', ownerRole: 'PM',
    paymentDate: null,
  },
  {
    id: 3, vendor: 'ModForm Drywall', project: 'Trust Hill Development', projectId: 2,
    costCode: '09-000', invoiceNumber: 'MFD-1190', invoiceDate: '2024-06-05',
    dueDate: '2024-11-04', amount: 32900, retainageWithheld: 0,
    paymentMethod: 'ACH', status: 'For Approval', lienWaiverRequired: false,
    lienWaiverAttached: false, owner: 'Holly Flax', ownerRole: 'AP',
    paymentDate: null,
  },
  {
    id: 4, vendor: 'Summit HVAC', project: 'Metro Center Renovation', projectId: 3,
    costCode: '15-000', invoiceNumber: 'SH-0045', invoiceDate: '2024-06-18',
    dueDate: '2024-07-04', amount: 18000, retainageWithheld: 1800,
    paymentMethod: 'ACH', status: 'Paid', lienWaiverRequired: true,
    lienWaiverAttached: true, owner: 'Holly Flax', ownerRole: 'AP',
    paymentDate: '2024-06-25',
  },
  {
    id: 5, vendor: 'Pacific Steel Supply', project: 'Harbor Bridge Repair', projectId: 4,
    costCode: '05-000', invoiceNumber: 'PSS-7210', invoiceDate: '2024-06-12',
    dueDate: '2024-07-12', amount: 67500, retainageWithheld: 6750,
    paymentMethod: 'Check', status: 'For Approval', lienWaiverRequired: true,
    lienWaiverAttached: false, owner: 'Luke Hobbs', ownerRole: 'PM',
    paymentDate: null,
  },
  {
    id: 6, vendor: 'AAA Earthmovers', project: 'Trust Hill Development', projectId: 2,
    costCode: '31-000', invoiceNumber: 'AAA-3301', invoiceDate: '2024-06-01',
    dueDate: '2024-06-30', amount: 45000, retainageWithheld: 4500,
    paymentMethod: 'ACH', status: 'For Approval', lienWaiverRequired: true,
    lienWaiverAttached: true, owner: 'David Wallace', ownerRole: 'PM',
    paymentDate: null,
  },
  {
    id: 7, vendor: 'R&M Plumbing', project: 'Oakwood Apartments', projectId: 1,
    costCode: '15-000', invoiceNumber: 'RM-5567', invoiceDate: '2024-06-20',
    dueDate: '2024-07-20', amount: 14200, retainageWithheld: 1420,
    paymentMethod: 'ACH', status: 'Draft', lienWaiverRequired: true,
    lienWaiverAttached: false, owner: 'Holly Flax', ownerRole: 'AP',
    paymentDate: null,
  },
  {
    id: 8, vendor: 'BuildRight Windows', project: 'Metro Center Renovation', projectId: 3,
    costCode: '08-000', invoiceNumber: 'BRW-0981', invoiceDate: '2024-06-15',
    dueDate: '2024-07-15', amount: 28750, retainageWithheld: 2875,
    paymentMethod: 'Check', status: 'For Approval', lienWaiverRequired: false,
    lienWaiverAttached: false, owner: 'Luke Hobbs', ownerRole: 'PM',
    paymentDate: null,
  },
  // Unlinked invoices for testing PO matching
  {
    id: 9, vendor: 'Sunbelt Rentals', project: 'Oakwood Apartments', projectId: 1,
    costCode: '01-000', invoiceNumber: 'SBR-4601', invoiceDate: '2024-06-28',
    dueDate: '2024-07-28', amount: 12500, retainageWithheld: 1250,
    paymentMethod: 'ACH', status: 'For Approval', lienWaiverRequired: true,
    lienWaiverAttached: false, owner: 'David Wallace', ownerRole: 'PM',
    paymentDate: null, poId: null,
  },
  {
    id: 10, vendor: 'KMG Concrete Services', project: 'Oakwood Apartments', projectId: 1,
    costCode: '03-000', invoiceNumber: 'KMG-4510', invoiceDate: '2024-06-30',
    dueDate: '2024-07-30', amount: 45000, retainageWithheld: 4500,
    paymentMethod: 'ACH', status: 'For Approval', lienWaiverRequired: true,
    lienWaiverAttached: false, owner: 'David Wallace', ownerRole: 'PM',
    paymentDate: null, poId: null,
  },
];

export const cardTransactions = [
  {
    id: 1, date: '2024-05-29', amount: 1230.52, supplier: 'Home Depot Pro',
    project: 'Oakwood Apartments', projectId: 1, projectCode: '227.100', costCode: '06-000',
    spendType: 'Lumber', trade: 'Framing', cardholder: 'Luke Hobbs', role: 'Foreman',
    receiptStatus: 'Attached', memo: 'Framing materials — Bldg C',
    policyStatus: 'OK', approvalStatus: 'Approved',
  },
  {
    id: 2, date: '2024-05-29', amount: 1725.00, supplier: 'Sunbelt Rentals',
    project: 'Trust Hill Development', projectId: 2, projectCode: '265.300', costCode: '01-000',
    spendType: 'Equipment Rental', trade: 'General Requirements', cardholder: 'David Wallace', role: 'Project Manager',
    receiptStatus: 'Attached', memo: '30-day scissor lift',
    policyStatus: 'OK', approvalStatus: 'Approved',
  },
  {
    id: 3, date: '2024-05-28', amount: 2300.28, supplier: 'Ace Hardware',
    project: 'Harbor Bridge Repair', projectId: 4, projectCode: '189.200', costCode: '01-000',
    spendType: 'Tools & Supplies', trade: 'Site Prep', cardholder: 'Holly Flax', role: 'Supervisor',
    receiptStatus: 'Missing', memo: '',
    policyStatus: 'Missing Receipt', approvalStatus: 'Needs Review',
  },
  {
    id: 4, date: '2024-05-27', amount: 856.40, supplier: 'Shell Gas Station',
    project: 'Oakwood Apartments', projectId: 1, projectCode: '227.100', costCode: '01-000',
    spendType: 'Fuel', trade: 'General Requirements', cardholder: 'Luke Hobbs', role: 'Foreman',
    receiptStatus: 'Attached', memo: 'Fleet fueling — week 22',
    policyStatus: 'OK', approvalStatus: 'Approved',
  },
  {
    id: 5, date: '2024-05-27', amount: 4100.00, supplier: 'Ferguson Plumbing',
    project: 'Metro Center Renovation', projectId: 3, projectCode: '301.400', costCode: '15-000',
    spendType: 'Materials', trade: 'Mechanical / Plumbing', cardholder: 'David Wallace', role: 'Project Manager',
    receiptStatus: 'Attached', memo: 'Copper fittings and PVC — 3rd floor',
    policyStatus: 'OK', approvalStatus: 'Approved',
  },
  {
    id: 6, date: '2024-05-26', amount: 675.00, supplier: 'United Rentals',
    project: 'Trust Hill Development', projectId: 2, projectCode: '265.300', costCode: '01-000',
    spendType: 'Equipment Rental', trade: 'Concrete', cardholder: 'Holly Flax', role: 'Supervisor',
    receiptStatus: 'Attached', memo: 'Concrete saw rental 1-week',
    policyStatus: 'OK', approvalStatus: 'Approved',
  },
  {
    id: 7, date: '2024-05-25', amount: 312.18, supplier: "Lowe's Pro",
    project: 'Oakwood Apartments', projectId: 1, projectCode: '227.100', costCode: '16-000',
    spendType: 'Electrical', trade: 'Electrical', cardholder: 'Luke Hobbs', role: 'Foreman',
    receiptStatus: 'Missing', memo: '',
    policyStatus: 'Missing Project', approvalStatus: 'Waiting on Cardholder',
  },
  {
    id: 8, date: '2024-05-24', amount: 5800.00, supplier: 'BlueLine Equipment',
    project: '', projectId: null, projectCode: '', costCode: '',
    spendType: 'Equipment Rental', trade: 'Structural Steel', cardholder: 'David Wallace', role: 'Project Manager',
    receiptStatus: 'Attached', memo: 'Crane rental — 2 day',
    policyStatus: 'OK', approvalStatus: 'Needs Review',
  },
];

export const procurementRequests = [
  {
    id: 1, name: 'PR# 1 – Equipment Rental', requester: 'David Wallace', requesterRole: 'Project Executive',
    project: 'Trust Hill Development', projectId: 2, costCode: '01-000', category: 'Equipment Rental',
    estimatedAmount: 67500, type: 'rental', frequency: 'Annual', neededBy: '2024-06-15',
    supplier: 'Sunbelt Rentals', description: '30-day scissor lift rental for Phase 2 facade work',
    status: 'Approved', approvals: 'Approved', spendProgram: 'Equipment Rental',
    totalAmount: 67500, billedAmount: 51500, poStatus: 'Partially invoiced',
    jobPhase: 'Phase 2 — Facade', trade: 'General Requirements',
    term: 'Annual', startDate: '2024-01-15', endDate: '2025-01-15', paymentMethod: 'ACH',
    approverChain: [
      { id: 'a1', name: 'Megan Lewis', role: 'Project Manager', group: 'Project Managers', status: 'Approved', timestamp: '2024-06-10T09:30:00' },
      { id: 'a2', name: 'Jan Levinson', role: 'Controller', group: 'Finance', status: 'Approved', timestamp: '2024-06-11T14:15:00' },
    ],
    lineItems: [
      { id: 'li1', name: 'Scissor lift rental — 30 day', committed: 45000, invoiced: 33500, costCode: '01-000' },
      { id: 'li2', name: 'Boom lift rental — 15 day', committed: 22500, invoiced: 18000, costCode: '01-000' },
    ],
    invoices: [
      { id: 'inv1', number: 'SBR-4401', date: '2024-03-15', amount: 33500, status: 'Paid', retainage: 3350, lienWaiver: 'Received', poId: '1', matchStatus: 'MATCHED', matchedAmount: 33500, exception: null, billPay: { billId: 'bill-1', status: 'PAID' } },
      { id: 'inv2', number: 'SBR-4520', date: '2024-06-01', amount: 18000, status: 'Pending', retainage: 1800, lienWaiver: 'Pending', poId: '1', matchStatus: 'MATCHED', matchedAmount: 18000, exception: null, billPay: null },
    ],
    accountingCategory: 'Equipment Rental', vendorMapping: 'Sunbelt Rentals LLC', exportStatus: 'Exported',
    activity: [
      { time: '2024-06-08T09:15:00', who: 'David Wallace', action: 'Request created' },
      { time: '2024-06-10T09:30:00', who: 'Megan Lewis', action: 'Approved request' },
      { time: '2024-06-11T14:15:00', who: 'Jan Levinson', action: 'Approved request' },
      { time: '2024-06-12T10:00:00', who: 'System', action: 'Converted to Purchase Order' },
      { time: '2024-03-15T11:00:00', who: 'System', action: 'Invoice SBR-4401 matched ($33,500)' },
      { time: '2024-06-01T09:00:00', who: 'System', action: 'Invoice SBR-4520 matched ($18,000)' },
    ],
  },
  {
    id: 2, name: 'PR# 2 – Concrete Materials', requester: 'David Wallace', requesterRole: 'Project Executive',
    project: 'Oakwood Apartments', projectId: 1, costCode: '03-000', category: 'Concrete',
    estimatedAmount: 115000, type: 'material', frequency: 'One-time', neededBy: '2024-06-20',
    supplier: 'KMG Concrete Services', description: 'Foundation pour materials for Buildings A-C',
    status: 'Approved', approvals: 'Approved', spendProgram: 'Concrete Materials',
    totalAmount: 115000, billedAmount: 30750, poStatus: 'Partially invoiced',
    jobPhase: 'Phase 1 — Foundation', trade: 'Concrete',
    term: 'One-time', startDate: '2024-05-01', endDate: '2024-08-30', paymentMethod: 'Check',
    approverChain: [
      { id: 'a3', name: 'Megan Lewis', role: 'Project Manager', group: 'Project Managers', status: 'Approved', timestamp: '2024-06-15T10:00:00' },
      { id: 'a4', name: 'Ryan Howard', role: 'Purchasing Manager', group: 'Purchasing', status: 'Approved', timestamp: '2024-06-16T08:30:00' },
      { id: 'a5', name: 'Jan Levinson', role: 'Controller', group: 'Finance', status: 'Approved', timestamp: '2024-06-17T15:45:00' },
    ],
    lineItems: [
      { id: 'li3', name: 'Ready-mix concrete — 500 yd³', committed: 75000, invoiced: 25000, costCode: '03-000' },
      { id: 'li4', name: 'Rebar & reinforcement', committed: 25000, invoiced: 5750, costCode: '03-000' },
      { id: 'li5', name: 'Formwork & accessories', committed: 15000, invoiced: 0, costCode: '03-000' },
    ],
    invoices: [
      { id: 'inv3', number: 'KMG-4421', date: '2024-06-10', amount: 25000, status: 'Paid', retainage: 2500, lienWaiver: 'Received', poId: '2', matchStatus: 'MATCHED', matchedAmount: 25000, exception: null, billPay: { billId: 'bill-2', status: 'PAID' } },
      { id: 'inv4', number: 'KMG-4490', date: '2024-06-25', amount: 5750, status: 'For Approval', retainage: 575, lienWaiver: 'Pending', poId: '2', matchStatus: 'MATCHED', matchedAmount: 5750, exception: null, billPay: { billId: 'bill-3', status: 'FOR_APPROVAL' } },
    ],
    accountingCategory: 'Materials — Concrete', vendorMapping: 'KMG Concrete Services Inc', exportStatus: 'Partial',
    activity: [
      { time: '2024-06-12T08:00:00', who: 'David Wallace', action: 'Request created' },
      { time: '2024-06-15T10:00:00', who: 'Megan Lewis', action: 'Approved request' },
      { time: '2024-06-16T08:30:00', who: 'Ryan Howard', action: 'Approved request' },
      { time: '2024-06-17T15:45:00', who: 'Jan Levinson', action: 'Approved request' },
      { time: '2024-06-18T09:00:00', who: 'System', action: 'Converted to Purchase Order' },
      { time: '2024-06-10T11:00:00', who: 'System', action: 'Invoice KMG-4421 matched ($25,000)' },
    ],
  },
  {
    id: 3, name: 'PR# 3 – Plumbing Services', requester: 'Holly Flax', requesterRole: 'Accounting Lead',
    project: 'Metro Center Renovation', projectId: 3, costCode: '15-000', category: 'Plumbing',
    estimatedAmount: 32000, type: 'service', frequency: 'One-time', neededBy: '2024-07-01',
    supplier: 'R&M Plumbing', description: 'Plumbing rough-in and fixture installation for 3rd floor renovation',
    status: 'Changes Requested', approvals: 'Changes Requested', spendProgram: 'General Procurement',
    requestedChanges: {
      note: 'Please update the cost code to 15-100 for plumbing fixtures specifically, and break down the estimate into rough-in vs fixtures.',
      by: 'Michael Scott',
      timestamp: '2024-06-26T10:30:00',
    },
    totalAmount: 32000, billedAmount: 0, poStatus: 'Not billed',
    jobPhase: 'Phase 2 — Rough-In', trade: 'Mechanical / Plumbing',
    term: 'One-time', startDate: null, endDate: null, paymentMethod: 'ACH',
    approverChain: [
      { id: 'a6', name: 'Michael Scott', role: 'Site Supervisor', group: 'Project Managers', status: 'For approval', timestamp: null },
      { id: 'a7', name: 'Jan Levinson', role: 'Controller', group: 'Finance', status: 'Waiting', timestamp: null },
    ],
    lineItems: [],
    invoices: [],
    accountingCategory: 'Subcontractor — Plumbing', vendorMapping: 'R&M Plumbing LLC', exportStatus: 'Not exported',
    activity: [
      { time: '2024-06-25T14:00:00', who: 'Holly Flax', action: 'Request created' },
      { time: '2024-06-25T14:01:00', who: 'System', action: 'Approval request sent to Michael Scott' },
    ],
  },
  {
    id: 4, name: 'PR# 4 – Structural Steel', requester: 'Luke Hobbs', requesterRole: 'Foreman',
    project: 'Harbor Bridge Repair', projectId: 4, costCode: '05-000', category: 'Structural Steel',
    estimatedAmount: 185000, type: 'material', frequency: 'One-time', neededBy: '2024-07-10',
    supplier: 'Pacific Steel Supply', description: 'Structural steel beams and plates for bridge deck replacement',
    status: 'Rejected', approvals: 'Rejected', spendProgram: 'Steel & Metals',
    totalAmount: 185000, billedAmount: 0, poStatus: 'Not billed',
    jobPhase: 'Phase 1 — Demolition & Fabrication', trade: 'Metals / Structural Steel',
    term: 'One-time', startDate: null, endDate: null, paymentMethod: 'Check',
    approverChain: [],
    lineItems: [],
    invoices: [],
    accountingCategory: 'Materials — Steel', vendorMapping: 'Pacific Steel Supply Co', exportStatus: 'Not exported',
    activity: [
      { time: '2024-06-28T11:30:00', who: 'Luke Hobbs', action: 'Draft created' },
    ],
  },
  {
    id: 5, name: 'PR# 5 – Electrical Sub', requester: 'David Wallace', requesterRole: 'Project Executive',
    project: 'Oakwood Apartments', projectId: 1, costCode: '16-000', category: 'Electrical',
    estimatedAmount: 95000, type: 'service', frequency: 'One-time', neededBy: '2024-07-15',
    supplier: "John's Electric Inc", description: 'Full electrical rough-in and panel installation for Buildings A-C',
    status: 'Approved', approvals: 'Approved', spendProgram: 'Electrical',
    totalAmount: 95000, billedAmount: 18750, poStatus: 'Partially invoiced',
    jobPhase: 'Phase 2 — Rough-In', trade: 'Electrical',
    term: 'One-time', startDate: '2024-06-01', endDate: '2024-09-30', paymentMethod: 'ACH',
    approverChain: [
      { id: 'a8', name: 'Megan Lewis', role: 'Project Manager', group: 'Project Managers', status: 'Approved', timestamp: '2024-05-28T09:00:00' },
      { id: 'a9', name: 'Jan Levinson', role: 'Controller', group: 'Finance', status: 'Approved', timestamp: '2024-05-29T16:00:00' },
    ],
    lineItems: [
      { id: 'li6', name: 'Electrical rough-in — Bldg A', committed: 35000, invoiced: 18750, costCode: '16-000' },
      { id: 'li7', name: 'Electrical rough-in — Bldg B', committed: 35000, invoiced: 0, costCode: '16-000' },
      { id: 'li8', name: 'Panel installation', committed: 25000, invoiced: 0, costCode: '16-000' },
    ],
    invoices: [
      { id: 'inv5', number: 'JE-8872', date: '2024-06-17', amount: 18750, status: 'Paid', retainage: 937.50, lienWaiver: 'Received', poId: '5', matchStatus: 'MATCHED', matchedAmount: 18750, exception: null, billPay: { billId: 'bill-4', status: 'PAID' } },
    ],
    accountingCategory: 'Subcontractor — Electrical', vendorMapping: "John's Electric Inc", exportStatus: 'Exported',
    activity: [
      { time: '2024-05-25T10:00:00', who: 'David Wallace', action: 'Request created' },
      { time: '2024-05-28T09:00:00', who: 'Megan Lewis', action: 'Approved request' },
      { time: '2024-05-29T16:00:00', who: 'Jan Levinson', action: 'Approved request' },
      { time: '2024-05-30T08:00:00', who: 'System', action: 'Converted to Purchase Order' },
      { time: '2024-06-17T10:00:00', who: 'System', action: 'Invoice JE-8872 matched ($18,750)' },
    ],
  },
  {
    id: 6, name: 'PR# 6 – HVAC Ductwork', requester: 'Holly Flax', requesterRole: 'Accounting Lead',
    project: 'Metro Center Renovation', projectId: 3, costCode: '15-000', category: 'Mechanical',
    estimatedAmount: 48000, type: 'service', frequency: 'One-time', neededBy: '2024-07-20',
    supplier: 'Summit HVAC', description: 'HVAC ductwork installation for floors 2-4',
    status: 'For approval', approvals: 'For approval', spendProgram: 'General Procurement',
    totalAmount: 48000, billedAmount: 0, poStatus: 'Not billed',
    jobPhase: 'Phase 3 — MEP', trade: 'Mechanical / Plumbing',
    term: 'One-time', startDate: null, endDate: null, paymentMethod: 'ACH',
    approverChain: [
      { id: 'a10', name: 'Michael Scott', role: 'Site Supervisor', group: 'Project Managers', status: 'Approved', timestamp: '2024-06-28T11:00:00' },
      { id: 'a11', name: 'Jan Levinson', role: 'Controller', group: 'Finance', status: 'For approval', timestamp: null },
    ],
    lineItems: [],
    invoices: [],
    accountingCategory: 'Subcontractor — HVAC', vendorMapping: 'Summit HVAC LLC', exportStatus: 'Not exported',
    activity: [
      { time: '2024-06-27T09:00:00', who: 'Holly Flax', action: 'Request created' },
      { time: '2024-06-27T09:01:00', who: 'System', action: 'Approval request sent to Michael Scott' },
      { time: '2024-06-28T11:00:00', who: 'Michael Scott', action: 'Approved request' },
      { time: '2024-06-28T11:01:00', who: 'System', action: 'Approval request sent to Jan Levinson' },
    ],
  },
  {
    id: 7, name: 'PR# 7 – Drywall Installation', requester: 'David Wallace', requesterRole: 'Project Executive',
    project: 'Trust Hill Development', projectId: 2, costCode: '09-000', category: 'Finishes',
    estimatedAmount: 45000, type: 'service', frequency: 'One-time', neededBy: '2024-05-15',
    supplier: 'ModForm Drywall', description: 'Complete drywall installation for Phase 1 units',
    status: 'Approved', approvals: 'Approved', spendProgram: 'Drywall & Finishes',
    totalAmount: 45000, billedAmount: 45000, poStatus: 'Fully invoiced',
    jobPhase: 'Phase 1 — Interior Finishes', trade: 'Finishes',
    term: 'One-time', startDate: '2024-05-20', endDate: '2024-06-30', paymentMethod: 'ACH',
    approverChain: [
      { id: 'a12', name: 'Megan Lewis', role: 'Project Manager', group: 'Project Managers', status: 'Approved', timestamp: '2024-05-10T09:00:00' },
      { id: 'a13', name: 'Jan Levinson', role: 'Controller', group: 'Finance', status: 'Approved', timestamp: '2024-05-11T14:00:00' },
    ],
    lineItems: [
      { id: 'li9', name: 'Drywall installation — Units 1-5', committed: 22500, invoiced: 22500, costCode: '09-000' },
      { id: 'li10', name: 'Drywall installation — Units 6-10', committed: 22500, invoiced: 22500, costCode: '09-000' },
    ],
    invoices: [
      { id: 'inv6', number: 'MFD-1100', date: '2024-06-01', amount: 22500, status: 'Paid', retainage: 2250, lienWaiver: 'Received', poId: '7', matchStatus: 'MATCHED', matchedAmount: 22500, exception: null, billPay: { billId: 'bill-5', status: 'PAID' } },
      { id: 'inv7', number: 'MFD-1155', date: '2024-06-20', amount: 22500, status: 'Paid', retainage: 2250, lienWaiver: 'Received', poId: '7', matchStatus: 'MATCHED', matchedAmount: 22500, exception: null, billPay: { billId: 'bill-6', status: 'PAID' } },
    ],
    accountingCategory: 'Subcontractor — Drywall', vendorMapping: 'ModForm Drywall LLC', exportStatus: 'Exported',
    activity: [
      { time: '2024-05-08T10:00:00', who: 'David Wallace', action: 'Request created' },
      { time: '2024-05-10T09:00:00', who: 'Megan Lewis', action: 'Approved request' },
      { time: '2024-05-11T14:00:00', who: 'Jan Levinson', action: 'Approved request' },
      { time: '2024-05-12T08:00:00', who: 'System', action: 'Converted to Purchase Order' },
      { time: '2024-06-01T11:00:00', who: 'System', action: 'Invoice MFD-1100 matched ($22,500)' },
      { time: '2024-06-20T11:00:00', who: 'System', action: 'Invoice MFD-1155 matched ($22,500)' },
    ],
  },
  {
    id: 8, name: 'PO# 8 – Landscaping Services', requester: 'Michael Scott', requesterRole: 'Site Supervisor',
    project: 'Oakwood Apartments', projectId: 1, costCode: '02-000', category: 'Sitework',
    estimatedAmount: 22000, type: 'service', frequency: 'One-time', neededBy: '2024-08-01',
    supplier: 'GreenScape Landscaping', description: 'Complete landscaping and irrigation for exterior areas',
    status: 'Draft', approvals: 'Draft', spendProgram: 'General Procurement',
    totalAmount: 22000, billedAmount: 0, poStatus: 'Draft', draft: true,
    jobPhase: 'Phase 4 — Site Completion', trade: 'Sitework',
    term: 'One-time', startDate: null, endDate: null, paymentMethod: 'Check',
    approverChain: [],
    lineItems: [],
    invoices: [],
    accountingCategory: 'Subcontractor — Landscaping', vendorMapping: 'GreenScape Landscaping Inc', exportStatus: 'Not exported',
    activity: [
      { time: '2024-06-30T14:00:00', who: 'Michael Scott', action: 'Draft PO created' },
    ],
  },
  {
    id: 9, name: 'PO# 9 – Window Replacement', requester: 'Holly Flax', requesterRole: 'Accounting Lead',
    project: 'Metro Center Renovation', projectId: 3, costCode: '08-000', category: 'Openings',
    estimatedAmount: 68000, type: 'material', frequency: 'One-time', neededBy: '2024-07-10',
    supplier: 'Apex Windows & Doors', description: 'Energy-efficient window replacement for floors 1-3',
    status: 'Cancelled', approvals: 'Cancelled', spendProgram: 'General Procurement',
    totalAmount: 68000, billedAmount: 0, poStatus: 'Cancelled', cancelled: true,
    jobPhase: 'Phase 2 — Building Envelope', trade: 'Doors / Windows',
    term: 'One-time', startDate: null, endDate: null, paymentMethod: 'ACH',
    approverChain: [
      { id: 'a12', name: 'David Wallace', role: 'Project Executive', group: 'Project Owner', status: 'Approved', timestamp: '2024-06-10T10:00:00' },
    ],
    lineItems: [],
    invoices: [],
    accountingCategory: 'Materials — Windows', vendorMapping: 'Apex Windows & Doors LLC', exportStatus: 'Not exported',
    activity: [
      { time: '2024-06-08T09:00:00', who: 'Holly Flax', action: 'Request created' },
      { time: '2024-06-10T10:00:00', who: 'David Wallace', action: 'Approved request' },
      { time: '2024-06-11T08:00:00', who: 'System', action: 'Converted to Purchase Order' },
      { time: '2024-06-15T14:00:00', who: 'David Wallace', action: 'PO cancelled — vendor unable to meet timeline' },
    ],
  },
];

export const expenses = [
  {
    id: 1, employee: 'Luke Hobbs', role: 'Foreman', project: 'Oakwood Apartments',
    projectId: 1, projectCode: 'OAK-2024', costCode: '01-000', amount: 124.50,
    receipt: true, status: 'Pending Review', spendType: 'Safety Supplies', trade: 'General Requirements',
    date: '2024-05-29', description: 'Jobsite safety supplies',
    approvers: [
      { id: 'a1', name: 'Michael Scott', role: 'PM', group: 'Project Managers', status: 'For approval', timestamp: null },
    ],
  },
  {
    id: 2, employee: 'David Wallace', role: 'Project Manager', project: 'Trust Hill Development',
    projectId: 2, projectCode: 'THD-2024', costCode: '01-000', amount: 379.94,
    receipt: true, status: 'Approved', spendType: 'Meals & Entertainment', trade: 'General Requirements',
    date: '2024-05-28', description: 'Team lunch — milestone celebration',
    approvers: [
      { id: 'a2', name: 'Megan Lewis', role: 'PM', group: 'Project Managers', status: 'Approved', timestamp: '2024-05-28T16:30:00' },
    ],
  },
  {
    id: 3, employee: 'Holly Flax', role: 'Supervisor', project: 'Metro Center Renovation',
    projectId: 3, projectCode: 'MCR-2024', costCode: '01-000', amount: 541.46,
    receipt: false, status: 'Missing Receipt', spendType: 'Mileage', trade: 'General Requirements',
    date: '2024-05-22', description: 'Mileage reimbursement — site visits',
    approvers: [
      { id: 'a3', name: 'Michael Scott', role: 'PM', group: 'Project Managers', status: 'For approval', timestamp: null },
      { id: 'a4', name: 'Jan Levinson', role: 'Controller', group: 'Accounting', status: 'Waiting', timestamp: null },
    ],
  },
  {
    id: 4, employee: 'Luke Hobbs', role: 'Foreman', project: 'Harbor Bridge Repair',
    projectId: 4, projectCode: 'HBR-2024', costCode: '16-000', amount: 89.99,
    receipt: true, status: 'Approved', spendType: 'Electrical Supplies', trade: 'Electrical',
    date: '2024-05-27', description: 'Extension cords and adapters',
    approvers: [
      { id: 'a5', name: 'David Wallace', role: 'PM', group: 'Project Managers', status: 'Approved', timestamp: '2024-05-27T14:15:00' },
    ],
  },
  {
    id: 5, employee: 'Holly Flax', role: 'Supervisor', project: 'Oakwood Apartments',
    projectId: 1, projectCode: 'OAK-2024', costCode: '09-000', amount: 215.00,
    receipt: true, status: 'Pending Review', spendType: 'Finishes', trade: 'Finishes',
    date: '2024-05-26', description: 'Paint samples and swatches',
    approvers: [
      { id: 'a6', name: 'Michael Scott', role: 'PM', group: 'Project Managers', status: 'For approval', timestamp: null },
    ],
  },
  {
    id: 6, employee: 'David Wallace', role: 'Project Manager', project: 'Oakwood Apartments',
    projectId: 1, projectCode: 'OAK-2024', costCode: '01-000', amount: 1875.00,
    receipt: true, status: 'Pending Review', spendType: 'Equipment Purchase', trade: 'General Requirements',
    date: '2024-05-25', description: 'Laser level + tripod for foundation work',
    approvers: [
      { id: 'a7', name: 'Megan Lewis', role: 'PM', group: 'Project Managers', status: 'For approval', timestamp: null },
      { id: 'a8', name: 'Jan Levinson', role: 'Controller', group: 'Finance', status: 'Waiting', timestamp: null },
    ],
  },
  {
    id: 7, employee: 'Michael Scott', role: 'Site Supervisor', project: 'Harbor Bridge Repair',
    projectId: 4, projectCode: 'HBR-2024', costCode: '05-000', amount: 312.75,
    receipt: false, status: 'Missing Receipt', spendType: 'Tools & Supplies', trade: 'Structural Steel',
    date: '2024-05-24', description: 'Welding rods and wire brushes',
    approvers: [
      { id: 'a9', name: 'David Wallace', role: 'PM', group: 'Project Managers', status: 'For approval', timestamp: null },
    ],
  },
];

// ── Approver directory (for approver selection dropdown) ──
export const approverDirectory = {
  groups: [
    { id: 'project-owner', name: 'Project Owner', description: 'Owner assigned to the specific project' },
    { id: 'project-managers', name: 'Project Managers', description: 'PMs associated with the selected project' },
    { id: 'accounting', name: 'Accounting', description: 'AP / accounting approvers' },
    { id: 'finance', name: 'Finance', description: 'Controllers / finance leadership' },
    { id: 'purchasing', name: 'Purchasing Manager', description: 'Optional, for materials-heavy spend' },
    { id: 'admin', name: 'Any Admin', description: 'Escape hatch for edge cases' },
  ],
  individuals: [
    { id: 'p1', name: 'Megan Lewis', role: 'Project Manager', group: 'project-managers', projects: [1, 2] },
    { id: 'p2', name: 'David Wallace', role: 'Project Executive', group: 'project-owner', projects: [1, 2, 3, 4] },
    { id: 'p3', name: 'Michael Scott', role: 'Site Supervisor', group: 'project-managers', projects: [1, 4] },
    { id: 'p4', name: 'Holly Flax', role: 'Accounting Lead', group: 'accounting', projects: [1, 2, 3, 4] },
    { id: 'p5', name: 'Jan Levinson', role: 'Controller', group: 'finance', projects: [1, 2, 3, 4] },
    { id: 'p6', name: 'Ryan Howard', role: 'Purchasing Manager', group: 'purchasing', projects: [2, 3] },
    { id: 'p7', name: 'Jim Halpert', role: 'Admin', group: 'admin', projects: [1, 2, 3, 4] },
  ],
};

export const capitalOffers = [
  {
    id: 1, billId: 1, vendor: 'KMG Concrete Services', project: 'Oakwood Apartments',
    invoiceAmount: 25000, terms: [
      { days: 30, fee: 0.9, feeAmount: 225 },
      { days: 60, fee: 1.7, feeAmount: 425 },
      { days: 90, fee: 2.4, feeAmount: 600 },
    ],
  },
  {
    id: 2, billId: 6, vendor: 'AAA Earthmovers', project: 'Trust Hill Development',
    invoiceAmount: 45000, terms: [
      { days: 30, fee: 0.9, feeAmount: 405 },
      { days: 60, fee: 1.7, feeAmount: 765 },
      { days: 90, fee: 2.4, feeAmount: 1080 },
    ],
  },
];

export const capitalBalance = {
  totalOutstanding: 127500,
  upcomingRepayments: 45000,
  effectiveDPO: 58,
  byProject: [
    { project: 'Oakwood Apartments', outstanding: 52500, repaymentDate: '2024-07-15' },
    { project: 'Trust Hill Development', outstanding: 45000, repaymentDate: '2024-08-01' },
    { project: 'Harbor Bridge Repair', outstanding: 30000, repaymentDate: '2024-07-22' },
  ],
};

// ── Inbox data ──

export const inboxCardRequests = [
  {
    id: 1, requester: 'Luke Hobbs', role: 'Foreman', date: '2024-05-29',
    project: 'Oakwood Apartments', cardType: 'Physical', limit: 5000,
    spendCategories: 'Materials, Fuel', status: 'Pending Approval',
    reason: 'Weekly material runs — Bldg C framing phase',
  },
  {
    id: 2, requester: 'Michael Scott', role: 'Site Supervisor', date: '2024-05-28',
    project: 'Harbor Bridge Repair', cardType: 'Virtual', limit: 2500,
    spendCategories: 'Rentals', status: 'Pending Approval',
    reason: 'Temporary equipment rentals for bridge deck repair',
  },
];

export const inboxCardTransactions = [
  {
    id: 1, cardholder: 'David Wallace', role: 'Project Manager',
    transactions: [
      {
        id: 101, merchant: 'Astral Codex', date: '2024-03-29', category: 'Other',
        amount: 10.00, policyInfo: null, receipt: false, memo: null,
        status: 'Ready to approve',
      },
      {
        id: 102, merchant: "Jersey Mike's Subs", date: '2024-03-30', category: 'Restaurants',
        amount: 19.28, policyInfo: null, receipt: false, memo: null,
        status: 'Ready to approve',
      },
      {
        id: 103, merchant: 'Bensenville', date: '2024-04-05', category: 'Supermarkets and Groc...',
        amount: 71.80, policyInfo: null, receipt: false, memo: null,
        status: 'Ready to approve',
      },
    ],
  },
  {
    id: 2, cardholder: 'Jan Levinson', role: 'Controller',
    transactions: [
      {
        id: 201, merchant: 'Dropcontact', date: '2024-05-03', category: 'SaaS / Software',
        amount: 27.94, policyInfo: null, receipt: false, memo: 'https://en.dropcontact.io/',
        status: 'Ready to approve',
      },
    ],
  },
  {
    id: 3, cardholder: 'Holly Flax', role: 'Supervisor',
    transactions: [
      {
        id: 301, merchant: 'Home Depot Pro', date: '2024-05-28', category: 'Building Materials',
        amount: 347.12, policyInfo: 'Missing project code', receipt: true, memo: 'Drywall screws and tape',
        status: 'Needs review',
      },
    ],
  },
];

export const inboxReimbursements = [
  {
    id: 1, user: 'David Wallace', role: 'Owner',
    items: [
      {
        id: 201, submittedDate: '2024-05-29', transactionDate: '2024-05-22',
        spentOn: '612.17 miles', amount: 410.15, receipt: false, status: 'Pending review',
      },
      {
        id: 202, submittedDate: '2024-05-29', transactionDate: '2024-05-23',
        spentOn: 'Uber', amount: 339.32, receipt: false, status: 'Pending review',
      },
    ],
  },
  {
    id: 2, user: 'Michael Scott', role: 'Administrator',
    items: [
      {
        id: 301, submittedDate: '2024-05-29', transactionDate: '2024-05-22',
        spentOn: '289.67 miles', amount: 194.08, receipt: false, status: 'Pending review',
      },
      {
        id: 302, submittedDate: '2024-05-29', transactionDate: '2024-05-26',
        spentOn: 'Whole Foods', amount: 473.81, receipt: false, status: 'Pending review',
      },
      {
        id: 303, submittedDate: '2024-05-29', transactionDate: '2024-05-27',
        spentOn: 'Sunbelt Rentals', amount: 1250.00, receipt: true, status: 'Pending review',
      },
    ],
  },
];

export const inboxBills = [
  {
    id: 1, vendor: 'Nightfall Concrete', initials: 'N', color: 'bg-amber-600',
    owner: 'David Wallace', ownerDate: 'May 29, 2024',
    status: 'Paid', statusIcon: 'bank', amount: 6000.00,
    paymentDate: 'May 29, 2024', paymentArrived: 'Arrived May 24, 2024',
    dueDate: 'May 22, 2024',
  },
  {
    id: 2, vendor: 'Bold Tech Electric', initials: 'BT', color: 'bg-amber-700',
    owner: 'David Wallace', ownerDate: 'May 29, 2024',
    status: 'Paid', statusIcon: 'card', amount: 7567.50,
    paymentDate: 'May 29, 2024', paymentArrived: 'Arrived May 24, 2024',
    dueDate: 'May 22, 2024',
  },
];

export const inboxProcurement = [
  {
    id: 1, name: 'PR# 5 — Rebar delivery', requester: 'Luke Hobbs', date: '2024-05-29',
    project: 'Harbor Bridge Repair', amount: 23400, status: 'Pending Approval',
    category: 'Structural Steel',
  },
  {
    id: 2, name: 'PR# 6 — HVAC ductwork', requester: 'Holly Flax', date: '2024-05-28',
    project: 'Metro Center Renovation', amount: 18750, status: 'Pending Approval',
    category: 'Mechanical',
  },
];

export const analyticsData = {
  budgetVsActual: [
    { project: 'Oakwood Apts', budget: 4500000, actual: 2850000 },
    { project: 'Trust Hill', budget: 8200000, actual: 3100000 },
    { project: 'Metro Center', budget: 2100000, actual: 1750000 },
    { project: 'Harbor Bridge', budget: 6800000, actual: 1200000 },
  ],
  monthlySpend: [
    { month: 'Jan', amount: 320000 },
    { month: 'Feb', amount: 410000 },
    { month: 'Mar', amount: 385000 },
    { month: 'Apr', amount: 490000 },
    { month: 'May', amount: 530000 },
    { month: 'Jun', amount: 198000 },
  ],
  apAging: [
    { bucket: 'Current', amount: 95200 },
    { bucket: '1-30 days', amount: 45000 },
    { bucket: '31-60 days', amount: 18750 },
    { bucket: '61-90 days', amount: 8500 },
    { bucket: '90+ days', amount: 3200 },
  ],
  retainageByProject: [
    { project: 'Oakwood Apts', retainage: 42500 },
    { project: 'Trust Hill', retainage: 31200 },
    { project: 'Metro Center', retainage: 18900 },
    { project: 'Harbor Bridge', retainage: 6750 },
  ],
};
