const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  getUserDetails,
  toggleUserStatus,
  getReports,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);
router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/reports', getReports);

module.exports = router;
