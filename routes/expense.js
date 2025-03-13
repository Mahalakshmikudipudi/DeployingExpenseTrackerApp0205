const express = require('express');

const expenseController = require('../controller/expense')
const userauthentication = require('../middleware/auth');


const router = express.Router();

router.post('/addexpense', userauthentication.authenticate,   expenseController.addexpense )

router.get('/getexpenses', userauthentication.authenticate,  expenseController.getexpenses )

router.get('/expenses', expenseController.getExpenses);

router.delete('/deleteexpenses/:expenseid', userauthentication.authenticate, expenseController.deleteexpense)

module.exports = router;