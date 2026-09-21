import { dbService } from '../services/databaseService.js';

export async function getAdminAlerts(req, res, next) {
  try {
    const page =
      parseInt(req.query.page, 10) || 1;

    const limit =
      parseInt(req.query.limit, 10) || 20;

    const status = req.query.status;

    const result =
      await dbService.getAllAlerts({
        page,
        limit,
        status,
      });

    res.json({
      success: true,
      data: result.alerts,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminMetrics(req, res, next) {
  try {
    const metrics =
      await dbService.getAdminMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (err) {
    next(err);
  }
}