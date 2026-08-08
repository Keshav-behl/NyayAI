const { prisma } = require('../utils/prisma');

exports.getIngestionStatus = async (req, res, next) => {
  try {
    const acts = await prisma.ingestionStatus.findMany({
      orderBy: [{ namespace: 'asc' }, { shortTitle: 'asc' }],
    });

    const actsIngested = acts.filter((a) => a.stage === 'INGESTED').length;
    const sectionsIngested = acts.reduce((sum, a) => sum + a.sectionsIngested, 0);
    const sectionsTargetKnown = acts.every((a) => a.sectionsTarget != null);
    const sectionsTarget = sectionsTargetKnown
      ? acts.reduce((sum, a) => sum + (a.sectionsTarget || 0), 0)
      : null;

    res.json({
      success: true,
      data: {
        acts,
        summary: {
          actsTotal: acts.length,
          actsIngested,
          sectionsIngested,
          sectionsTarget,
          mvpReady: acts.length > 0 && actsIngested === acts.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
