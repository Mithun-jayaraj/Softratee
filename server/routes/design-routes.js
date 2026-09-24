const express = require('express');
const router = express.Router();
const {
  getDesigns,
  createDesign,
  deleteDesign,
} = require('../controllers/design-controller');
const { protect, admin } = require('../middleware/auth-middleware');
router.route('/').get(getDesigns).post(protect, admin, createDesign);
router.route('/:id').delete(protect, admin, deleteDesign);
module.exports = router;
