const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');

// GET /api/v1/users/profile
exports.getProfile = async (req, res, next) => {
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

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, city, state, preferredLanguage } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile;

    if (user.profile) {
      // Update existing profile
      profile = await prisma.clientProfile.update({
        where: { userId: req.user.id },
        data: {
          ...(fullName && { fullName }),
          ...(phone && { phone }),
          ...(city && { city }),
          ...(state && { state }),
          ...(preferredLanguage && { preferredLanguage }),
        },
      });
    } else {
      // Create profile if it doesn't exist
      profile = await prisma.clientProfile.create({
        data: {
          userId: req.user.id,
          fullName: fullName || '',
          phone,
          city,
          state,
          preferredLanguage: preferredLanguage || 'en',
        },
      });
    }

    logger.info(`Profile updated for user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/users/lawyer-profile
exports.updateLawyerProfile = async (req, res, next) => {
  try {
    const {
      fullName, bio, consultationFee, experienceYears,
      specializations, languages, city, state, isAvailable,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { lawyerProfile: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.lawyerProfile) {
      return res.status(404).json({ success: false, message: 'Lawyer profile not found. Contact support.' });
    }

    const lawyerProfile = await prisma.lawyerProfile.update({
      where: { userId: req.user.id },
      data: {
        ...(fullName && { fullName }),
        ...(bio !== undefined && { bio }),
        ...(consultationFee !== undefined && { consultationFee }),
        ...(experienceYears !== undefined && { experienceYears }),
        ...(specializations && { specializations }),
        ...(languages && { languages }),
        ...(city && { city }),
        ...(state && { state }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    logger.info(`Lawyer profile updated for user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Lawyer profile updated successfully',
      data: { lawyerProfile },
    });
  } catch (error) {
    next(error);
  }
};