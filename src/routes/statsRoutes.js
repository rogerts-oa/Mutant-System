const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/live', statsController.getLiveCount);
router.get('/history', statsController.getAttendanceHistory);
router.get('/peak-hours', statsController.getPeakHours);
router.get('/income', statsController.getIncomeMetrics);
router.get('/config', statsController.getConfig);
router.post('/config', statsController.updateConfig);
router.get('/planes', statsController.getPlanes);
router.put('/planes/:id', statsController.updatePlan);
router.get('/logs', statsController.getRecentAccessLogs);
router.get('/export', statsController.exportAttendanceToCSV);

module.exports = router;
