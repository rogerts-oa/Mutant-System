const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');

router.post('/check', accessController.processAccess);
router.post('/exit', accessController.processExit);

module.exports = router;
