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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bu-backend-t0vl.onrender.com/api';

const REPORT_CATEGORIES = [
  // Potholes & Roads
  { value: 'road_pothole_filling', label: 'Pothole Filling', group: 'Potholes & Roads', color: '#ef4444' },
  { value: 'road_resurfacing', label: 'Road Resurfacing', group: 'Potholes & Roads', color: '#ef4444' },
  { value: 'road_divider_repair', label: 'Divider Repair', group: 'Potholes & Roads', color: '#ef4444' },
  { value: 'road_footpath_repair', label: 'Footpath Repair', group: 'Potholes & Roads', color: '#ef4444' },
  { value: 'road_speed_breaker', label: 'Speed Breaker', group: 'Potholes & Roads', color: '#ef4444' },
  // Garbage & Waste
  { value: 'garbage_household', label: 'Household Waste Pickup', group: 'Garbage & Waste', color: '#10b981' },
  { value: 'garbage_bulk', label: 'Bulk Waste Removal', group: 'Garbage & Waste', color: '#10b981' },
  { value: 'garbage_construction', label: 'Construction Debris', group: 'Garbage & Waste', color: '#10b981' },
  { value: 'garbage_hazardous', label: 'Hazardous Waste', group: 'Garbage & Waste', color: '#10b981' },
  { value: 'garbage_green', label: 'Green Waste', group: 'Garbage & Waste', color: '#10b981' },
  // Water Leaks & Supply
  { value: 'water_pipe_leak', label: 'Pipe Leak Repair', group: 'Water Leaks & Supply', color: '#3b82f6' },
  { value: 'water_supply_restoration', label: 'Water Supply Restoration', group: 'Water Leaks & Supply', color: '#3b82f6' },
  { value: 'water_valve_replacement', label: 'Valve Replacement', group: 'Water Leaks & Supply', color: '#3b82f6' },
  { value: 'water_meter_issues', label: 'Water Meter Issues', group: 'Water Leaks & Supply', color: '#3b82f6' },
  { value: 'water_borewell', label: 'Borewell Maintenance', group: 'Water Leaks & Supply', color: '#3b82f6' },
  // Streetlight Failure
  { value: 'light_bulb_replacement', label: 'Bulb Replacement', group: 'Streetlight Failure', color: '#f59e0b' },
  { value: 'light_wiring_fault', label: 'Wiring Fault', group: 'Streetlight Failure', color: '#f59e0b' },
  { value: 'light_pole_damage', label: 'Pole Damage', group: 'Streetlight Failure', color: '#f59e0b' },
  { value: 'light_timer_fault', label: 'Timer/Sensor Fault', group: 'Streetlight Failure', color: '#f59e0b' },
  { value: 'light_solar', label: 'Solar Light Maintenance', group: 'Streetlight Failure', color: '#f59e0b' },
  // Drainage
  { value: 'drain_blockage', label: 'Drain Blockage', group: 'Drainage', color: '#8b5cf6' },
  { value: 'drain_stormwater', label: 'Stormwater Overflow', group: 'Drainage', color: '#8b5cf6' },
  { value: 'drain_manhole', label: 'Manhole Cover', group: 'Drainage', color: '#8b5cf6' },
  { value: 'drain_sewage_overflow', label: 'Sewage Overflow', group: 'Drainage', color: '#8b5cf6' },
  { value: 'drain_pipe_repair', label: 'Drain Pipe Repair', group: 'Drainage', color: '#8b5cf6' },
  // Electricity
  { value: 'elec_power_outage', label: 'Power Outage', group: 'Electricity', color: '#ec4899' },
  { value: 'elec_transformer', label: 'Transformer Fault', group: 'Electricity', color: '#ec4899' },
  { value: 'elec_broken_wires', label: 'Broken Wires', group: 'Electricity', color: '#ec4899' },
  { value: 'elec_meter', label: 'Electricity Meter', group: 'Electricity', color: '#ec4899' },
  { value: 'elec_illegal', label: 'Illegal Connections', group: 'Electricity', color: '#ec4899' },
  // Sanitation
  { value: 'san_public_toilet', label: 'Public Toilet Maintenance', group: 'Sanitation', color: '#06b6d4' },
  { value: 'san_open_defecation', label: 'Open Defecation Control', group: 'Sanitation', color: '#06b6d4' },
  { value: 'san_sewage_treatment', label: 'Sewage Treatment', group: 'Sanitation', color: '#06b6d4' },
  { value: 'san_solid_waste', label: 'Solid Waste Management', group: 'Sanitation', color: '#06b6d4' },
  { value: 'san_street_sweeping', label: 'Street Sweeping', group: 'Sanitation', color: '#06b6d4' },
  { value: 'san_dead_animal', label: 'Dead Animal Removal', group: 'Sanitation', color: '#06b6d4' },
  { value: 'san_hospital_waste', label: 'Hospital Waste Disposal', group: 'Sanitation', color: '#06b6d4' },
  { value: 'san_drain_cleaning', label: 'Drain Cleaning', group: 'Sanitation', color: '#06b6d4' },
  { value: 'san_graffiti', label: 'Graffiti Removal', group: 'Sanitation', color: '#06b6d4' },
  { value: 'san_toilet_block', label: 'Community Toilet Block Repair', group: 'Sanitation', color: '#06b6d4' },
  // Utility Services
  { value: 'util_gas_pipeline', label: 'Gas Pipeline Repair', group: 'Utility Services', color: '#f97316' },
  { value: 'util_broadband', label: 'Internet / Broadband Infrastructure', group: 'Utility Services', color: '#f97316' },
  { value: 'util_cable_tv', label: 'Cable TV Line Issues', group: 'Utility Services', color: '#f97316' },
  { value: 'util_telephone_pole', label: 'Telephone Pole Maintenance', group: 'Utility Services', color: '#f97316' },
  { value: 'util_public_wifi', label: 'Public WiFi Upkeep', group: 'Utility Services', color: '#f97316' },
  { value: 'util_gas_meter', label: 'Gas Meter Issues', group: 'Utility Services', color: '#f97316' },
  { value: 'util_water_network', label: 'Water Supply Network', group: 'Utility Services', color: '#f97316' },
  { value: 'util_optical_fiber', label: 'Optical Fiber Laying', group: 'Utility Services', color: '#f97316' },
  { value: 'util_junction_box', label: 'Junction Box Faults', group: 'Utility Services', color: '#f97316' },
  { value: 'util_underground', label: 'Underground Utility Lines', group: 'Utility Services', color: '#f97316' },
];

// Group categories by their group name for display
const CATEGORY_GROUPS = [...new Set(REPORT_CATEGORIES.map(c => c.group))];

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
      console.log('Departments Fetch Response:', response.data);
      const departmentsData = response.data?.data || response.data || [];
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
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
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {dept.categories && dept.categories.length > 0 ? (() => {
                          const groups = {};
                          const unmatched = [];

                          dept.categories.forEach(val => {
                            const cat = REPORT_CATEGORIES.find(c => c.value === val);
                            if (cat) {
                              if (!groups[cat.group]) groups[cat.group] = { color: cat.color, items: [] };
                              groups[cat.group].items.push(cat.label);
                            } else {
                              unmatched.push(val);
                            }
                          });

                          return (
                            <>
                              {Object.entries(groups).map(([grp, { color, items }]) => (
                                <Box key={grp}>
                                  {/* ── Parent Category ── Bold filled chip */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                                    <Typography
                                      variant="caption"
                                      sx={{ fontWeight: 800, color: color, fontSize: '0.72rem', letterSpacing: 0.3 }}
                                    >
                                      {grp}
                                    </Typography>
                                    <Chip
                                      label={items.length}
                                      size="small"
                                      sx={{
                                        height: 16,
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        bgcolor: color,
                                        color: '#fff',
                                        '& .MuiChip-label': { px: 0.8 }
                                      }}
                                    />
                                  </Box>
                                  {/* ── Subcategories ── Light outlined chips, indented */}
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, pl: 2 }}>
                                    {items.map(item => (
                                      <Chip
                                        key={item}
                                        label={item}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: '0.62rem',
                                          height: 20,
                                          color: color,
                                          bgcolor: `${color}0d`,
                                          borderColor: `${color}40`,
                                          '&:hover': { bgcolor: `${color}20` }
                                        }}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              ))}
                              {/* ── Legacy/unmatched values ── */}
                              {unmatched.length > 0 && (
                                <Box display="flex" flexWrap="wrap" gap={0.4}>
                                  {unmatched.map(val => (
                                    <Chip key={val} label={val} size="small" variant="outlined"
                                      sx={{ fontSize: '0.7rem' }} />
                                  ))}
                                </Box>
                              )}
                            </>
                          );
                        })() : (
                          <Typography variant="body2" color="text.secondary">None</Typography>
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
            <InputLabel>Assigned Categories & Subcategories</InputLabel>
            <Select
              multiple
              value={formData.categories}
              onChange={(e) => handleFormChange('categories', e.target.value)}
              input={<OutlinedInput label="Assigned Categories & Subcategories" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const cat = REPORT_CATEGORIES.find(c => c.value === value);
                    return (
                      <Chip
                        key={value}
                        label={cat ? cat.label : value}
                        size="small"
                        sx={cat ? { bgcolor: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}44` } : {}}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {CATEGORY_GROUPS.map((group) => [
                <MenuItem key={`header-${group}`} disabled sx={{ fontWeight: 800, opacity: '1 !important', fontSize: '0.75rem', color: REPORT_CATEGORIES.find(c => c.group === group)?.color, pt: 1.5, pb: 0.5 }}>
                  ── {group.toUpperCase()} ──
                </MenuItem>,
                ...REPORT_CATEGORIES.filter(c => c.group === group).map((category) => (
                  <MenuItem key={category.value} value={category.value} sx={{ pl: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: category.color, flexShrink: 0 }} />
                      {category.label}
                    </Box>
                  </MenuItem>
                ))
              ])}
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