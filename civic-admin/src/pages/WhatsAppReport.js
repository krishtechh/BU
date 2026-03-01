import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    CircularProgress,
    IconButton,
    Card,
    CardMedia,
    Alert,
    Container
} from '@mui/material';
import { PhotoCamera, MyLocation, Send, CloudUpload } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const CATEGORIES = {
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

const WhatsAppReport = () => {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        description: '',
        category: '',
    });
    const [location, setLocation] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getCurrentLocation = () => {
        setLocating(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Reverse geocoding to get address (Simplified for now)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    setLocation({
                        latitude,
                        longitude,
                        address: data.display_name || `${latitude}, ${longitude}`,
                        locality: data.address?.suburb || data.address?.neighbourhood,
                        city: data.address?.city || data.address?.town,
                        pincode: data.address?.postcode
                    });
                    toast.success('Location captured successfully!');
                } catch (err) {
                    console.error('Geocoding error:', err);
                    setLocation({
                        latitude,
                        longitude,
                        address: `${latitude}, ${longitude}`
                    });
                } finally {
                    setLocating(false);
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Failed to get location. Please allow location access.');
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!location) {
            toast.error('Please capture your location first');
            return;
        }

        if (!formData.category) {
            toast.error('Please select a category');
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title || `WhatsApp: ${CATEGORIES[formData.category]}`);
            submitData.append('description', `Report by ${formData.name}. ${formData.description}`);
            submitData.append('category', formData.category);
            submitData.append('location[address]', location.address);
            submitData.append('location[latitude]', location.latitude.toString());
            submitData.append('location[longitude]', location.longitude.toString());
            if (location.locality) submitData.append('location[locality]', location.locality);
            if (location.city) submitData.append('location[city]', location.city);
            if (location.pincode) submitData.append('location[pincode]', location.pincode);

            if (photo) {
                submitData.append('media', photo);
            }

            const response = await axios.post(`${API_BASE_URL}/reports`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success('Your report has been submitted successfully!');
                // Reset form
                setFormData({ name: '', title: '', description: '', category: '' });
                setPhoto(null);
                setPhotoPreview(null);
                setLocation(null);
            }
        } catch (err) {
            console.error('Submission error:', err);
            toast.error(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, bgcolor: '#fdfdfd' }}>
                    <Box textAlign="center" mb={3}>
                        <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
                            Citizen Connect
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Report civic issues directly to your local authorities.
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Your Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Category of Issue</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        label="Category of Issue"
                                    >
                                        {Object.entries(CATEGORIES).map(([key, label]) => (
                                            <MenuItem key={key} value={key}>{label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Title (Brief summary)"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Large pothole on Main St"
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Tell us what's happening..."
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    <Button
                                        variant="outlined"
                                        startIcon={locating ? <CircularProgress size={20} /> : <MyLocation />}
                                        onClick={getCurrentLocation}
                                        disabled={locating}
                                        color={location ? "success" : "primary"}
                                        fullWidth
                                        sx={{ py: 1.5 }}
                                    >
                                        {location ? 'Location Captured' : 'Tag Current Location'}
                                    </Button>

                                    {location && (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                            📍 {location.address}
                                        </Typography>
                                    )}

                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="photo-upload"
                                        type="file"
                                        onChange={handlePhotoChange}
                                    />
                                    <label htmlFor="photo-upload">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<PhotoCamera />}
                                            fullWidth
                                            sx={{ py: 1.5 }}
                                        >
                                            {photo ? 'Change Photo' : 'Upload Photo'}
                                        </Button>
                                    </label>

                                    {photoPreview && (
                                        <Card sx={{ mt: 1, borderRadius: 2 }}>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={photoPreview}
                                                alt="Preview"
                                            />
                                        </Card>
                                    )}
                                </Box>
                            </Grid>

                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <Send />}
                                    sx={{
                                        py: 2,
                                        borderRadius: 2,
                                        boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {loading ? 'Submitting...' : 'Submit Report'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default WhatsAppReport;
