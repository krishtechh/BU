export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://witless-gregg-acaulescent.ngrok-free.dev/api';

export const CATEGORIES = {
  road_issue: 'Road Issue',
  water_supply: 'Water Supply',
  electricity: 'Electricity',
  garbage: 'Garbage',
  drainage: 'Drainage',
  street_light: 'Street Light',
  traffic: 'Traffic',
  pollution: 'Pollution',
  encroachment: 'Encroachment',
  other: 'Other'
};

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#4CAF50' },
  { value: 'medium', label: 'Medium', color: '#FF9800' },
  { value: 'high', label: 'High', color: '#F44336' },
  { value: 'urgent', label: 'Urgent', color: '#D32F2F' }
];

export const REPORT_STATUS = {
  submitted: { label: 'Submitted', color: '#2196F3' },
  acknowledged: { label: 'Acknowledged', color: '#03A9F4' },
  assigned: { label: 'Assigned', color: '#00BCD4' },
  in_progress: { label: 'In Progress', color: '#FFC107' },
  resolved: { label: 'Resolved', color: '#4CAF50' },
  rejected: { label: 'Rejected', color: '#F44336' },
  closed: { label: 'Closed', color: '#9E9E9E' }
};

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'ho', name: 'हो' },
  { code: 'sa', name: 'संथाली' },
  { code: 'ku', name: 'कुड़ुख' },
  { code: 'mu', name: 'मुण्डारी' }
];