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
  Button
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bu-backend-t0vl.onrender.com/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filters, setFilters] = useState({
    department: '',
    verified: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    verifiedOptions: [
      { value: 'true', label: 'Verified' },
      { value: 'false', label: 'Unverified' }
    ]
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/users`);
        const usersData = response.data.data || [];

        // Filter to only show citizens
        const citizenData = usersData.filter(user => user.role === 'citizen');
        setUsers(citizenData);

        // Extract unique filter options from citizen data
        const departments = [...new Set(citizenData.map(u => u.department).filter(Boolean))];

        setFilterOptions(prev => ({
          ...prev,
          departments
        }));

        // Apply current filters
        applyFilters(citizenData);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters(users);
  }, [filters, users]);

  const applyFilters = (usersData) => {
    let filtered = [...usersData];

    if (filters.department) {
      filtered = filtered.filter(user => user.department === filters.department);
    }
    if (filters.verified) {
      const isVerified = filters.verified === 'true';
      filtered = filtered.filter(user => user.isVerified === isVerified);
    }

    setFilteredUsers(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      department: '',
      verified: ''
    });
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const endpoint = currentStatus ? 'deactivate' : 'activate';
      await axios.put(`${API_BASE_URL}/users/${userId}/${endpoint}`);
      // Refetch users to update the list
      const response = await axios.get(`${API_BASE_URL}/users`);
      const usersData = response.data.data || [];
      const citizenData = usersData.filter(user => user.role === 'citizen');
      setUsers(citizenData);
      applyFilters(citizenData);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      citizen: 'default',
      staff: 'primary',
      supervisor: 'secondary',
      admin: 'error'
    };
    return colors[role] || 'default';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Citizens Management ({filteredUsers.length})
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Showing {filteredUsers.length} of {users.length} citizens
      </Typography>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mr: 2, fontWeight: 600 }}>
            Filters:
          </Typography>

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
              <MenuItem value="">All Citizens</MenuItem>
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

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, height: 'calc(100vh - 300px)' }}>
        <TableContainer sx={{ height: '100%', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Citizen ({filteredUsers.length})</TableCell>
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
                    <Typography>Loading citizens...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      {users.length === 0 ? 'No citizens found' : 'No citizens match the selected filters'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
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
    </Box>
  );
};

export default Users;
