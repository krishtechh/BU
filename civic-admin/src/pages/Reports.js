import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Grid
} from '@mui/material';
import { Visibility, Assignment, Edit, Delete, Map as MapIcon, ViewList } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getStatusColor, getStatusLabel } from '../constants/reportStatus';
import MapView from '../components/MapView';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bu-backend-t0vl.onrender.com/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [comment, setComment] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [refetch, setRefetch] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    assignedTo: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    priorities: [],
    statuses: [],
    assignedTo: []
  });

  // Assignment related state
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [reportToAssign, setReportToAssign] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [staffMembers, setStaffMembers] = useState([]);
  const [assigning, setAssigning] = useState(false);

  // Relevant departments for civic issues
  const departments = [
    { id: 'road_maintenance', name: 'Road Maintenance Department' },
    { id: 'water_supply', name: 'Water Supply Department' },
    { id: 'electricity', name: 'Electricity Board' },
    { id: 'waste_management', name: 'Waste Management Department' },
    { id: 'drainage', name: 'Drainage & Sewerage Department' },
    { id: 'street_lighting', name: 'Street Lighting Department' },
    { id: 'traffic_police', name: 'Traffic Police Department' },
    { id: 'pollution_control', name: 'Pollution Control Board' },
    { id: 'municipal_corporation', name: 'Municipal Corporation' },
    { id: 'general', name: 'General Administration' }
  ];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/reports`);
        const reportsData = response.data.data || [];
        setReports(reportsData);

        // Extract unique filter options
        const categories = [...new Set(reportsData.map(r => r.category).filter(Boolean))];
        const priorities = [...new Set(reportsData.map(r => r.priority).filter(Boolean))];
        const statuses = [...new Set(reportsData.map(r => r.status).filter(Boolean))];
        const assignedTo = [...new Set(reportsData.map(r => r.assignedTo?.name).filter(Boolean))];

        setFilterOptions({
          categories,
          priorities,
          statuses,
          assignedTo
        });

        // Apply current filters
        applyFilters(reportsData);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setReports([]);
        setFilteredReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [refetch]);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters(reports);
  }, [filters, reports]);

  const applyFilters = (reportsData) => {
    let filtered = [...reportsData];

    if (filters.category) {
      filtered = filtered.filter(report => report.category === filters.category);
    }
    if (filters.priority) {
      filtered = filtered.filter(report => report.priority === filters.priority);
    }
    if (filters.status) {
      filtered = filtered.filter(report => report.status === filters.status);
    }
    if (filters.assignedTo) {
      filtered = filtered.filter(report => report.assignedTo?.name === filters.assignedTo);
    }

    setFilteredReports(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      priority: '',
      status: '',
      assignedTo: ''
    });
  };


  const handleStatusUpdate = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/reports/${selectedReport.id}/status`, {
        status: statusUpdate,
        comment
      });
      setOpenDialog(false);
      setRefetch(prev => prev + 1);
      setStatusUpdate('');
      setComment('');
      toast.success('Report status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update report status');
    }
  };

  // Status functions are now imported from centralized config

  const openStatusDialog = (report) => {
    setSelectedReport(report);
    setStatusUpdate(report.status);
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (report) => {
    setReportToDelete(report);
    setOpenDeleteDialog(true);
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;

    try {
      setDeleting(true);
      await axios.delete(`${API_BASE_URL}/reports/${reportToDelete.id}`);
      setOpenDeleteDialog(false);
      setReportToDelete(null);
      setRefetch(prev => prev + 1);
      toast.success('Report deleted successfully!');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    } finally {
      setDeleting(false);
    }
  };

  // Assignment related functions
  const handleOpenAssignDialog = (report) => {
    setReportToAssign(report);
    setSelectedDepartment('');
    setSelectedStaff('');
    setStaffMembers([]);
    setOpenAssignDialog(true);
  };

  const fetchStaffMembers = async (department) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        params: {
          role: 'staff,supervisor',
          department: department,
          isActive: true
        }
      });
      setStaffMembers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching staff members:', error);
      setStaffMembers([]);
    }
  };

  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
    setSelectedStaff('');
    if (department) {
      fetchStaffMembers(department);
    } else {
      setStaffMembers([]);
    }
  };

  const handleAssignReport = async () => {
    if (!reportToAssign || !selectedDepartment || !selectedStaff) {
      toast.error('Please select both department and staff member');
      return;
    }

    try {
      setAssigning(true);
      await axios.patch(`${API_BASE_URL}/reports/${reportToAssign.id}/assign`, {
        assignedTo: selectedStaff,
        department: selectedDepartment,
        status: 'assigned'
      });

      setOpenAssignDialog(false);
      setReportToAssign(null);
      setSelectedDepartment('');
      setSelectedStaff('');
      setStaffMembers([]);
      setRefetch(prev => prev + 1);
      toast.success('Report assigned successfully!');
    } catch (error) {
      console.error('Error assigning report:', error);
      toast.error('Failed to assign report');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Grid>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Reports Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Showing {filteredReports.length} of {reports.length} reports
            </Typography>
          </Grid>
          <Grid>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="list">
                <ViewList sx={{ mr: 1 }} />
                List View
              </ToggleButton>
              <ToggleButton value="map">
                <MapIcon sx={{ mr: 1 }} />
                Map View
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {/* Filter Section */}
        {viewMode === 'list' && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
            <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mr: 2, fontWeight: 600 }}>
                Filters:
              </Typography>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {filterOptions.categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  {filterOptions.priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {filterOptions.statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={filters.assignedTo}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                  label="Assigned To"
                >
                  <MenuItem value="">All Assignees</MenuItem>
                  {filterOptions.assignedTo.map((assignee) => (
                    <MenuItem key={assignee} value={assignee}>
                      {assignee}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                color="secondary"
                onClick={clearAllFilters}
                disabled={!Object.values(filters).some(filter => filter)}
                size="small"
              >
                Clear Filters
              </Button>
            </Box>
          </Paper>
        )}

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
        <TableContainer sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Reporter</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography>Loading reports...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      {reports.length === 0 ? 'No reports found' : 'No reports match the selected filters'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow hover key={report.id}>
                    <TableCell>{report.title}</TableCell>
                    <TableCell>{report.reporterId?.name || 'Anonymous'}</TableCell>
                    <TableCell>{report.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={report.priority}
                        size="small"
                        color={report.priority === 'high' || report.priority === 'urgent' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(report.status)}
                        color={getStatusColor(report.status)}
                        size="small"
                        sx={{
                          minWidth: '100px',
                          height: '24px',
                          fontSize: '12px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '& .MuiChip-label': {
                            paddingLeft: '8px',
                            paddingRight: '8px',
                            lineHeight: '1.2'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{report.assignedTo?.name || '-'}</TableCell>
                    <TableCell>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedReport(report);
                            setOpenDetailsDialog(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Assign">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenAssignDialog(report)}
                        >
                          <Assignment />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Update Status">
                        <IconButton
                          size="small"
                          onClick={() => openStatusDialog(report)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Report">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(report)}
                          sx={{ color: 'error.main' }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
            </Paper>
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <MapView
                reports={filteredReports}
                onMarkerClick={(report) => {
                  setSelectedReport(report);
                  setOpenDetailsDialog(true);
                }}
              />
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>{selectedReport.title}</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedReport.description}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography variant="body2">{selectedReport.category}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Priority</Typography>
                  <Typography variant="body2">{selectedReport.priority}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={getStatusLabel(selectedReport.status)}
                      color={getStatusColor(selectedReport.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Reporter</Typography>
                  <Typography variant="body2">{selectedReport.reporterId?.name || 'Anonymous'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Location</Typography>
                  <Typography variant="body2">{selectedReport.location?.address || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Created At</Typography>
                  <Typography variant="body2">{new Date(selectedReport.createdAt).toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Resolved On</Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: selectedReport.status === 'resolved' && selectedReport.resolution?.resolvedAt
                        ? 'success.main'
                        : 'text.secondary',
                      fontWeight: selectedReport.status === 'resolved' && selectedReport.resolution?.resolvedAt
                        ? 600
                        : 400
                    }}
                  >
                    {selectedReport.status === 'resolved' && selectedReport.resolution?.resolvedAt
                      ? new Date(selectedReport.resolution.resolvedAt).toLocaleString()
                      : 'Pending'
                    }
                  </Typography>
                </Grid>
              </Grid>

              {selectedReport.media && selectedReport.media.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Media</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    {selectedReport.media.map((media, index) => {
                      // Handle both populated media objects and direct URLs
                      const mediaUrl = typeof media === 'string' ? media : media?.url;
                      const mediaType = typeof media === 'string' ? 'image' : media?.type;

                      if (!mediaUrl) return null;

                      if (mediaType === 'video') {
                        return (
                          <Box
                            key={index}
                            component="video"
                            src={mediaUrl}
                            controls
                            sx={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 1 }}
                          />
                        );
                      }

                      return (
                        <Box
                          key={index}
                          component="img"
                          src={mediaUrl}
                          alt={`Report media ${index + 1}`}
                          sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
          <Button
            onClick={() => {
              setOpenDetailsDialog(false);
              setStatusUpdate(selectedReport.status);
              setOpenDialog(true);
            }}
            variant="contained"
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Report Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                label="Status"
              >
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="acknowledged">Acknowledged</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Delete Report
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete this report?
          </Typography>
          {reportToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Report: {reportToDelete.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reporter: {reportToDelete.reporterId?.name || 'Anonymous'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(reportToDelete.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            <strong>Warning:</strong> This action cannot be undone. The report and all associated data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteReport}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Report Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign Report
        </DialogTitle>
        <DialogContent>
          {reportToAssign && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Report: {reportToAssign.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Category: {reportToAssign.category}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Priority: {reportToAssign.priority}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Assign to Staff Member</InputLabel>
              <Select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                label="Assign to Staff Member"
                disabled={!selectedDepartment || staffMembers.length === 0}
              >
                {staffMembers.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name} ({staff.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedDepartment && staffMembers.length === 0 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                No active staff members found in this department.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenAssignDialog(false)}
            disabled={assigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignReport}
            variant="contained"
            disabled={assigning || !selectedDepartment || !selectedStaff}
          >
            {assigning ? 'Assigning...' : 'Assign Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </motion.div>
  );
};

export default Reports;
