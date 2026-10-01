const express = require('express');
const router = express.Router();
const parcelController = require('../controllers/parcel.controller');
// const { verifyToken } = require('../middleware/auth');

// We can add verifyToken middleware here later
router.get('/', parcelController.getAllParcels);
router.get('/search', parcelController.searchParcel);

module.exports = router;
