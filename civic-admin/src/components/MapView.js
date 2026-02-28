import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Box, Typography, Chip } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getStatusColor, getStatusLabel } from '../constants/reportStatus';
import MarkerClusterGroup from './MarkerClusterGroup';
import ClusterMarker from './ClusterMarker';
import '../styles/mapClustering.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    ">
      <div style="
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
      "></div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const getMarkerColor = (status) => {
  const colorMap = {
    submitted: '#3b82f6',
    acknowledged: '#8b5cf6',
    assigned: '#f59e0b',
    in_progress: '#f97316',
    resolved: '#10b981',
    rejected: '#ef4444',
    closed: '#6b7280',
  };
  return colorMap[status] || '#3b82f6';
};

const MapBounds = ({ reports }) => {
  const map = useMap();

  useEffect(() => {
    if (reports && reports.length > 0) {
      const bounds = reports
        .filter(report => report.location?.latitude && report.location?.longitude)
        .map(report => [report.location.latitude, report.location.longitude]);

      if (bounds.length > 0) {
        // Add a small delay to ensure cluster group is ready
        setTimeout(() => {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }, 500);
      }
    }
  }, [reports, map]);

  return null;
};

const MapView = ({ reports, onMarkerClick, enableClustering = true }) => {
  // Default center for Jharkhand
  const defaultCenter = [23.3441, 85.3096];

  const validReports = reports.filter(
    report => report.location?.latitude && report.location?.longitude
  );

  // Render markers (used when clustering is disabled)
  const renderRegularMarkers = () => {
    return validReports.map((report) => {
      const lat = report.location.latitude;
      const lng = report.location.longitude;
      return (
        <Marker
          key={report.id}
          position={[lat, lng]}
          icon={createCustomIcon(getMarkerColor(report.status))}
        >
          <Popup>
            <Box sx={{ minWidth: 250 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {report.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {report.description?.substring(0, 100)}...
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={getStatusLabel(report.status)}
                  color={getStatusColor(report.status)}
                  size="small"
                />
                <Chip
                  label={report.category}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Reporter: {report.reporterId?.name || 'Anonymous'}
              </Typography>
              <Typography variant="caption" display="block">
                Date: {new Date(report.createdAt).toLocaleDateString()}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <button
                  onClick={() => onMarkerClick && onMarkerClick(report)}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}
                >
                  View Details
                </button>
              </Box>
            </Box>
          </Popup>
        </Marker>
      );
    });
  };

  // Render clustered markers
  const renderClusteredMarkers = () => {
    return validReports.map((report) => {
      const lat = report.location.latitude;
      const lng = report.location.longitude;

      // Create popup content as JSX
      const popupContent = (
        <Box sx={{ minWidth: 250 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {report.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {report.description?.substring(0, 100)}...
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={getStatusLabel(report.status)}
              color={getStatusColor(report.status)}
              size="small"
            />
            <Chip
              label={report.category}
              size="small"
              variant="outlined"
            />
          </Box>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Reporter: {report.reporterId?.name || 'Anonymous'}
          </Typography>
          <Typography variant="caption" display="block">
            Date: {new Date(report.createdAt).toLocaleDateString()}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <button
              onClick={() => onMarkerClick && onMarkerClick(report)}
              style={{
                width: '100%',
                padding: '8px 16px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              View Details
            </button>
          </Box>
        </Box>
      );

      return (
        <ClusterMarker
          key={report.id}
          position={[lat, lng]}
          icon={createCustomIcon(getMarkerColor(report.status))}
          reportStatus={report.status}
          report={report}
        >
          {popupContent}
        </ClusterMarker>
      );
    });
  };

  return (
    <Box sx={{ height: '600px', width: '100%', borderRadius: 2, overflow: 'hidden' }}>
      <MapContainer
        center={defaultCenter}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds reports={validReports} />
        {enableClustering ? (
          <MarkerClusterGroup>
            {renderClusteredMarkers()}
          </MarkerClusterGroup>
        ) : (
          renderRegularMarkers()
        )}
      </MapContainer>
    </Box>
  );
};

export default MapView;