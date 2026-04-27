const { prisma } = require('../utils/prisma');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Generate a secure API key
const generateApiKey = () => {
  const prefix = 'nyay';
  const secret = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${secret}`;
};

// GET /api/v1/organizations/mine
exports.getMyOrganizations = async (req, res, next) => {
  try {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: req.user.id },
      include: {
        organization: {
          include: {
            members: {
              select: {
                id: true,
                role: true,
                joinedAt: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    profile: { select: { fullName: true } },
                    lawyerProfile: { select: { fullName: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const organizations = memberships.map(m => ({
      ...m.organization,
      myRole: m.role,
    }));

    res.json({ success: true, data: { organizations } });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/organizations
exports.createOrganization = async (req, res, next) => {
  try {
    const { name, type, email, phone, city, state, gstin } = req.body;

    // Check if user already owns an org with same name
    const existing = await prisma.organization.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        members: { some: { userId: req.user.id, role: 'OWNER' } },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You already have an organization with this name',
      });
    }

    // Create org + make creator the OWNER in a transaction
    const organization = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name,
          type,
          email,
          phone,
          city,
          state,
          gstin,
          plan: 'STARTER',
          isActive: true,
          apiKey: generateApiKey(),
        },
      });

      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: req.user.id,
          role: 'OWNER',
        },
      });

      return org;
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'ORG_CREATED',
        entity: 'organization',
        entityId: organization.id,
        metadata: { name, type },
      },
    });

    logger.info(`Organization created: ${organization.id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: { organization },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/organizations/:id
exports.getOrganization = async (req, res, next) => {
  try {
    // Security: verify user is a member of this org
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: req.params.id,
          userId: req.user.id,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this organization',
      });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                profile: { select: { fullName: true, phone: true } },
                lawyerProfile: { select: { fullName: true } },
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    // Security: hide API key from non-owners
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      organization.apiKey = null;
    }

    res.json({
      success: true,
      data: { organization, myRole: membership.role },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/organizations/:id
exports.updateOrganization = async (req, res, next) => {
  try {
    // Security: only OWNER or ADMIN can update
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: req.params.id,
          userId: req.user.id,
        },
      },
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only organization owners and admins can update organization details',
      });
    }

    const { name, email, phone, city, state, gstin } = req.body;

    const organization = await prisma.organization.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(gstin !== undefined && { gstin }),
      },
    });

    logger.info(`Organization updated: ${req.params.id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization },
    });
  } catch (error) {
    next(error);
  }
};