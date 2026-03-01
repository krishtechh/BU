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
  Typography,
  Avatar,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bu-backend-t0vl.onrender.com/api';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    department: '',
    assignedArea: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    verified: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    roles: [],
    departments: [],
    verifiedOptions: [
      { value: 'true', label: 'Verified' },
      { value: 'false', label: 'Unverified' }
    ]
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const [staffResponse, deptResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/admin/departments`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        console.log('Staff Fetch Responses:', { staff: staffResponse.data, departments: deptResponse.data });

        const usersData = staffResponse.data?.data || staffResponse.data || [];
        const staffData = Array.isArray(usersData) ? usersData.filter(user => user.role !== 'citizen') : [];
        setStaff(staffData);

        const departmentsData = deptResponse.data.data || [];
        setDepartments(departmentsData);

        const roles = [...new Set(staffData.map(u => u.role).filter(Boolean))];
        const departmentCodes = [...new Set(staffData.map(u => u.department).filter(Boolean))];

        setFilterOptions(prev => ({
          ...prev,
          roles,
          departments: departmentCodes
        }));

        applyFilters(staffData);
      } catch (error) {
        console.error('Error fetching staff:', error);
        setStaff([]);
        setFilteredStaff([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters(staff);
  }, [filters, staff]);

  const applyFilters = (staffData) => {
    let filtered = [...staffData];

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }
    if (filters.department) {
      filtered = filtered.filter(user => user.department === filters.department);
    }
    if (filters.verified) {
      const isVerified = filters.verified === 'true';
      filtered = filtered.filter(user => user.isVerified === isVerified);
    }

    setFilteredStaff(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      role: '',
      department: '',
      verified: ''
    });
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const endpoint = currentStatus ? 'deactivate' : 'activate';
      await axios.put(`${API_BASE_URL}/users/${userId}/${endpoint}`);
      // Refetch staff to update the list
      const response = await axios.get(`${API_BASE_URL}/users`);
      const usersData = response.data.data || [];
      const staffData = usersData.filter(user => user.role !== 'citizen');
      setStaff(staffData);
      applyFilters(staffData);
    } catch (error) {
      console.error('Error updating staff status:', error);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      staff: 'primary',
      supervisor: 'secondary',
      admin: 'error'
    };
    return colors[role] || 'default';
  };

  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true);
    setFormError('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'staff',
      department: '',
      assignedArea: ''
    });
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setFormError('');
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateStaff = async () => {
    try {
      setFormLoading(true);
      setFormError('');

      if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.department) {
        setFormError('Please fill in all required fields');
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/admin/staff/create`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = response.data.data || [];
      const staffData = usersData.filter(user => user.role !== 'citizen');
      setStaff(staffData);
      applyFilters(staffData);

      handleCreateDialogClose();
    } catch (error) {
      console.error('Error creating staff:', error);
      setFormError(error.response?.data?.message || 'Error creating staff member');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Staff Management ({filteredStaff.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredStaff.length} of {staff.length} staff members
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateDialogOpen}
          sx={{ borderRadius: 2 }}
        >
          + Create Staff
        </Button>
      </Box>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mr: 2, fontWeight: 600 }}>
            Filters:
          </Typography>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              label="Role"
            >
              <MenuItem value="">All Roles</MenuItem>
              {filterOptions.roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              label="Department"
            >
              <MenuItem value="">All Departments</MenuItem>
              {filterOptions.departments.map((department) => (
                <MenuItem key={department} value={department}>
                  {department}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Verified</InputLabel>
            <Select
              value={filters.verified}
              onChange={(e) => handleFilterChange('verified', e.target.value)}
              label="Verified"
            >
              <MenuItem value="">All Staff</MenuItem>
              {filterOptions.verifiedOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
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

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, maxHeight: '70vh' }}>
        <TableContainer sx={{ height: '100%', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Staff Member ({filteredStaff.length})</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Verified</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography>Loading staff...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      {staff.length === 0 ? 'No staff found' : 'No staff match the selected filters'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                        {user.name}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isVerified ? 'Verified' : 'Unverified'}
                        color={user.isVerified ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={user.isActive}
                            onChange={() => handleStatusToggle(user.id, user.isActive)}
                            size="small"
                          />
                        }
                        label={user.isActive ? 'Active' : 'Inactive'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Staff Member</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Name *"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone *"
            value={formData.phone}
            onChange={(e) => handleFormChange('phone', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password *"
            type="password"
            value={formData.password}
            onChange={(e) => handleFormChange('password', e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role *</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => handleFormChange('role', e.target.value)}
              label="Role *"
            >
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="supervisor">Supervisor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Department *</InputLabel>
            <Select
              value={formData.department}
              onChange={(e) => handleFormChange('department', e.target.value)}
              label="Department *"
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.code}>
                  {dept.name} ({dept.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Assigned Area"
            value={formData.assignedArea}
            onChange={(e) => handleFormChange('assignedArea', e.target.value)}
            margin="normal"
            helperText="Optional: Specific area for staff members"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateStaff}
            variant="contained"
            color="primary"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={24} /> : 'Create Staff'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;