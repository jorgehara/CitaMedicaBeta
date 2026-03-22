const express = require('express');
const router = express.Router();
const clinicalHistoryController = require('../controllers/clinicalHistoryController');
const followUpController = require('../controllers/followUpController');
const { flexibleAuth } = require('../middleware/flexibleAuth');

// All routes use flexibleAuth (API Key OR JWT)

// Get Helkimo classification (Task 2.7)
router.get('/:id/helkimo', flexibleAuth, clinicalHistoryController.getHelkimoClassification);

// Get follow-ups by clinical history (Task 2.10)
router.get('/:historyId/follow-ups', flexibleAuth, followUpController.getFollowUpsByClinicalHistory);

// CRUD operations
router.get('/', flexibleAuth, clinicalHistoryController.getAllClinicalHistories);
router.get('/:id', flexibleAuth, clinicalHistoryController.getClinicalHistoryById);
router.post('/', flexibleAuth, clinicalHistoryController.createClinicalHistory);
router.put('/:id', flexibleAuth, clinicalHistoryController.updateClinicalHistory);
router.delete('/:id', flexibleAuth, clinicalHistoryController.deleteClinicalHistory);

module.exports = router;
