const jwt = require('jsonwebtoken');
const { prisma } = require('../utils/prisma');

exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Check if it's an API key (starts with nyay_)
  if (token.startsWith('nyay_')) {
    return exports.authenticateApiKey(token, req, res, next);
  }

  // Otherwise treat as JWT
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

exports.authenticateApiKey = async (apiKey, req, res, next) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { apiKey },
      include: {
        members: {
          where: { role: 'OWNER' },
          include: {
            user: { select: { id: true, email: true, role: true } },
          },
          take: 1,
        },
      },
    });

    if (!organization) {
      return res.status(401).json({ success: false, message: 'Invalid API key' });
    }

    if (!organization.isActive) {
      return res.status(403).json({ success: false, message: 'Organization is inactive' });
    }

    // Attach org context — use owner's user ID for audit logs
    const owner = organization.members[0]?.user;
    req.user = {
      id: owner?.id,
      role: owner?.role || 'ORG_ADMIN',
      organizationId: organization.id,
      orgName: organization.name,
      orgPlan: organization.plan,
      isApiKeyAuth: true,
    };

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'API key authentication failed' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
};