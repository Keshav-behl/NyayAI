const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');

// GET /api/v1/consultations
exports.listConsultations = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;

    const where = role === 'LAWYER'
      ? { lawyer: { userId } }
      : { clientId: userId };

    const consultations = await prisma.consultation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, phone: true } },
          },
        },
        lawyer: {
          select: {
            id: true,
            fullName: true,
            consultationFee: true,
            city: true,
            state: true,
          },
        },
      },
    });

    res.json({ success: true, data: { consultations } });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/consultations
exports.bookConsultation = async (req, res, next) => {
  try {
    const { lawyerId, type, scheduledAt, notes } = req.body;

    // Verify lawyer exists and is available
    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }

    if (!lawyer.isAvailable) {
      return res.status(400).json({ success: false, message: 'Lawyer is not available' });
    }

    // Check for conflicting booking (same lawyer, same time ± 1 hour)
    const scheduledDate = new Date(scheduledAt);
    const oneHourBefore = new Date(scheduledDate.getTime() - 60 * 60 * 1000);
    const oneHourAfter = new Date(scheduledDate.getTime() + 60 * 60 * 1000);

    const conflict = await prisma.consultation.findFirst({
      where: {
        lawyerId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: { gte: oneHourBefore, lte: oneHourAfter },
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Lawyer already has a booking around that time. Please choose a different slot.',
      });
    }

    const consultation = await prisma.consultation.create({
      data: {
        clientId: req.user.id,
        lawyerId,
        type,
        scheduledAt: scheduledDate,
        notes,
        amount: lawyer.consultationFee,
        status: 'PENDING',
      },
      include: {
        lawyer: {
          select: { fullName: true, consultationFee: true },
        },
      },
    });

    logger.info(`Consultation booked: ${consultation.id}`);

    res.status(201).json({
      success: true,
      message: 'Consultation booked successfully',
      data: { consultation },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/consultations/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id: userId, role } = req.user;

    const consultation = await prisma.consultation.findUnique({
      where: { id: req.params.id },
      include: { lawyer: true },
    });

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    // Only client can cancel, only lawyer can confirm/complete
    if (status === 'CANCELLED' && consultation.clientId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the client can cancel' });
    }
    if (['CONFIRMED', 'COMPLETED'].includes(status) && consultation.lawyer.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the lawyer can confirm or complete' });
    }

    const updated = await prisma.consultation.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({
      success: true,
      message: `Consultation ${status.toLowerCase()}`,
      data: { consultation: updated },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/consultations/:id/review
exports.submitReview = async (req, res, next) => {
  try {
    const { rating, review } = req.body;

    const consultation = await prisma.consultation.findUnique({
      where: { id: req.params.id },
    });

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    if (consultation.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (consultation.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Can only review completed consultations' });
    }

    if (consultation.clientRating) {
      return res.status(409).json({ success: false, message: 'Already reviewed' });
    }

    // Update consultation with review
    await prisma.consultation.update({
      where: { id: req.params.id },
      data: { clientRating: rating, clientReview: review },
    });

    // Recalculate lawyer rating
    const allRatings = await prisma.consultation.findMany({
      where: { lawyerId: consultation.lawyerId, clientRating: { not: null } },
      select: { clientRating: true },
    });

    const avgRating = allRatings.reduce((sum, c) => sum + c.clientRating, 0) / allRatings.length;

    await prisma.lawyerProfile.update({
      where: { id: consultation.lawyerId },
      data: {
        rating: avgRating,
        totalReviews: allRatings.length,
      },
    });

    res.json({ success: true, message: 'Review submitted successfully' });
  } catch (error) {
    next(error);
  }
};