const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/live', statsController.getLiveCount);
router.get('/history', statsController.getAttendanceHistory);
router.get('/peak-hours', statsController.getPeakHours);
router.get('/income', statsController.getIncomeMetrics);

module.exports = router;
