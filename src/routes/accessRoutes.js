const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');

router.post('/check', accessController.processAccess);

module.exports = router;
