export const REPORT_STATUS_CONFIG = {
  submitted: {
    label: 'Submitted',
    color: 'info',
    description: 'Report has been submitted and is waiting for acknowledgment'
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'info',
    description: 'Report has been acknowledged by the administration'
  },
  assigned: {
    label: 'Assigned',
    color: 'warning',
    description: 'Report has been assigned to a staff member'
  },
  in_progress: {
    label: 'In Progress',
    color: 'warning',
    description: 'Work is in progress on this report'
  },
  resolved: {
    label: 'Resolved',
    color: 'success',
    description: 'Report has been resolved successfully'
  },
  rejected: {
    label: 'Rejected',
    color: 'error',
    description: 'Report has been rejected'
  },
  closed: {
    label: 'Closed',
    color: 'default',
    description: 'Report has been closed'
  }
};

// Helper functions for consistent status handling in admin dashboard
export const getStatusLabel = (status) => {
  return REPORT_STATUS_CONFIG[status]?.label || status;
};

export const getStatusColor = (status) => {
  return REPORT_STATUS_CONFIG[status]?.color || 'default';
};

export const getStatusDescription = (status) => {
  return REPORT_STATUS_CONFIG[status]?.description || 'Unknown status';
};

// Get all available status options for forms/selects
export const getStatusOptions = () => {
  return Object.keys(REPORT_STATUS_CONFIG).map(key => ({
    value: key,
    label: REPORT_STATUS_CONFIG[key].label,
    color: REPORT_STATUS_CONFIG[key].color
  }));
};

// Check if status indicates pending work (for dashboard statistics)
export const isPendingStatus = (status) => {
  return ['submitted', 'acknowledged', 'assigned', 'in_progress'].includes(status);
};

// Check if status indicates completion
export const isCompletedStatus = (status) => {
  return ['resolved', 'rejected', 'closed'].includes(status);
};