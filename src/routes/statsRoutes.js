const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/attendance', statsController.getRealTimeAttendance);
router.get('/peak-hours', statsController.getPeakHours);
router.get('/income', statsController.getIncomeMetrics);

module.exports = router;
