const express = require('express');

const resetPasswordController = require('../controller/forgotpassword');


const router = express.Router();

router.post('/forgotpassword', resetPasswordController.forgotPassword);

router.get('/updatepassword/:resetpasswordid', resetPasswordController.updatePassword)

router.get('/resetpassword/:id', resetPasswordController.resetPassword)

module.exports = router;