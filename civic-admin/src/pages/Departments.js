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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const REPORT_CATEGORIES = [
  { value: 'road_issue', label: 'Road Issue' },
  { value: 'water_supply', label: 'Water Supply' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'garbage', label: 'Garbage' },
  { value: 'drainage', label: 'Drainage' },
  { value: 'street_light', label: 'Street Light' },
  { value: 'traffic', label: 'Traffic' },
  { value: 'pollution', label: 'Pollution' },
  { value: 'encroachment', label: 'Encroachment' },
  { value: 'other', label: 'Other' }
];

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    categories: [],
    contactEmail: '',
    contactPhone: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (department = null) => {
    if (department) {
      setEditMode(true);
      setCurrentDepartment(department);
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description || '',
        categories: department.categories || [],
        contactEmail: department.contactEmail || '',
        contactPhone: department.contactPhone || ''
      });
    } else {
      setEditMode(false);
      setCurrentDepartment(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        categories: [],
        contactEmail: '',
        contactPhone: ''
      });
    }
    setFormError('');
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setFormError('');
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setFormLoading(true);
      setFormError('');

      if (!formData.name || !formData.code) {
        setFormError('Department name and code are required');
        return;
      }

      const token = localStorage.getItem('token');

      if (editMode) {
        await axios.put(
          `${API_BASE_URL}/admin/departments/${currentDepartment.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${API_BASE_URL}/admin/departments`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      await fetchDepartments();
      handleDialogClose();
    } catch (error) {
      console.error('Error saving department:', error);
      setFormError(error.response?.data?.message || 'Error saving department');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (department) => {
    if (!window.confirm(`Are you sure you want to delete ${department.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/admin/departments/${department.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      alert(error.response?.data?.message || 'Error deleting department');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Departments Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage departments and their assigned categories
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleDialogOpen()}
          sx={{ borderRadius: 2 }}
        >
          + Create Department
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Categories</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No departments found. Create your first department.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((dept) => (
                  <TableRow hover key={dept.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight={600}>
                        {dept.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={dept.code} color="primary" size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dept.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {dept.categories && dept.categories.length > 0 ? (
                          dept.categories.slice(0, 3).map((cat) => (
                            <Chip key={cat} label={cat} size="small" variant="outlined" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            None
                          </Typography>
                        )}
                        {dept.categories && dept.categories.length > 3 && (
                          <Chip label={`+${dept.categories.length - 3}`} size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{dept.contactEmail || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dept.contactPhone || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dept.isActive ? 'Active' : 'Inactive'}
                        color={dept.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleDialogOpen(dept)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(dept)}
                        >
                          <DeleteIcon fontSize="small" />
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

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Department' : 'Create New Department'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Department Name *"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Department Code *"
            value={formData.code}
            onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
            margin="normal"
            helperText="Uppercase code (e.g., PWD, ELEC, WATER)"
            disabled={editMode}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Assigned Categories</InputLabel>
            <Select
              multiple
              value={formData.categories}
              onChange={(e) => handleFormChange('categories', e.target.value)}
              input={<OutlinedInput label="Assigned Categories" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {REPORT_CATEGORIES.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Contact Email"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleFormChange('contactEmail', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contact Phone"
            value={formData.contactPhone}
            onChange={(e) => handleFormChange('contactPhone', e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={24} /> : editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Departments;