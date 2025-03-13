const express = require('express');

const userController = require('../controller/user');

const authenticatemiddleware = require('../middleware/auth');
const expenseController = require('../controller/expense')

const router = express.Router();


router.post('/signup', userController.signup);

router.post('/login', userController.login)

router.get('/download', authenticatemiddleware.authenticate, expenseController.downloadexpense);

router.get("/checkPremiumStatus", authenticatemiddleware.authenticate, userController.checkPremiumStatus);

module.exports = router;