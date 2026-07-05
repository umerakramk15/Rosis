const router = require('express').Router();
const ctrl = require('../controllers/searchController');
const { verifyJWT } = require('../middleware/auth.middleware');
const { body, query } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// ── Keyword Search (public) ───────────────────────────────────────────
router.get('/',
  [
    query('q').trim().notEmpty().withMessage('Search query is required'),
    validate,
  ],
  ctrl.keywordSearch                   // GET /api/search?q=blue+shirt
);

// ── Visual Search (requires login) ───────────────────────────────────
router.post('/visual',
  verifyJWT,
  [
    body('imageBase64').notEmpty().withMessage('Image data is required'),
    validate,
  ],
  ctrl.visualSearch                    // POST /api/search/visual
);

// ── LLM Smart Search (requires login) ────────────────────────────────
router.post('/llm',
  verifyJWT,
  [
    body('query').trim()
      .notEmpty().withMessage('Query is required')
      .isLength({ min: 2, max: 500 }).withMessage('Query must be 2-500 characters'),
    validate,
  ],
  ctrl.llmSearch                       // POST /api/search/llm
);

module.exports = router;
