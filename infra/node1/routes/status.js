
const express = require('express');
const { getStatus } = require('../controllers/statusController');
const authenticate = require('../middlewares/auth');
const router = express.Router();

router.get('/', authenticate, getStatus);

module.exports = router;
