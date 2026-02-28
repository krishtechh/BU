const prisma = require('../config/db');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

exports.createReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let {
      title,
      description,
      category,
      location,
      priority,
      isAnonymous
    } = req.body;

    // Handle location structure from different FormData formats
    if (!location && req.body['location[address]']) {
      location = {
        address: req.body['location[address]'],
        latitude: req.body['location[latitude]'],
        longitude: req.body['location[longitude]'],
        locality: req.body['location[locality]'],
        ward: req.body['location[ward]'],
        city: req.body['location[city]'],
        pincode: req.body['location[pincode]']
      };
    } else if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        console.warn('Failed to parse location string');
      }
    }

    if (!location || !location.address) {
      return res.status(400).json({
        success: false,
        message: 'Valid location address is required'
      });
    }

    let reporterId;

    if (req.user && req.user.id) {
      reporterId = req.user.id;
    } else {
      const whatsappUser = await prisma.user.findFirst({
        where: { email: 'whatsapp-bot@civicsetu.com' }
      });

      if (!whatsappUser) {
        const newUser = await prisma.user.create({
          data: {
            name: 'WhatsApp Bot',
            email: 'whatsapp-bot@civicsetu.com',
            phone: '0000000000',
            password: 'guest_password_not_used',
            role: 'citizen',
            isActive: true
          }
        });
        reporterId = newUser.id;
      } else {
        reporterId = whatsappUser.id;
      }
    }

    // Auto-route department
    let autoAssignedDept = null;
    try {
      const matchingDept = await prisma.department.findFirst({
        where: {
          isDeleted: false,
          isActive: true,
          categories: { has: category }
        },
        select: { name: true }
      });
      autoAssignedDept = matchingDept?.name || null;
    } catch (_) { }

    const report = await prisma.report.create({
      data: {
        reporterId,
        title,
        description,
        category,
        address: location.address,
        locality: location.locality || null,
        ward: location.ward || null,
        city: location.city || null,
        pincode: location.pincode || null,
        latitude: location.latitude ? parseFloat(location.latitude) : 0,
        longitude: location.longitude ? parseFloat(location.longitude) : 0,
        priority: priority || 'medium',
        isAnonymous: isAnonymous === 'true' || isAnonymous === true,
        department: autoAssignedDept,
        statusHistory: {
          create: {
            status: 'submitted',
            changedById: reporterId,
            comment: 'Report submitted'
          }
        }
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, phone: true }
        },
        media: true
      }
    });

    if (req.files && req.files.length > 0) {
      // Check if Cloudinary is configured
      const isCloudinaryConfigured =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_name';

      if (!isCloudinaryConfigured) {
        console.warn('⚠️ Cloudinary NOT configured correctly. Skipping file upload but report was created.');
      } else {
        const mediaPromises = req.files.map(async (file) => {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'civic-reports',
              resource_type: 'auto'
            });

            return prisma.media.create({
              data: {
                reportId: report.id,
                type: file.mimetype.startsWith('image') ? 'image' : 'video',
                url: result.secure_url,
                cloudinaryId: result.public_id,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                uploadedById: reporterId
              }
            });
          } catch (uploadError) {
            console.error('Individual file upload failed:', uploadError);
            return null;
          }
        });

        await Promise.all(mediaPromises);
      }
    }

    const finalReport = await prisma.report.findUnique({
      where: { id: report.id },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, phone: true }
        },
        media: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: finalReport
    });

  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const {
      page,
      limit,
      status,
      category,
      priority,
      department,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const where = { isDeleted: false };

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (department) where.department = department;

    const take = limit ? parseInt(limit) : undefined;
    const skip = (page && limit) ? (parseInt(page) - 1) * parseInt(limit) : undefined;

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, email: true, phone: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, departmentName: true }
        },
        media: true
      },
      orderBy: {
        [sortBy]: order
      },
      take,
      skip
    });

    const total = await prisma.report.count({ where });

    const response = {
      success: true,
      data: reports
    };

    if (page && limit) {
      response.pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      };
    } else {
      response.total = total;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    const report = await prisma.report.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, phone: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, departmentName: true }
        },
        media: true,
        comments: {
          include: {
            user: { select: { id: true, name: true, role: true } }
          }
        },
        statusHistory: {
          include: {
            changedBy: { select: { id: true, name: true, role: true } }
          },
          orderBy: { changedAt: 'desc' }
        },
        _count: {
          select: { upvotes: true }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const where = {
      reporterId: req.user.id,
      isDeleted: false
    };

    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await prisma.report.findMany({
      where,
      include: {
        media: true,
        assignedTo: {
          select: { id: true, name: true, departmentName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: skip
    });

    const total = await prisma.report.count({ where });

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your reports',
      error: error.message
    });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.reporterId !== req.user.id &&
      !['admin', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    if (report.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update report after it has been processed'
      });
    }

    const { title, description, category, location, priority } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (priority) updateData.priority = priority;

    if (location) {
      if (location.address) updateData.address = location.address;
      if (location.locality) updateData.locality = location.locality;
      if (location.ward) updateData.ward = location.ward;
      if (location.city) updateData.city = location.city;
      if (location.pincode) updateData.pincode = location.pincode;
      if (location.latitude) updateData.latitude = parseFloat(location.latitude);
      if (location.longitude) updateData.longitude = parseFloat(location.longitude);
    }

    const updatedReport = await prisma.report.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        reporter: {
          select: { id: true, name: true, email: true, phone: true }
        },
        media: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: { media: true }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete reports'
      });
    }

    if (report.media && report.media.length > 0) {
      for (const m of report.media) {
        try {
          if (m.cloudinaryId) {
            await cloudinary.uploader.destroy(m.cloudinaryId);
          }
          await prisma.media.delete({ where: { id: m.id } });
        } catch (mediaError) {
          console.error('Error deleting media:', mediaError);
        }
      }
    }

    // Delete related records first due to constraints
    await prisma.reportStatusHistory.deleteMany({ where: { reportId: req.params.id } });
    await prisma.comment.deleteMany({ where: { reportId: req.params.id } });
    await prisma.upvote.deleteMany({ where: { reportId: req.params.id } });

    await prisma.report.delete({ where: { id: req.params.id } });

    res.status(200).json({
      success: true,
      message: 'Report permanently deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const oldStatus = report.status;
    const updateData = {
      status,
      statusHistory: {
        create: {
          status,
          changedById: req.user.id,
          comment: comment || `Status changed from ${oldStatus} to ${status}`
        }
      }
    };

    if (status === 'resolved') {
      updateData.resolvedById = req.user.id;
      updateData.resolvedAt = new Date();
      updateData.resolutionNotes = comment;

      const startTime = new Date(report.createdAt);
      const endTime = new Date();
      updateData.actualResolutionTime = Math.floor((endTime - startTime) / (1000 * 60 * 60));
    }

    const updatedReport = await prisma.report.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        statusHistory: {
          include: {
            changedBy: { select: { id: true, name: true, role: true } }
          },
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report status',
      error: error.message
    });
  }
};

exports.assignReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId, department } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const staff = await prisma.user.findUnique({
      where: { id: staffId }
    });

    if (!staff || !['staff', 'supervisor'].includes(staff.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff member'
      });
    }

    const updatedReport = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        assignedToId: staffId,
        assignedById: req.user.id,
        assignedAt: new Date(),
        department: department || staff.departmentName,
        status: 'assigned',
        statusHistory: {
          create: {
            status: 'assigned',
            changedById: req.user.id,
            comment: `Assigned to ${staff.name}`
          }
        }
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, departmentName: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Report assigned successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Assign report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning report',
      error: error.message
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text, isInternal } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const canAddInternalComment = ['staff', 'supervisor', 'admin'].includes(req.user.role);

    const comment = await prisma.comment.create({
      data: {
        reportId: req.params.id,
        userId: req.user.id,
        text,
        isInternal: canAddInternalComment && isInternal
      },
      include: {
        user: { select: { id: true, name: true, role: true } }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

exports.upvoteReport = async (req, res) => {
  try {
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        reportId_userId: {
          reportId: req.params.id,
          userId: req.user.id
        }
      }
    });

    if (existingUpvote) {
      await prisma.upvote.delete({
        where: { id: existingUpvote.id }
      });
    } else {
      await prisma.upvote.create({
        data: {
          reportId: req.params.id,
          userId: req.user.id
        }
      });
    }

    const upvoteCount = await prisma.upvote.count({
      where: { reportId: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: existingUpvote ? 'Upvote removed' : 'Report upvoted',
      data: { upvotes: upvoteCount }
    });
  } catch (error) {
    console.error('Upvote report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing upvote',
      error: error.message
    });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Valid rating (1-5) is required'
      });
    }

    const report = await prisma.report.findUnique({
      where: { id: req.params.id }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.reporterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the reporter can provide feedback'
      });
    }

    if (report.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be provided for resolved reports'
      });
    }

    const updatedReport = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        rating: parseInt(rating),
        feedbackComment: comment,
        feedbackSubmittedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        rating: updatedReport.rating,
        comment: updatedReport.feedbackComment,
        submittedAt: updatedReport.feedbackSubmittedAt
      }
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

exports.getNearbyReports = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInKm = parseFloat(radius);

    // Using Raw SQL for PostGIS/Geospatial queries in PostgreSQL
    const reports = await prisma.$queryRaw`
      SELECT *, 
      (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))) AS distance
      FROM "Report"
      WHERE "isDeleted" = false
      HAVING distance < ${radiusInKm}
      ORDER BY distance ASC
    `;

    res.status(200).json({
      success: true,
      data: reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Get nearby reports error:', error);
    // Fallback if the query above fails due to syntax or missing extensions
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby reports',
      error: error.message
    });
  }
};

exports.getReportStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = { isDeleted: false };
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const total = await prisma.report.count({ where });

    const byStatus = await prisma.report.groupBy({
      by: ['status'],
      where,
      _count: { _all: true }
    });

    const byCategory = await prisma.report.groupBy({
      by: ['category'],
      where,
      _count: { _all: true }
    });

    const byPriority = await prisma.report.groupBy({
      by: ['priority'],
      where,
      _count: { _all: true }
    });

    const avgResolution = await prisma.report.aggregate({
      where: { ...where, status: 'resolved' },
      _avg: { actualResolutionTime: true }
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        statusCounts: Object.fromEntries(byStatus.map(s => [s.status, s._count._all])),
        categoryCounts: Object.fromEntries(byCategory.map(c => [c.category, c._count._all])),
        priorityCounts: Object.fromEntries(byPriority.map(p => [p.priority, p._count._all])),
        avgResolutionTime: avgResolution._avg.actualResolutionTime || 0
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report statistics',
      error: error.message
    });
  }
};

exports.addMedia = async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No media files provided'
      });
    }

    const mediaPromises = req.files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'civic-reports',
        resource_type: 'auto'
      });

      return prisma.media.create({
        data: {
          reportId: report.id,
          type: file.mimetype.startsWith('image') ? 'image' : 'video',
          url: result.secure_url,
          cloudinaryId: result.public_id,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedById: req.user.id
        }
      });
    });

    await Promise.all(mediaPromises);

    const updatedReport = await prisma.report.findUnique({
      where: { id: report.id },
      include: { media: true }
    });

    res.status(200).json({
      success: true,
      message: 'Media added successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Add media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding media',
      error: error.message
    });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const { id, mediaId } = req.params;

    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    if (media.cloudinaryId) {
      await cloudinary.uploader.destroy(media.cloudinaryId);
    }

    await prisma.media.delete({
      where: { id: mediaId }
    });

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting media',
      error: error.message
    });
  }
};
