const express = require('express');

const purchaseController = require('../controller/purchase');

const authenticatemiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/purchasepremium', authenticatemiddleware.authenticate,purchaseController.purchasepremium);

router.post('/update-transaction', authenticatemiddleware.authenticate, purchaseController.checkPaymentStatus);

//router.put('/updatetransactionstatus', authenticatemiddleware.authenticate, purchaseController.updateTransactionStatus)

module.exports = router;