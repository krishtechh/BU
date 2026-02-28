const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const reportController = require('../controllers/reportController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const demoProtection = require('../middleware/demoProtection');

const validateReport = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('location.address').notEmpty().withMessage('Location address is required'),
  body('location.latitude').isNumeric().withMessage('Valid latitude is required'),
  body('location.longitude').isNumeric().withMessage('Valid longitude is required')
];

router.get('/', optionalAuth, reportController.getAllReports);
router.get('/my-reports', protect, reportController.getMyReports);
router.get('/nearby', optionalAuth, reportController.getNearbyReports);
router.get('/stats', reportController.getReportStats);
router.get('/:id', optionalAuth, reportController.getReportById);

router.post('/', optionalAuth, upload.array('media', 5), validateReport, reportController.createReport);
router.put('/:id', protect, demoProtection, reportController.updateReport);
router.delete('/:id', protect, authorize('admin'), demoProtection, reportController.deleteReport);

router.patch('/:id/status', protect, authorize('staff', 'supervisor', 'admin', 'demo'), demoProtection, reportController.updateReportStatus);
router.post('/:id/assign', protect, authorize('supervisor', 'admin'), demoProtection, reportController.assignReport);
router.post('/:id/comment', protect, demoProtection, reportController.addComment);
router.post('/:id/upvote', protect, demoProtection, reportController.upvoteReport);
router.post('/:id/feedback', protect, demoProtection, reportController.addFeedback);

router.post('/:id/media', protect, upload.array('media', 5), demoProtection, reportController.addMedia);
router.delete('/:id/media/:mediaId', protect, demoProtection, reportController.deleteMedia);

module.exports = router;