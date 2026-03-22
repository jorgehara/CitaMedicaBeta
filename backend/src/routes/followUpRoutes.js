const express = require('express');
const router = express.Router();
const followUpController = require('../controllers/followUpController');
const { flexibleAuth } = require('../middleware/flexibleAuth');

// All routes use flexibleAuth (API Key OR JWT)

// CRUD operations
router.get('/', flexibleAuth, followUpController.getAllFollowUps);
router.get('/:id', flexibleAuth, followUpController.getFollowUpById);
router.post('/', flexibleAuth, followUpController.createFollowUp);
router.put('/:id', flexibleAuth, followUpController.updateFollowUp);
router.delete('/:id', flexibleAuth, followUpController.deleteFollowUp);

module.exports = router;
