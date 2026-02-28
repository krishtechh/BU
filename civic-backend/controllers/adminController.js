const { Prisma } = require('@prisma/client');
const prisma = require('../config/db');

/* ================= DASHBOARD STATS ================= */

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalReports,
      totalUsers,
      todayReports,
      pendingReports,
      resolvedReports,
      activeStaff,
      statusCounts,
      recentReports
    ] = await Promise.all([
      prisma.report.count({ where: { isDeleted: false } }),
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.report.count({
        where: { isDeleted: false, createdAt: { gte: today } }
      }),
      prisma.report.count({
        where: {
          isDeleted: false,
          status: { notIn: ['resolved', 'rejected', 'closed'] }
        }
      }),
      prisma.report.count({
        where: { isDeleted: false, status: 'resolved' }
      }),
      prisma.user.count({
        where: {
          isDeleted: false,
          role: { in: ['staff', 'supervisor'] },
          isActive: true
        }
      }),
      prisma.report.groupBy({
        by: ['status'],
        where: { isDeleted: false },
        _count: { _all: true }
      }),
      prisma.report.findMany({
        where: { isDeleted: false },
        include: {
          reporter: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 6
      })
    ]);

    const resolutionRate =
      totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalReports,
          todayReports,
          pendingReports,
          resolvedReports,
          totalUsers,
          activeStaff,
          resolutionRate: Number(resolutionRate.toFixed(2)),
          statusCounts: Object.fromEntries(
            statusCounts.map(s => [s.status, s._count._all])
          )
        },
        recentReports
      }
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/* ================= REPORT ANALYTICS ================= */

exports.getReportAnalytics = async (req, res) => {
  try {
    const { timeRange } = req.query;
    const where = { isDeleted: false };

    if (timeRange && timeRange !== "all") {
      const days = parseInt(timeRange);
      const date = new Date();
      date.setDate(date.getDate() - days);
      where.createdAt = { gte: date };
    }

    const categoryStats = await prisma.report.groupBy({
      by: ['category'],
      where,
      _count: { _all: true }
    });

    const timeline = await prisma.report.groupBy({
      by: ['createdAt'],
      where,
      _count: { _all: true }
    });

    res.status(200).json({
      success: true,
      data: {
        categories: categoryStats.map(c => ({
          id: c.category || "Unknown",
          count: c._count._all
        })),
        timeline: timeline.map(t => ({
          _id: t.createdAt,
          total: t._count._all
        }))
      }
    });

  } catch (error) {
    console.error("Report analytics error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/* ================= USER ANALYTICS ================= */

exports.getUserAnalytics = async (req, res) => {
  try {
    const { timeRange } = req.query;
    const where = { isDeleted: false };

    const registrationTrend = await prisma.user.groupBy({
      by: ['createdAt'],
      where,
      _count: { _all: true }
    });

    const topReporters = await prisma.report.groupBy({
      by: ['reporterId'],
      where: { isDeleted: false },
      _count: { reporterId: true },
      orderBy: { _count: { reporterId: "desc" } },
      take: 10
    });

    const reporterIds = topReporters.map(r => r.reporterId);

    const reporters = await prisma.user.findMany({
      where: { id: { in: reporterIds } },
      select: { id: true, name: true }
    });

    const reporterMap = Object.fromEntries(
      reporters.map(r => [r.id, r.name])
    );

    // Detailed user stats by role
    const userStats = await Promise.all(
      ['admin', 'supervisor', 'staff', 'citizen'].map(async (role) => {
        const [count, active, verified] = await Promise.all([
          prisma.user.count({ where: { role, isDeleted: false } }),
          prisma.user.count({ where: { role, isDeleted: false, isActive: true } }),
          prisma.user.count({ where: { role, isDeleted: false, isVerified: true } })
        ]);
        return { id: role, count, active, verified };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        userStats,
        registrationTrend: registrationTrend.map(r => ({
          _id: r.createdAt,
          count: r._count._all
        })),
        topReporters: topReporters.map(r => ({
          name: reporterMap[r.reporterId] || "Unknown",
          reportCount: r._count.reporterId
        }))
      }
    });

  } catch (error) {
    console.error("User analytics error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/* ================= PERFORMANCE ================= */

exports.getPerformanceMetrics = async (req, res) => {
  try {
    const avg = await prisma.report.aggregate({
      where: { status: "resolved", isDeleted: false },
      _avg: { actualResolutionTime: true }
    });

    res.status(200).json({
      success: true,
      data: {
        averageResolutionTimeHours: avg._avg.actualResolutionTime || 0
      }
    });

  } catch (error) {
    console.error("Performance metrics error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/* ================= DEPARTMENTS ================= */

exports.getDepartments = async (req, res) => {
  console.log('GET /api/admin/departments - Fetching departments');
  try {
    const departments = await prisma.department.findMany({
      where: { isDeleted: false },
      include: {
        headOfDepartment: { select: { id: true, name: true } }
      }
    });

    res.status(200).json({ success: true, data: departments });

  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.createDepartment = async (req, res) => {
  try {
    const department = await prisma.department.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department
    });

  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateDepartment = async (req, res) => {
  try {
    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department
    });

  } catch (error) {
    console.error("Update department error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.deleteDepartment = async (req, res) => {
  try {
    await prisma.department.update({
      where: { id: req.params.id },
      data: { isDeleted: true, isActive: false }
    });

    res.status(200).json({
      success: true,
      message: "Department deleted successfully"
    });

  } catch (error) {
    console.error("Delete department error:", error);
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
      select: { id: true, name: true, role: true, email: true }
    });

    res.status(200).json({ success: true, data: users });

  } catch (error) {
    console.error("Get department users error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.assignAreaToStaff = async (req, res) => {
  try {
    const { userId, area } = req.body;

    if (!userId || !area) {
      return res.status(400).json({
        success: false,
        message: "userId and area are required"
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { assignedArea: area }
    });

    res.status(200).json({
      success: true,
      message: "Area assigned successfully",
      data: user
    });

  } catch (error) {
    console.error("Assign area error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.createStaffUser = async (req, res) => {
  try {
    const { name, email, password, departmentName, department } = req.body;
    const finalDeptName = departmentName || department;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // make sure you're hashing in real app
        role: "staff",
        departmentName: finalDeptName,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Staff user created successfully",
      data: user
    });

  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};