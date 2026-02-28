const prisma = require('../config/db');

exports.getAllUsers = async (req, res) => {
  console.log('GET /api/users - Fetching all users', { query: req.query, user: req.user?.email });
  try {
    const { page = 1, limit = 100, role, isActive } = req.query;

    const where = { isDeleted: false };

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        departmentName: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit === 'all' ? undefined : parseInt(limit),
      skip: limit === 'all' ? 0 : (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await prisma.user.count({ where });

    // Ensure frontend compatibility by mapping departmentName to department
    const formattedUsers = users.map(u => ({
      ...u,
      department: u.departmentName
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers,
      pagination: {
        page: parseInt(page),
        limit: limit === 'all' ? total : parseInt(limit),
        total,
        pages: limit === 'all' ? 1 : Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, department, assignedArea } = req.body;

    const updateData = {
      updatedById: req.user.id
    };

    if (role) updateData.role = role;
    if (department) updateData.departmentName = department;
    if (assignedArea) updateData.assignedArea = assignedArea;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData
    });

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        isActive: false,
        updatedById: req.user.id
      }
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isActive: true,
        updatedById: req.user.id
      }
    });

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating user',
      error: error.message
    });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isActive: false,
        updatedById: req.user.id
      }
    });

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
};
