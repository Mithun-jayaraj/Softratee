const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  generateOtp,
  verifyOtp,
  resetPassword,
} = require('../controllers/auth-controller');
const { protect, admin } = require('../middleware/auth-middleware');

router.post('/generate-otp', generateOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.route('/').get(protect, admin, getUsers);
router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);
module.exports = router;
