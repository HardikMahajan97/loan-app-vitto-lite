import { Router } from 'express';
import { query as db } from '../db/pool.js';
import {
  validateCreateApplication,
  validateListApplications,
  validateUpdateStatus,
} from '../middleware/validators.js';
import { sendApplicationConfirmationEmail } from '../utils/mailer.js';

const router = Router();

// Submit a new loan application
router.post('/', validateCreateApplication, async (req, res, next) => {
  try {
    const { name, mobile, amount, purpose, language, email } = req.body;

    const result = await db(
      `INSERT INTO applications (name, mobile, amount, purpose, language, email)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name.trim(), mobile.trim(), parseFloat(amount), purpose.trim(), language, email?.trim() || null]
    );

    const application = result.rows[0];

    // Fire-and-forget email — async, never awaited
    sendApplicationConfirmationEmail(application);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: application,
    });
  } catch (err) {
    next(err);
  }
});

// List applications with filters + pagination
router.get('/', validateListApplications, async (req, res, next) => {
  try {
    const {
      status,
      language,
      search,
      minAmount,
      maxAmount,
      from,
      to,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const SORT_COLUMN_MAP = {
      created_at: 'created_at',
      amount: 'amount',
      name: 'name',
      status: 'status',
    };

    const sortCol = SORT_COLUMN_MAP[sortBy] || 'created_at';
    const sortDir = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (status) {
      conditions.push(`status = $${paramIdx++}::application_status`);
      params.push(status);
    }

    if (language) {
      conditions.push(`language = $${paramIdx++}::preferred_language`);
      params.push(language);
    }

    if (search) {
      // Search by name (ILIKE) or exact mobile match
      conditions.push(`(name ILIKE $${paramIdx} OR mobile = $${paramIdx + 1})`);
      params.push(`%${search}%`, search.trim());
      paramIdx += 2;
    }

    if (minAmount) {
      conditions.push(`amount >= $${paramIdx++}`);
      params.push(parseFloat(minAmount));
    }

    if (maxAmount) {
      conditions.push(`amount <= $${paramIdx++}`);
      params.push(parseFloat(maxAmount));
    }

    if (from) {
      conditions.push(`created_at >= $${paramIdx++}`);
      params.push(new Date(from).toISOString());
    }

    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      conditions.push(`created_at <= $${paramIdx++}`);
      params.push(toDate.toISOString());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count query
    const countResult = await db(
      `SELECT COUNT(*) AS total FROM applications ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Data query with pagination
    const dataResult = await db(
      `SELECT id, name, mobile, amount, purpose, language, status, email, created_at, updated_at
       FROM applications
       ${whereClause}
       ORDER BY ${sortCol} ${sortDir}
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      success: true,
      data: dataResult.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
});


// Single application detail
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid application ID format.' });
    }

    const result = await db(`SELECT * FROM applications WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Update application status
router.patch('/:id/status', validateUpdateStatus, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // First fetch existing record
    const existing = await db(`SELECT * FROM applications WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const current = existing.rows[0];

    if (current.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: `Cannot update status. Application is already ${current.status}.`,
        code: 'INVALID_STATUS_TRANSITION',
      });
    }

    const updated = await db(
      `UPDATE applications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    return res.status(200).json({
      success: true,
      message: `Application ${status} successfully.`,
      data: updated.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
