const statusStyles = {
  'Pending':           'bg-amber-50 text-amber-700 border border-amber-200', // Backward compatibility
  'Pending Review':    'bg-amber-50 text-amber-700 border border-amber-200',
  'For Approval':      'bg-blue-50 text-blue-700 border border-blue-200',
  'For approval':      'bg-blue-50 text-blue-700 border border-blue-200', // Procurement request status
  'For Payment':       'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'Payment Scheduled': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Approved':          'bg-green-50 text-green-700 border border-green-200',
  'Paid':              'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Late':              'bg-red-50 text-red-700 border border-red-200',
  'Overdue':           'bg-red-50 text-red-700 border border-red-200',
  'Draft':             'bg-gray-50 text-gray-600 border border-gray-200',
  'Missing Info':      'bg-orange-50 text-orange-700 border border-orange-200',
  'Missing info':      'bg-orange-50 text-orange-700 border border-orange-200',
  'Missing Receipt':   'bg-orange-50 text-orange-700 border border-orange-200',
  'Missing Project':   'bg-orange-50 text-orange-700 border border-orange-200',
  'OK':                'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Needs Review':      'bg-amber-50 text-amber-700 border border-amber-200',
  'Waiting on Cardholder': 'bg-purple-50 text-purple-700 border border-purple-200',
  'Over Limit':        'bg-red-50 text-red-700 border border-red-200',
  'Partially billed':  'bg-amber-50 text-amber-700 border border-amber-200',
  'Fully billed':      'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Not billed':        'bg-gray-50 text-gray-600 border border-gray-200',
  'Committed':         'bg-blue-50 text-blue-700 border border-blue-200',
  'Matched':           'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Active':            'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Completed':         'bg-gray-100 text-gray-500 border border-gray-200',
  'Ready to approve':  'bg-blue-50 text-blue-700 border border-blue-200',
  'Pending Approval':  'bg-amber-50 text-amber-700 border border-amber-200',
  'Pending review':    'bg-amber-50 text-amber-700 border border-amber-200',
  'Needs review':      'bg-amber-50 text-amber-700 border border-amber-200',
  'Structural Steel':  'bg-gray-100 text-gray-700 border border-gray-200',
  'Mechanical':        'bg-gray-100 text-gray-700 border border-gray-200',
  'Rejected':          'bg-red-50 text-red-700 border border-red-200',
  'Changes Requested': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Converted':         'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'Card Issued':       'bg-violet-50 text-violet-700 border border-violet-200',
  'Flagged':           'bg-amber-50 text-amber-700 border border-amber-200',
  'Missing Lien Waiver': 'bg-orange-50 text-orange-700 border border-orange-200',
  // Procurement-specific statuses
  'Partially invoiced': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Closed':            'bg-gray-100 text-gray-500 border border-gray-200',
  'Equipment Rental':  'bg-blue-50 text-blue-700 border border-blue-200',
  'Concrete':          'bg-stone-100 text-stone-700 border border-stone-200',
  'Plumbing':          'bg-cyan-50 text-cyan-700 border border-cyan-200',
  'Electrical':        'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'Not exported':      'bg-gray-50 text-gray-600 border border-gray-200',
  'Exported':          'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Partial':           'bg-amber-50 text-amber-700 border border-amber-200',
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || 'bg-gray-50 text-gray-600 border border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${style}`}>
      {status}
    </span>
  );
}
