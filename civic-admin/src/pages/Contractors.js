import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Rating,
  Button,
  Divider,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  Phone,
  Email,
  LocationOn,
  Verified,
  Build,
  WaterDrop,
  Bolt,
  DeleteOutline,
  Lightbulb,
  Plumbing,
  CleaningServices,
  Handyman,
  Traffic,
  Park,
  HealthAndSafety,
  SignalWifi4Bar,
  ReportProblem,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Category / Subcategory Definitions ─────────────────────────────────────
const CATEGORIES = [
  {
    id: 'all',
    label: 'All Contractors',
    icon: <Handyman />,
    color: '#6366f1',
    subcategories: [],
  },
  {
    id: 'road',
    label: 'Potholes & Roads',
    icon: <Traffic />,
    color: '#ef4444',
    subcategories: ['Pothole Filling', 'Road Resurfacing', 'Divider Repair', 'Footpath Repair', 'Speed Breaker'],
  },
  {
    id: 'garbage',
    label: 'Garbage & Waste',
    icon: <DeleteOutline />,
    color: '#10b981',
    subcategories: ['Household Waste Pickup', 'Bulk Waste Removal', 'Construction Debris', 'Hazardous Waste', 'Green Waste'],
  },
  {
    id: 'water',
    label: 'Water Leaks & Supply',
    icon: <WaterDrop />,
    color: '#3b82f6',
    subcategories: ['Pipe Leak Repair', 'Water Supply Restoration', 'Valve Replacement', 'Water Meter Issues', 'Borewell Maintenance'],
  },
  {
    id: 'streetlight',
    label: 'Streetlight Failure',
    icon: <Lightbulb />,
    color: '#f59e0b',
    subcategories: ['Bulb Replacement', 'Wiring Fault', 'Pole Damage', 'Timer/Sensor Fault', 'Solar Light Maintenance'],
  },
  {
    id: 'drainage',
    label: 'Drainage',
    icon: <Plumbing />,
    color: '#8b5cf6',
    subcategories: ['Drain Blockage', 'Stormwater Overflow', 'Manhole Cover', 'Sewage Overflow', 'Drain Pipe Repair'],
  },
  {
    id: 'electricity',
    label: 'Electricity',
    icon: <Bolt />,
    color: '#ec4899',
    subcategories: ['Power Outage', 'Transformer Fault', 'Broken Wires', 'Electricity Meter', 'Illegal Connections'],
  },
  {
    id: 'sanitation',
    label: 'Sanitation',
    icon: <CleaningServices />,
    color: '#06b6d4',
    subcategories: [
      'Public Toilet Maintenance',
      'Open Defecation Control',
      'Sewage Treatment',
      'Solid Waste Management',
      'Street Sweeping',
      'Dead Animal Removal',
      'Hospital Waste Disposal',
      'Drain Cleaning',
      'Graffiti Removal',
      'Community Toilet Block Repair',
    ],
  },
  {
    id: 'utility',
    label: 'Utility Services',
    icon: <SignalWifi4Bar />,
    color: '#f97316',
    subcategories: [
      'Gas Pipeline Repair',
      'Internet / Broadband Infrastructure',
      'Cable TV Line Issues',
      'Telephone Pole Maintenance',
      'Public WiFi Upkeep',
      'Gas Meter Issues',
      'Water Supply Network',
      'Optical Fiber Laying',
      'Junction Box Faults',
      'Underground Utility Lines',
    ],
  },
];

// ─── Dummy Contractor Data ─────────────────────────────────────────────────
const CONTRACTORS = [
  // ROAD
  { id: 1, name: 'Shree Ram Constructions', category: 'road', subcategory: 'Pothole Filling', location: 'Ranchi, Jharkhand', phone: '+91 98765 43210', email: 'sramcon@gmail.com', rating: 4.5, completedJobs: 234, activeJobs: 8, verified: true, license: 'JH-CON-0021', experience: '12 yrs', avatar: 'S' },
  { id: 2, name: 'National Road Builders', category: 'road', subcategory: 'Road Resurfacing', location: 'Dhanbad, Jharkhand', phone: '+91 91234 56789', email: 'nrb@roads.in', rating: 4.8, completedJobs: 512, activeJobs: 15, verified: true, license: 'JH-CON-0044', experience: '20 yrs', avatar: 'N' },
  { id: 3, name: 'Pathways Infra Pvt Ltd', category: 'road', subcategory: 'Footpath Repair', location: 'Jamshedpur, Jharkhand', phone: '+91 87654 32109', email: 'pathways@infra.co', rating: 4.1, completedJobs: 88, activeJobs: 3, verified: true, license: 'JH-CON-0067', experience: '7 yrs', avatar: 'P' },
  { id: 4, name: 'Bharat Road Co.', category: 'road', subcategory: 'Divider Repair', location: 'Bokaro, Jharkhand', phone: '+91 99887 76655', email: 'bharatroad@mail.com', rating: 3.9, completedJobs: 45, activeJobs: 2, verified: false, license: 'JH-CON-0098', experience: '5 yrs', avatar: 'B' },

  // GARBAGE
  { id: 5, name: 'CleanCity Solutions', category: 'garbage', subcategory: 'Household Waste Pickup', location: 'Ranchi, Jharkhand', phone: '+91 96325 87410', email: 'cleancity@gmail.com', rating: 4.7, completedJobs: 680, activeJobs: 22, verified: true, license: 'JH-WAS-0012', experience: '9 yrs', avatar: 'C' },
  { id: 6, name: 'EcoWaste Pvt Ltd', category: 'garbage', subcategory: 'Hazardous Waste', location: 'Jamshedpur, Jharkhand', phone: '+91 73456 89012', email: 'eco@waste.in', rating: 4.6, completedJobs: 190, activeJobs: 6, verified: true, license: 'JH-WAS-0033', experience: '14 yrs', avatar: 'E' },
  { id: 7, name: 'GreenBin Services', category: 'garbage', subcategory: 'Green Waste', location: 'Hazaribagh, Jharkhand', phone: '+91 82135 64709', email: 'greenbin@in.co', rating: 4.2, completedJobs: 130, activeJobs: 4, verified: true, license: 'JH-WAS-0045', experience: '6 yrs', avatar: 'G' },

  // WATER
  { id: 8, name: 'AquaFix Engineers', category: 'water', subcategory: 'Pipe Leak Repair', location: 'Ranchi, Jharkhand', phone: '+91 94567 12308', email: 'aquafix@plumb.in', rating: 4.9, completedJobs: 402, activeJobs: 11, verified: true, license: 'JH-PLB-0007', experience: '15 yrs', avatar: 'A' },
  { id: 9, name: 'Jal Board Contractors', category: 'water', subcategory: 'Water Supply Restoration', location: 'Dhanbad, Jharkhand', phone: '+91 77812 34560', email: 'jbc@water.gov', rating: 4.4, completedJobs: 295, activeJobs: 9, verified: true, license: 'JH-PLB-0019', experience: '18 yrs', avatar: 'J' },
  { id: 10, name: 'HydroTech Services', category: 'water', subcategory: 'Borewell Maintenance', location: 'Giridih, Jharkhand', phone: '+91 65432 98710', email: 'hydrotech@mail.com', rating: 4.0, completedJobs: 77, activeJobs: 2, verified: false, license: 'JH-PLB-0054', experience: '4 yrs', avatar: 'H' },

  // STREETLIGHT
  { id: 11, name: 'BrightPath Electricals', category: 'streetlight', subcategory: 'Bulb Replacement', location: 'Ranchi, Jharkhand', phone: '+91 98123 45670', email: 'brightpath@elec.in', rating: 4.6, completedJobs: 540, activeJobs: 18, verified: true, license: 'JH-ELC-0003', experience: '11 yrs', avatar: 'B' },
  { id: 12, name: 'LumiTech India', category: 'streetlight', subcategory: 'Solar Light Maintenance', location: 'Jamshedpur, Jharkhand', phone: '+91 81234 56709', email: 'lumitech@solar.in', rating: 4.8, completedJobs: 210, activeJobs: 7, verified: true, license: 'JH-ELC-0028', experience: '8 yrs', avatar: 'L' },
  { id: 13, name: 'PowerGrid Fixers', category: 'streetlight', subcategory: 'Pole Damage', location: 'Bokaro, Jharkhand', phone: '+91 76543 21090', email: 'powergrid@fix.com', rating: 3.8, completedJobs: 60, activeJobs: 1, verified: false, license: 'JH-ELC-0071', experience: '3 yrs', avatar: 'P' },

  // DRAINAGE
  { id: 14, name: 'FlowFree Engineers', category: 'drainage', subcategory: 'Drain Blockage', location: 'Ranchi, Jharkhand', phone: '+91 93456 78021', email: 'flowfree@drain.co', rating: 4.5, completedJobs: 320, activeJobs: 10, verified: true, license: 'JH-DRN-0009', experience: '13 yrs', avatar: 'F' },
  { id: 15, name: 'ManholePro Services', category: 'drainage', subcategory: 'Manhole Cover', location: 'Dhanbad, Jharkhand', phone: '+91 84523 10987', email: 'mhpro@drain.in', rating: 4.3, completedJobs: 145, activeJobs: 5, verified: true, license: 'JH-DRN-0023', experience: '9 yrs', avatar: 'M' },

  // ELECTRICITY
  { id: 16, name: 'Vidyut Seva Ltd', category: 'electricity', subcategory: 'Power Outage', location: 'Ranchi, Jharkhand', phone: '+91 99001 23456', email: 'vidyut@seva.gov', rating: 4.7, completedJobs: 890, activeJobs: 30, verified: true, license: 'JH-ELC-0001', experience: '22 yrs', avatar: 'V' },
  { id: 17, name: 'ZapTech Electricals', category: 'electricity', subcategory: 'Transformer Fault', location: 'Jamshedpur, Jharkhand', phone: '+91 85432 10987', email: 'zaptech@elec.in', rating: 4.4, completedJobs: 230, activeJobs: 8, verified: true, license: 'JH-ELC-0016', experience: '10 yrs', avatar: 'Z' },
  { id: 18, name: 'WireWorks India', category: 'electricity', subcategory: 'Broken Wires', location: 'Bokaro, Jharkhand', phone: '+91 74321 09876', email: 'wireworks@in.co', rating: 4.0, completedJobs: 98, activeJobs: 3, verified: false, license: 'JH-ELC-0088', experience: '6 yrs', avatar: 'W' },

  // SANITATION
  { id: 19, name: 'SwachBharat Workers', category: 'sanitation', subcategory: 'Public Toilet Maintenance', location: 'Ranchi, Jharkhand', phone: '+91 96001 23456', email: 'swach@bharat.gov', rating: 4.6, completedJobs: 750, activeJobs: 25, verified: true, license: 'JH-SAN-0005', experience: '17 yrs', avatar: 'S' },
  { id: 20, name: 'CleanDrain Co.', category: 'sanitation', subcategory: 'Drain Cleaning', location: 'Dhanbad, Jharkhand', phone: '+91 87654 32101', email: 'cleandrain@co.in', rating: 4.3, completedJobs: 480, activeJobs: 14, verified: true, license: 'JH-SAN-0018', experience: '12 yrs', avatar: 'C' },
  { id: 21, name: 'BioWaste Handlers', category: 'sanitation', subcategory: 'Hospital Waste Disposal', location: 'Jamshedpur, Jharkhand', phone: '+91 72345 67890', email: 'biowaste@handle.in', rating: 4.8, completedJobs: 310, activeJobs: 9, verified: true, license: 'JH-SAN-0031', experience: '14 yrs', avatar: 'B' },
  { id: 22, name: 'StreetSweep Services', category: 'sanitation', subcategory: 'Street Sweeping', location: 'Hazaribagh, Jharkhand', phone: '+91 63456 78901', email: 'sweep@streets.in', rating: 4.1, completedJobs: 920, activeJobs: 40, verified: true, license: 'JH-SAN-0042', experience: '8 yrs', avatar: 'S' },
  { id: 23, name: 'AniCare Removals', category: 'sanitation', subcategory: 'Dead Animal Removal', location: 'Bokaro, Jharkhand', phone: '+91 91234 56780', email: 'anicare@remove.co', rating: 3.9, completedJobs: 65, activeJobs: 2, verified: false, license: 'JH-SAN-0067', experience: '5 yrs', avatar: 'A' },

  // UTILITY
  { id: 24, name: 'GasTech Pipelines', category: 'utility', subcategory: 'Gas Pipeline Repair', location: 'Ranchi, Jharkhand', phone: '+91 97890 12345', email: 'gastech@pipe.in', rating: 4.7, completedJobs: 190, activeJobs: 7, verified: true, license: 'JH-UTL-0004', experience: '16 yrs', avatar: 'G' },
  { id: 25, name: 'FiberNet Infra', category: 'utility', subcategory: 'Optical Fiber Laying', location: 'Jamshedpur, Jharkhand', phone: '+91 86789 01234', email: 'fibernet@infra.co', rating: 4.9, completedJobs: 420, activeJobs: 12, verified: true, license: 'JH-UTL-0011', experience: '10 yrs', avatar: 'F' },
  { id: 26, name: 'TelePost Works', category: 'utility', subcategory: 'Telephone Pole Maintenance', location: 'Dhanbad, Jharkhand', phone: '+91 75678 90123', email: 'telepost@works.in', rating: 4.2, completedJobs: 115, activeJobs: 4, verified: true, license: 'JH-UTL-0029', experience: '9 yrs', avatar: 'T' },
  { id: 27, name: 'SmartCity WiFi', category: 'utility', subcategory: 'Public WiFi Upkeep', location: 'Ranchi, Jharkhand', phone: '+91 93210 98765', email: 'smartcity@wifi.gov', rating: 4.5, completedJobs: 80, activeJobs: 6, verified: true, license: 'JH-UTL-0037', experience: '5 yrs', avatar: 'S' },
  { id: 28, name: 'Underground Utilities Ltd', category: 'utility', subcategory: 'Underground Utility Lines', location: 'Bokaro, Jharkhand', phone: '+91 64321 09876', email: 'underground@util.in', rating: 4.0, completedJobs: 55, activeJobs: 2, verified: false, license: 'JH-UTL-0055', experience: '7 yrs', avatar: 'U' },
];

// ─── Rating colour helper ──────────────────────────────────────────────────
const ratingColor = (r) => (r >= 4.5 ? '#10b981' : r >= 4.0 ? '#f59e0b' : '#ef4444');

// ─── Contractor Card ──────────────────────────────────────────────────────
const ContractorCard = ({ contractor, index }) => {
  const theme = useTheme();
  const cat = CATEGORIES.find((c) => c.id === contractor.category) || CATEGORIES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 120 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 20px 40px ${alpha(cat.color, 0.15)}`,
            borderColor: alpha(cat.color, 0.3),
          },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 52,
              height: 52,
              fontSize: '1.3rem',
              fontWeight: 800,
              background: `linear-gradient(135deg, ${cat.color} 0%, ${alpha(cat.color, 0.6)} 100%)`,
              boxShadow: `0 8px 20px ${alpha(cat.color, 0.35)}`,
            }}
          >
            {contractor.avatar}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {contractor.name}
              </Typography>
              {contractor.verified && (
                <Verified sx={{ fontSize: 16, color: theme.palette.primary.main }} />
              )}
            </Box>
            <Chip
              label={contractor.subcategory}
              size="small"
              sx={{
                mt: 0.5,
                height: 22,
                fontSize: '0.68rem',
                fontWeight: 600,
                bgcolor: alpha(cat.color, 0.12),
                color: cat.color,
                border: `1px solid ${alpha(cat.color, 0.25)}`,
              }}
            />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: ratingColor(contractor.rating), lineHeight: 1 }}>
              {contractor.rating}
            </Typography>
            <Rating value={contractor.rating} readOnly size="small" precision={0.5} sx={{ mt: 0.3 }} />
          </Box>
        </Box>

        <Divider sx={{ mb: 2, opacity: 0.5 }} />

        {/* Stats row */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {[
            { label: 'Completed', value: contractor.completedJobs, color: theme.palette.success.main },
            { label: 'Active Jobs', value: contractor.activeJobs, color: theme.palette.warning.main },
            { label: 'Experience', value: contractor.experience, color: theme.palette.info.main },
          ].map((s) => (
            <Grid size={4} key={s.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: alpha(s.color, 0.08),
                  border: `1px solid ${alpha(s.color, 0.15)}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: s.color }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                  {s.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Completion bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Job Completion Rate</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: ratingColor(contractor.rating) }}>
              {Math.round((contractor.completedJobs / (contractor.completedJobs + contractor.activeJobs)) * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(contractor.completedJobs / (contractor.completedJobs + contractor.activeJobs)) * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(cat.color, 0.12),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${cat.color}, ${alpha(cat.color, 0.6)})`,
              },
            }}
          />
        </Box>

        {/* Contact details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{contractor.location}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{contractor.phone}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{contractor.email}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2, opacity: 0.4 }} />

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Chip
            label={`Lic: ${contractor.license}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.62rem', height: 20 }}
          />
          <Button
            size="small"
            variant="contained"
            sx={{
              borderRadius: 2,
              fontSize: '0.7rem',
              py: 0.5,
              px: 1.5,
              background: `linear-gradient(135deg, ${cat.color}, ${alpha(cat.color, 0.75)})`,
              boxShadow: `0 4px 12px ${alpha(cat.color, 0.35)}`,
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            Assign Work
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const Contractors = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = CONTRACTORS.filter((c) => {
    const matchCat = activeTab === 'all' || c.category === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.subcategory.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const activeCat = CATEGORIES.find((c) => c.id === activeTab) || CATEGORIES[0];

  // Summary stats
  const totalContractors = CONTRACTORS.length;
  const verifiedCount = CONTRACTORS.filter((c) => c.verified).length;
  const avgRating = (CONTRACTORS.reduce((s, c) => s + c.rating, 0) / totalContractors).toFixed(1);
  const activeJobs = CONTRACTORS.reduce((s, c) => s + c.activeJobs, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Contractor Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verified contractors listed by department and category. All data is for demonstration purposes.
          </Typography>
        </motion.div>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'Total Contractors', value: totalContractors, color: theme.palette.primary.main, icon: <Build /> },
          { label: 'Verified', value: verifiedCount, color: '#10b981', icon: <Verified /> },
          { label: 'Avg. Rating', value: avgRating, color: '#f59e0b', icon: <ReportProblem /> },
          { label: 'Active Jobs', value: activeJobs, color: '#ec4899', icon: <Handyman /> },
        ].map((s, i) => (
          <Grid size={{ xs: 6, md: 3 }} key={s.label}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${alpha(s.color, 0.2)}`,
                  background: `linear-gradient(135deg, ${alpha(s.color, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 70%)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(s.color, 0.15),
                    color: s.color,
                  }}
                >
                  {s.icon}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1, color: s.color }}>
                    {s.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Tabs + Search */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
        }}
      >
        {/* Category Tabs */}
        <Box sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, px: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { minHeight: 52, fontSize: '0.78rem', fontWeight: 600 },
              '& .MuiTabs-indicator': {
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            {CATEGORIES.map((cat) => (
              <Tab
                key={cat.id}
                value={cat.id}
                label={cat.label}
                icon={React.cloneElement(cat.icon, { sx: { fontSize: 18, color: activeTab === cat.id ? cat.color : 'inherit' } })}
                iconPosition="start"
                sx={{ gap: 0.5, color: activeTab === cat.id ? `${cat.color} !important` : 'text.secondary' }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Search + subcategories */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search contractors, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          {activeCat.subcategories.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {activeCat.subcategories.map((sub) => (
                <Chip
                  key={sub}
                  label={sub}
                  size="small"
                  onClick={() => setSearch(sub)}
                  sx={{
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    height: 26,
                    bgcolor: alpha(activeCat.color, 0.08),
                    color: activeCat.color,
                    border: `1px solid ${alpha(activeCat.color, 0.2)}`,
                    '&:hover': { bgcolor: alpha(activeCat.color, 0.18) },
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Results count */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Showing <strong>{filtered.length}</strong> contractor{filtered.length !== 1 ? 's' : ''}
          {search && ` matching "${search}"`}
        </Typography>
      </Box>

      {/* Contractor Grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Build sx={{ fontSize: 64, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
              <Typography color="text.secondary" variant="h6">No contractors found</Typography>
              <Typography variant="body2" color="text.secondary">Try a different category or search term</Typography>
            </Box>
          </motion.div>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((contractor, i) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={contractor.id}>
                <ContractorCard contractor={contractor} index={i} />
              </Grid>
            ))}
          </Grid>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Contractors;
