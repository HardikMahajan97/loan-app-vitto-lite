import { Router } from 'express';
import { query as db } from '../db/pool.js';

const router = Router();

// Dashboard statistics
router.get('/', async (req, res, next) => {
  try {
    const result = await db(`
      SELECT
        COUNT(*)::int AS total_applications,
        COALESCE(SUM(amount), 0)::numeric AS total_amount,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count,
        COUNT(*) FILTER (WHERE status = 'approved')::int AS approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_count,
        COALESCE(AVG(amount), 0)::numeric AS avg_amount,
        COALESCE(MAX(amount), 0)::numeric AS max_amount,
        COALESCE(MIN(amount), 0)::numeric AS min_amount,
        COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0)::numeric AS approved_amount,
        COUNT(DISTINCT mobile)::int AS unique_applicants
      FROM applications
    `);

    const langResult = await db(`
      SELECT language, COUNT(*)::int AS count
      FROM applications
      GROUP BY language
      ORDER BY count DESC
    `);

    const recentResult = await db(`
      SELECT DATE_TRUNC('day', created_at)::date AS date, COUNT(*)::int AS count
      FROM applications
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY 1
      ORDER BY 1
    `);

    return res.status(200).json({
      success: true,
      data: {
        ...result.rows[0],
        language_breakdown: langResult.rows,
        daily_trend: recentResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
