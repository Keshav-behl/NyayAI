const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
};

// Only CLIENT and LAWYER are self-serve roles. ORG_ADMIN is granted via
// organization membership and SUPER_ADMIN is provisioned out-of-band
// (backend/prisma/createAdminUser.js) — neither should be settable from a
// public request body.
const SELF_SERVE_ROLES = ['CLIENT', 'LAWYER'];

exports.register = async (req, res, next) => {
  try {
    const { email, password, role = 'CLIENT' } = req.body;
    if (!SELF_SERVE_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, role },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    logger.info(`New user registered: ${email} (${role})`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, passwordHash: true, isActive: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    logger.info(`User logged in: ${email}`);

    const { passwordHash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: safeUser, accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(stored.user.id, stored.user.role);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: stored.user.id, expiresAt },
    });

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        profile: true,
        lawyerProfile: true,
      },
    });
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};