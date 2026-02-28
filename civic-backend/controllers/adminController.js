const prisma = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalReports,
      todayReports,
      pendingReports,
      resolvedReports,
      totalUsers,
      activeStaff,
      recentReports
    ] = await Promise.all([
      prisma.report.count({ where: { isDeleted: false } }),
      prisma.report.count({
        where: {
          isDeleted: false,
          createdAt: { gte: today }
        }
      }),
      prisma.report.count({
        where: {
          isDeleted: false,
          status: { in: ['submitted', 'acknowledged', 'assigned'] }
        }
      }),
      prisma.report.count({
        where: {
          isDeleted: false,
          status: 'resolved'
        }
      }),
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.user.count({
        where: {
          isDeleted: false,
          role: { in: ['staff', 'supervisor'] }
        }
      }),
      prisma.report.findMany({
        where: { isDeleted: false },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { name: true } },
          assignedTo: { select: { name: true } }
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalReports,
          todayReports,
          pendingReports,
          resolvedReports,
          totalUsers,
          activeStaff
        },
        recentReports
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

exports.getReportAnalytics = async (req, res) => {
  try {
    const categoryStats = await prisma.report.groupBy({
      by: ['category'],
      where: { isDeleted: false },
      _count: { _all: true }
    });

    res.status(200).json({
      success: true,
      data: categoryStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      where: { isDeleted: false },
      _count: { _all: true }
    });

    res.status(200).json({
      success: true,
      data: roleStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPerformanceMetrics = async (req, res) => {
  try {
    const avgResolution = await prisma.report.aggregate({
      where: { status: 'resolved', isDeleted: false },
      _avg: { actualResolutionTime: true }
    });

    res.status(200).json({
      success: true,
      data: {
        averageResolutionTimeHours: avgResolution._avg.actualResolutionTime || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignAreaToStaff = async (req, res) => {
  try {
    const { userId, area } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { assignedArea: area }
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStaffUser = async (req, res) => {
  // Implementation for creating staff
  res.status(501).json({ success: false, message: 'Not implemented yet' });
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: { isDeleted: false },
      include: {
        headOfDepartment: { select: { id: true, name: true } }
      }
    });

    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description, categories, headOfDepartmentId, contactEmail, contactPhone } = req.body;

    const department = await prisma.department.create({
      data: {
        name,
        code,
        description,
        categories,
        headOfDepartmentId,
        contactEmail,
        contactPhone
      }
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, code, description, categories, headOfDepartmentId, contactEmail, contactPhone, isActive } = req.body;

    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: {
        name,
        code,
        description,
        categories,
        headOfDepartmentId,
        contactEmail,
        contactPhone,
        isActive
      }
    });

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await prisma.department.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        isActive: false
      }
    });

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDepartmentUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        departmentName: req.params.deptName,
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        role: true,
        email: true
      }
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
