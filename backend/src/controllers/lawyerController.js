const { prisma } = require('../utils/prisma');

// GET /api/v1/lawyers
exports.listLawyers = async (req, res, next) => {
  try {
    const {
      city, state, specialization, language,
      minFee, maxFee,
      page = 1, limit = 10,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isVerified: true,
    };

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };
    if (specialization) where.specializations = { has: specialization };
    if (language) where.languages = { has: language };
    if (minFee || maxFee) {
      where.consultationFee = {};
      if (minFee) where.consultationFee.gte = parseFloat(minFee);
      if (maxFee) where.consultationFee.lte = parseFloat(maxFee);
    }

    const [lawyers, total] = await Promise.all([
      prisma.lawyerProfile.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [{ rating: 'desc' }, { totalReviews: 'desc' }],
        include: {
          user: {
            select: { id: true, email: true, isVerified: true },
          },
        },
      }),
      prisma.lawyerProfile.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        lawyers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/lawyers/:id
exports.getLawyer = async (req, res, next) => {
  try {
    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!lawyer) {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }

    res.json({ success: true, data: { lawyer } });
  } catch (error) {
    next(error);
  }
};