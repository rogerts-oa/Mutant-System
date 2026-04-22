const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

router.post('/register', memberController.registerMember);
router.post('/renew', memberController.renewMembership);
router.get('/', memberController.getAllMembers);

module.exports = router;
